<template>
  <div
    :class="[{
      [classNameDraggable]: draggable,
      [classNameDragging]: dragging,
    }, 'panel']"
    :style="cssStyle"
    ref="panel"
    @mousedown.prevent="startDrag"
    @touchstart.prevent="startDrag"
  >
  </div>
</template>

<script>

const getCursor = function getCursorPositionFromEvent(event) {
  return {
    x: event.touches ? event.touches[0].clientX : event.clientX,
    y: event.touches ? event.touches[0].clientY : event.clientY,
  }
}

const limitPosition = function limitPositionWithinViewport(x, y, w=0, h=0) {
  let clientWidth = document.documentElement.clientWidth
  let clientHeight = document.documentElement.clientHeight

  return [
    Math.min(Math.max(x, 0), clientWidth - w),
    Math.min(Math.max(y, 0), clientHeight - h),
  ]
}

// Available Snappings
const snappings = {
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
      default: 0,
    },
    left: {
      type: Number,
      required: false,
      default: 0,
    },
    bottom: {
      type: Number,
      required: false,
      default: null,
    },
    right: {
      type: Number,
      required: false,
      default: null,
    },

    // Snappings
    snappings: {
      type: Array,
      required: false,
      default() {
        return []
      },
      validator(value) {
        for (const snapping of value) {
          if (!Object.values(snappings).includes(snapping)) {
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

    // Misc
    margin: {
      type: Number,
      required: false,
      default: 0,
    },
    padding: {
      type: Number,
      required: false,
      default: 0,
    },
    
    // Snap options
    snap: {
      type: [Boolean, Array],
      required: false,
      default: false,
      validator(value) {
        if (typeof value === 'object') {
          for (const snapping of value) {
            if (!Object.values(snappings).includes(snapping)) {
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
      default: 15,
    },

    // Stylings
    classNameDraggable: {
      type: String,
      required: false,
      default: 'panel-draggable',
    },
    classNameDragging: {
      type: String,
      required: false,
      default: 'panel-dragging',
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
        snappings: new Set(this.snappings),
        locked: this.locked,

        // Misc
        margin: this.margin,
        padding: this.padding,
      },

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
      let style = {
        'height': this.state.size + 'px',
        'width': this.state.size + 'px',
        'padding': this.state.padding + 'px',
      }

      if (this.isSnapped(snappings.horizontalCenter)) {
        style['left'] = '50%'
        style['margin-left'] = -(this.width / 2) + 'px'
      } else if (this.isSnapped(snappings.leftEdge)) {
        style['left'] = this.state.margin + 'px'
      } else if (this.isSnapped(snappings.rightEdge)) {
        style['right'] = this.state.margin + 'px'
      } else {
        style['left'] = this.state.left + 'px'
      }

      if (this.isSnapped(snappings.verticalCenter)) {
        style['top'] = '50%'
        style['margin-top'] = -(this.height / 2)  + 'px'
      } else if (this.isSnapped(snappings.topEdge)) {
        style['top'] = this.state.margin + 'px'
      } else if (this.isSnapped(snappings.bottomEdge)) {
        style['bottom'] = this.state.margin + 'px'
      } else {
        style['top'] = this.state.top + 'px'
      }

      return style
    },
    height() {
      return this.state.size + this.state.padding * 2
    },
    width() {
      return this.state.size + this.state.padding * 2
    },
  },
  methods: {
    setCursor(event) {
      const { x, y } = getCursor(event)

      this.cursor.dx = x - this.$refs.panel.offsetLeft
      this.cursor.dy = y - this.$refs.panel.offsetTop
    },

    canSnap(snap) {
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
    isSnapped(snap) {
      return this.state.snappings.has(snap)
    },
    addSnap(snap) {
      this.state.snappings.add(snap)
      this.state.snappings = new Set(this.state.snappings)
    },
    deleteSnap(snap) {
      this.state.snappings.delete(snap)
      this.state.snappings = new Set(this.state.snappings)
    },
    trySnap(x, y) {
      const checkThreshold = (a, b) => {
        return Math.abs(a - b) <= this.snapThreshold
      }

      let finalX = x
      let finalY = y

      // Horizontal Center
      if (this.canSnap(snappings.horizontalCenter)) {
        const panelMiddle = x + (this.width / 2)
        const viewMiddle = document.documentElement.clientWidth / 2
        if (checkThreshold(panelMiddle, viewMiddle)) {
          finalX = viewMiddle - (this.width / 2)
          this.addSnap(snappings.horizontalCenter)
        } else {
          this.deleteSnap(snappings.horizontalCenter)
        }
      }

      // Vertical Center
      if (this.canSnap(snappings.verticalCenter)) {
        const panelMiddle = y + (this.height / 2)
        const viewMiddle = document.documentElement.clientHeight / 2
        if (checkThreshold(panelMiddle, viewMiddle)) {
          finalY = viewMiddle - (this.height / 2)
          this.addSnap(snappings.verticalCenter)
        } else {
          this.deleteSnap(snappings.verticalCenter)
        }
      }

      // Top Edge
      if (this.canSnap(snappings.topEdge)) {
        const panelEdge = y
        const viewEdge = 0 + this.state.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalY = viewEdge
          this.addSnap(snappings.topEdge)
        } else {
          this.deleteSnap(snappings.topEdge)
        }
      }

      // Left Edge
      if (this.canSnap(snappings.leftEdge)) {
        const panelEdge = x
        const viewEdge = 0 + this.state.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge
          this.addSnap(snappings.leftEdge)
        } else {
          this.deleteSnap(snappings.leftEdge)
        }
      }

      // Bottom Edge
      if (this.canSnap(snappings.bottomEdge)) {
        const panelEdge = y + this.height
        const viewEdge = document.documentElement.clientHeight - this.state.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalY = viewEdge - this.height
          this.addSnap(snappings.bottomEdge)
        } else {
          this.deleteSnap(snappings.bottomEdge)
        }
      }

      // Right Edge
      if (this.canSnap(snappings.rightEdge)) {
        const panelEdge = x + this.width
        const viewEdge = document.documentElement.clientWidth - this.state.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge - this.width
          this.addSnap(snappings.rightEdge)
        } else {
          this.deleteSnap(snappings.rightEdge)
        }
      }

      return [finalX, finalY]
    },

    doDrag(event) {
      const { x, y } = getCursor(event)

      let left, top

      if (this.canSnap()) {
        [left, top] = this.trySnap(x - this.cursor.dx, y - this.cursor.dy)
      }

      [this.state.left, this.state.top] = limitPosition(left, top, this.width, this.height)
    },
    startDrag(event) {
      if (this.draggable) {
        this.dragging = true

        this.setCursor(event)

        document.onmousemove = this.doDrag
        document.onmouseup = this.stopDrag

        document.ontouchmove = this.doDrag
        document.ontouchend = this.stopDrag
      }
    },
    stopDrag() {
      this.dragging = false

      document.onmousemove = null
      document.onmouseup = null
      
      document.ontouchmove = null
      document.ontouchend = null
    },
  }
};
</script>

<style scoped>
.panel {
  position: fixed;
  background-color: #eee;
}

.panel-draggable {
  cursor: grab;
}

.panel-dragging {
  cursor: grabbing;
}
</style>
