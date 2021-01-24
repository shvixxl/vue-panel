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
    {{ top }}, {{ left }}, {{ cssStyle }}
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
    size: {
      type: Number,
      default: 0,
      required: true,
      validator(value) {
        return value >= 0
      } 
    },
    padding: {
      type: Number,
      default: 0,
      required: false,
      validator(value) {
        return value >= 0
      }
    },
    locked: {
      type: Boolean,
      default: true,
      required: false,
    },
    snap: {
      type: Boolean,
      default: false,
      required: false,
    },
    snapThreshold: {
      type: Number,
      default: 15,
      required: false,
    },

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
      top: 5,
      left: 5,
      bottom: null,
      right: null,

      snappings: {
        horizontalCenter: false,
        verticalCenter: false,
        topEdge: false,
        leftEdge: false,
        bottomEdge: false,
        rightEdge: false,
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
        style['left'] = 0
      } else if (this.snappings.rightEdge) {
        style['right'] = 0
      } else {
        style['left'] = this.left + 'px'
      }

      if (this.snappings.verticalCenter) {
        style['top'] = '50%'
        style['margin-top'] = -(this.height / 2)  + 'px'
      } else if (this.snappings.topEdge) {
        style['top'] = 0
      } else if (this.snappings.bottomEdge) {
        style['bottom'] = 0
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
        const viewEdge = 0
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
        const viewEdge = 0
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
        const viewEdge = document.documentElement.clientHeight
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
        const viewEdge = document.documentElement.clientWidth
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

      let { x: left, y: top } = limitPosition(
        x - this.cursor.dx,
        y - this.cursor.dy,
        this.width,
        this.height,
      )

      if (this.snap) {
        ([left, top] = this.trySnap(left, top))
      }

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
