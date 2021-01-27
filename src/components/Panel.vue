<template>
  <div
    ref="panel"
    class="panel"
    :style="getCssStyle()"
    :draggable="draggable"
    :dragging="dragging"
    :snapped="isSnapped"
    :snaps="Array.from(state.snaps).join(' ')"
    @mousedown.prevent="startDrag"
    @touchstart.prevent="startDrag"
  >
  </div>
</template>

<script>
import {
  getCursorPositionFromEvent,
  limitPosition
} from '../utils'

// Available snaps
const snaps = {
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
    top: {
      type: Number,
      required: false,
      default: undefined,
    },
    left: {
      type: Number,
      required: false,
      default: undefined,
    },
    bottom: {
      type: Number,
      required: false,
      default: undefined,
    },
    right: {
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
    
    // Size
    size: {
      type: Number,
      required: false,
      default: 32,
      validator(value) {
        return value >= 0
      }
    },
    
    // State
    locked: {
      type: Boolean,
      required: false,
      default: true,
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
  },
  data() {
    return {
      state: {
        // Position
        top: this.top,
        left: this.left,
        bottom: this.bottom,
        right: this.right,

        // Size
        size: this.size,

        // State
        snaps: new Set(this.snaps),
        locked: this.locked,
      },

      height: undefined,
      width: undefined,

      draggable: !this.locked,
      dragging: false,
      
      cursor: {
        dx: undefined,
        dy: undefined,
      }
    }
  },
  computed: {
    isSnapped() {
      return this.state.snaps.size !== 0
    }
  },
  watch: {
    'state.snaps': function(value, newValue) {
      this.$emit('update:snaps', Array.from(newValue))
    },
    'state.top': function(value, newValue) {
      this.$emit('update:top', newValue)
    },
    'state.left': function(value, newValue) {
      this.$emit('update:left', newValue)
    },
    'state.bottom': function(value, newValue) {
      this.$emit('update:bottom', newValue)
    },
    'state.right': function(value, newValue) {
      this.$emit('update:right', newValue)
    }
  },
  mounted() {
    const computedStyle = window.getComputedStyle(this.$refs.panel)

    this.height = 
      this.state.size +
      parseFloat(computedStyle.getPropertyValue('padding-left')) +
      parseFloat(computedStyle.getPropertyValue('padding-right'))

    this.width =
      this.state.size +
      parseFloat(computedStyle.getPropertyValue('padding-top')) +
      parseFloat(computedStyle.getPropertyValue('padding-bottom'))
  },
  methods: {
    emitUpdate(prop) {
      this.$emit(`update:${prop}`, this.state[prop])
    },

    getCssStyle() {
      let style = {
        'height': this.size + 'px',
        'width': this.size + 'px',
      }

      if (this.isSnappedTo(snaps.horizontalCenter)) {
        style['left'] = '50%'
        style['margin-left'] = -(this.width / 2) + 'px'
      } else if (this.isSnappedTo(snaps.leftEdge)) {
        style['left'] = 0
      } else if (this.isSnappedTo(snaps.rightEdge)) {
        style['right'] = 0
      } else {
        style['left'] = this.state.left + 'px'
      }

      if (this.isSnappedTo(snaps.verticalCenter)) {
        style['top'] = '50%'
        style['margin-top'] = -(this.height / 2)  + 'px'
      } else if (this.isSnappedTo(snaps.topEdge)) {
        style['top'] = 0
      } else if (this.isSnappedTo(snaps.bottomEdge)) {
        style['bottom'] = 0
      } else {
        style['top'] = this.state.top + 'px'
      }

      return style
    },

    setCursor(event) {
      const [ x, y ] = getCursorPositionFromEvent(event)

      this.cursor.dx = x - this.$refs.panel.offsetLeft
      this.cursor.dy = y - this.$refs.panel.offsetTop
    },
    getCursorOffset(event) {
      const [ x, y ] = getCursorPositionFromEvent(event)

      return [
        x - this.cursor.dx,
        y - this.cursor.dy,
      ]
    },
    
    // Snap helpers
    canSnapTo(snap) {
      if (snap === undefined) {
        return this.snap !== false
      }

      let result = false

      if (typeof this.snap === 'boolean') {
        result = result || this.snap
      } else if (typeof this.snap === 'object') {
        result = result || this.snap.includes(snap)
      }

      result = result || this.isSnappedTo(snap)

      return result
    },
    isSnappedTo(snap) {
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
      if (this.canSnapTo(snaps.horizontalCenter)) {
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
      if (this.canSnapTo(snaps.verticalCenter)) {
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
      if (this.canSnapTo(snaps.topEdge)) {
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
      if (this.canSnapTo(snaps.leftEdge)) {
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
      if (this.canSnapTo(snaps.bottomEdge)) {
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
      if (this.canSnapTo(snaps.rightEdge)) {
        const panelEdge = x + this.width
        const viewEdge = document.documentElement.clientWidth
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge - this.width
          this.addSnap(snaps.rightEdge)
        } else {
          this.deleteSnap(snaps.rightEdge)
        }
      }

      return [finalX, finalY]
    },

    doDrag(event) {
      let [ left, top ] = limitPosition(
        ...this.getCursorOffset(event),
        this.width,
        this.height
      )

      if (this.canSnapTo()) {
        [ left, top ] = this.trySnap(left, top)
      }

      this.state.left = left
      this.state.top = top
      this.emitUpdate('left')
      this.emitUpdate('top')
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
