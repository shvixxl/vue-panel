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

  return {
    x: Math.min(Math.max(x, 0), clientWidth - w),
    y: Math.min(Math.max(y, 0), clientHeight - h),
  }
}

export default {
  props: {
    // Position
    top: {
      type: Number,
      required: false,
      default: 0,
      required: true,
      validator(value) {
        return value >= 0
      } 
    },
    left: {
      type: Number,
      default: 0,
    },
    bottom: {
      type: Number,
      required: false,
    },
    right: {
      type: Number,
      default: 0,
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
      default: true,
    },

    // Misc
    margin: {
      type: Number,
      required: false,
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
      default: 15,
      required: false,
    },

    // Stylings
    classNameDraggable: {
      type: String,
      default: 'panel-draggable',
      required: false,
    },
    classNameDragging: {
      type: String,
      default: 'panel-dragging',
      required: false,
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
        'height': this.size + 'px',
        'width': this.size + 'px',
        'padding': this.padding + 'px',
      }

      if (this.snappings.horizontalCenter) {
        style['left'] = '50%'
        style['margin-left'] = -(this.width / 2) + 'px'
      } else if (this.snappings.leftEdge) {
        style['left'] = this.margin + 'px'
      } else if (this.snappings.rightEdge) {
        style['right'] = this.margin + 'px'
      } else {
        style['left'] = this.left + 'px'
      }

      if (this.snappings.verticalCenter) {
        style['top'] = '50%'
        style['margin-top'] = -(this.height / 2)  + 'px'
      } else if (this.snappings.topEdge) {
        style['top'] = this.margin + 'px'
      } else if (this.snappings.bottomEdge) {
        style['bottom'] = this.margin + 'px'
      } else {
        style['top'] = this.top + 'px'
      }

      return style
    },
    height() {
      return this.size + this.padding * 2
    },
    width() {
      return this.size + this.padding * 2
    },
  },
  methods: {
    setCursor(event) {
      const { x, y } = getCursor(event)

      this.cursor.dx = x - this.$refs.panel.offsetLeft
      this.cursor.dy = y - this.$refs.panel.offsetTop
    },
    trySnap(x, y) {
      const checkThreshold = (a, b) => {
        return Math.abs(a - b) <= this.snapThreshold
      }

      let finalX = x
      let finalY = y

      // Horizontal Center
      {
        const panelMiddle = x + (this.width / 2)
        const viewMiddle = document.documentElement.clientWidth / 2
        if (checkThreshold(panelMiddle, viewMiddle)) {
          finalX = viewMiddle - (this.width / 2)
          this.snappings.horizontalCenter = true
        } else {
          this.snappings.horizontalCenter = false
        }
      }

      // Vertical Center
      {
        const panelMiddle = y + (this.height / 2)
        const viewMiddle = document.documentElement.clientHeight / 2
        if (checkThreshold(panelMiddle, viewMiddle)) {
          finalY = viewMiddle - (this.height / 2)
          this.snappings.verticalCenter = true
        } else {
          this.snappings.verticalCenter = false
        }
      }

      // Top Edge
      {
        const panelEdge = y
        const viewEdge = 0 + this.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalY = viewEdge
          this.snappings.topEdge = true
        } else {
          this.snappings.topEdge = false
        }
      }

      // Left Edge
      {
        const panelEdge = x
        const viewEdge = 0 + this.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge
          this.snappings.leftEdge = true
        } else {
          this.snappings.leftEdge = false
        }
      }

      // Bottom Edge
      {
        const panelEdge = y + this.height
        const viewEdge = document.documentElement.clientHeight - this.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalY = viewEdge - this.height
          this.snappings.bottomEdge = true
        } else {
          this.snappings.bottomEdge = false
        }
      }

      // Right Edge
      {
        const panelEdge = x + this.width
        const viewEdge = document.documentElement.clientWidth - this.margin
        if (checkThreshold(panelEdge, viewEdge)) {
          finalX = viewEdge - this.width
          this.snappings.rightEdge = true
        } else {
          this.snappings.rightEdge = false
        }
      }

      return [finalX, finalY]
    },
    doDrag(event) {
      const { x, y } = getCursor(event)

      let left, top;

      if (this.snap) {
        ([left, top] = this.trySnap(x - this.cursor.dx, y - this.cursor.dy))
      }

      ({ x: left, y: top } = limitPosition(left, top, this.width, this.height))

      this.left = left
      this.top = top
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
