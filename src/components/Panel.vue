<template>
  <div
    ref="panel"
    class="panel"
    :style="cssStyle"
    :draggable="draggable"
    :dragging="dragging"
    :snapped="isSnapped()"
    :snaps="Array.from(state.snaps).join(' ')"
    @mousedown.prevent="startDrag"
    @touchstart.prevent="startDrag"
  >
    <slot />
  </div>
</template>

<script>
import {
  getCursorPositionFromEvent,
  getElementPosition,
  getElementSize,
  limitPosition,
} from '../utils'

// Available snaps
export const snaps = {
  horizontalCenter: 'horizontal-center',
  verticalCenter: 'vertical-center',
  topEdge: 'top-edge',
  leftEdge: 'left-edge',
  bottomEdge: 'bottom-edge',
  rightEdge: 'right-edge',
}

export default {
  props: {
    // Position

    left: {
      type: Number,
      required: false,
      default: undefined,
    },

    right: {
      type: Number,
      required: false,
      default: undefined,
    },

    top: {
      type: Number,
      required: false,
      default: undefined,
    },

    bottom: {
      type: Number,
      required: false,
      default: undefined,
    },

    // Snaps

    snaps: {
      type: Array,
      required: false,
      default() {
        return []
      },
      validator(value) {
        for (const snap of value) {
          if (!Object.values(snaps).includes(snap)) {
            return false
          }
        }
        return true
      }
    },

    // Snap options

    snap: {
      type: [Boolean, Array],
      required: false,
      default: false,
      validator(value) {
        if (typeof value === 'object') {
          for (const snap of value) {
            if (!Object.values(snaps).includes(snap)) {
              return false
            }
          }
        }
        return true
      }
    },

    snapThreshold: {
      type: Number,
      required: false,
      default: 10,
    },

    // State options

    locked: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      state: {
        // Position
        left: this.left,
        right: this.right,
        top: this.top,
        bottom: this.bottom,

        // State
        snaps: new Set(this.snaps),
        locked: this.locked,
      },

      width: undefined,
      height: undefined,

      draggable: !this.locked,
      dragging: false,

      cursor: {
        dx: undefined,
        dy: undefined,
      }
    }
  },

  computed: {
    cssStyle() {
      let style = {}

      // X-axis position
      if (this.isSnapped(snaps.horizontalCenter)) {
        style['left'] = `calc(50% - ${this.width / 2}px)`
      } else if (this.isSnapped(snaps.leftEdge)) {
        style['left'] = 0
      } else if (this.isSnapped(snaps.rightEdge)) {
        style['right'] = 0
      } else {
        if (this.state.left <= this.state.right) {
          style['left'] = this.state.left + 'px'
        } else {
          style['right'] = this.state.right + 'px'
        }
      }

      // Y-axis position
      if (this.isSnapped(snaps.verticalCenter)) {
        style['top'] = `calc(50% - ${this.height / 2}px)`
      } else if (this.isSnapped(snaps.topEdge)) {
        style['top'] = 0
      } else if (this.isSnapped(snaps.bottomEdge)) {
        style['bottom'] = 0
      } else {
        if (this.state.top <= this.state.bottom) {
          style['top'] = this.state.top + 'px'
        } else {
          style['bottom'] = this.state.bottom + 'px'
        }
      }

      return style
    },
  },

  watch: {
    'state.snaps': function(value, newValue) {
      this.$emit('update:snaps', Array.from(newValue))
    },
  },

  mounted() {
    this.updateSize()

    const callback = (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          this.updateSize()
        }
      }
    }

    const observer = new MutationObserver(callback)

    observer.observe(this.$refs.panel, {
      attributes: true,
    })

    this.$once('hook:beforeDestroy', observer.disconnect())
  },

  methods: {
    emitUpdate(prop) {
      this.$emit(`update:${prop}`, this.state[prop])
    },

    updateSize() {
      ({ width: this.width, height: this.height } = getElementSize(this.$refs.panel))
    },

    setCursor(event) {
      const { x, y } = getCursorPositionFromEvent(event)
      const { left, top } = getElementPosition(this.$refs.panel)

      this.cursor.dx = x - left
      this.cursor.dy = y - top
    },

    getCursor(event) {
      const { x, y } = getCursorPositionFromEvent(event)

      return [
        x - this.cursor.dx,
        y - this.cursor.dy,
      ]
    },

    // Snap helpers
    canSnap(snap=undefined) {
      if (snap === undefined) {
        return this.snap !== false
      }

      let result = false

      if (typeof this.snap === 'boolean') {
        result = result || this.snap
      } else if (typeof this.snap === 'object') {
        result = result || this.snap.includes(snap)
      }

      result = result || this.isSnapped(snap)

      return result
    },

    isSnapped(snap=undefined) {
      if (!this.canSnap()) {
        return false
      } else if (snap === undefined) {
        return this.state.snaps.size !== 0
      }
      return this.state.snaps.has(snap)
    },

    addSnap(snap) {
      this.state.snaps.add(snap)
      this.state.snaps = new Set(this.state.snaps)
      this.$emit('snapped', snap)
    },

    deleteSnap(snap) {
      this.state.snaps.delete(snap)
      this.state.snaps = new Set(this.state.snaps)
      this.$emit('unsnapped', snap)
    },

    trySnap(x, y) {
      const checkThreshold = (a, b) => {
        return Math.abs(a - b) <= this.snapThreshold
      }

      let finalX = x
      let finalY = y

      // Horizontal Center
      if (this.canSnap(snaps.horizontalCenter)) {
        const panelMiddle = x + (this.width / 2)
        const viewMiddle = document.documentElement.clientWidth / 2
        if (checkThreshold(panelMiddle, viewMiddle)) {
          finalX = viewMiddle - (this.width / 2)
          this.addSnap(snaps.horizontalCenter)
        } else {
          this.deleteSnap(snaps.horizontalCenter)
        }
      }

      // Vertical Center
      if (this.canSnap(snaps.verticalCenter)) {
        const panelMiddle = y + (this.height / 2)
        const viewMiddle = document.documentElement.clientHeight / 2
        if (checkThreshold(panelMiddle, viewMiddle)) {
          finalY = viewMiddle - (this.height / 2)
          this.addSnap(snaps.verticalCenter)
        } else {
          this.deleteSnap(snaps.verticalCenter)
        }
      }

      // Top Edge
      if (this.canSnap(snaps.topEdge)) {
        const panelEdge = y
        const viewEdge = 0
        if (checkThreshold(panelEdge, viewEdge)) {
          finalY = viewEdge
          this.addSnap(snaps.topEdge)
        } else {
          this.deleteSnap(snaps.topEdge)
        }
      }

      // Left Edge
      if (this.canSnap(snaps.leftEdge)) {
        const panelEdge = x
        const viewEdge = 0
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge
          this.addSnap(snaps.leftEdge)
        } else {
          this.deleteSnap(snaps.leftEdge)
        }
      }

      // Bottom Edge
      if (this.canSnap(snaps.bottomEdge)) {
        const panelEdge = y + this.height
        const viewEdge = document.documentElement.clientHeight
        if (checkThreshold(panelEdge, viewEdge)) {
          finalY = viewEdge - this.height
          this.addSnap(snaps.bottomEdge)
        } else {
          this.deleteSnap(snaps.bottomEdge)
        }
      }

      // Right Edge
      if (this.canSnap(snaps.rightEdge)) {
        const panelEdge = x + this.width
        const viewEdge = document.documentElement.clientWidth
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge - this.width
          this.addSnap(snaps.rightEdge)
        } else {
          this.deleteSnap(snaps.rightEdge)
        }
      }

      return [ finalX, finalY ]
    },

    doDrag(event) {
      let { x, y } = limitPosition(
        ...this.getCursor(event),
        this.width,
        this.height,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
      )

      if (this.canSnap()) {
        [ x, y ] = this.trySnap(x, y)
      }

      this.state.left = x
      this.state.right = document.documentElement.clientWidth - (x + this.width)

      this.state.top = y
      this.state.bottom = document.documentElement.clientHeight - (y + this.height)

      this.emitUpdate('left')
      this.emitUpdate('right')
      this.emitUpdate('top')
      this.emitUpdate('bottom')

      this.$emit('dragmove')
    },

    startDrag(event) {
      if (this.draggable) {
        this.dragging = true

        this.setCursor(event)

        document.onmousemove = this.doDrag
        document.onmouseup = this.stopDrag

        document.ontouchmove = this.doDrag
        document.ontouchend = this.stopDrag

        this.$emit('dragstart')
      }
    },

    stopDrag() {
      this.dragging = false

      document.onmousemove = null
      document.onmouseup = null

      document.ontouchmove = null
      document.ontouchend = null

      this.$emit('dragstop')
    },
  }
};
</script>

<style scoped>
.panel {
  position: fixed;
}

.panel[draggable] {
  cursor: grab;
}

.panel[dragging] {
  cursor: grabbing;
}
</style>
