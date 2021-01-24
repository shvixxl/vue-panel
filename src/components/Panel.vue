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
  ></div>
</template>

<script>
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
        'horizontal-center': false,
        'vertical-center': false,
        'top-edge': false,
        'left-edge': false,
        'bottom-edge': false,
        'right-edge': false,
      },

      draggable: !this.locked,
      dragging: false,
      
      cursor: {
        x: undefined,
        y: undefined,
        dx: 0,
        dy: 0,
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

      if (this.snappings['horizontal-center']) {
        style['left'] = '50%'
        style['margin-left'] = -(this.panelWidth / 2) + 'px'
      } else if (this.snappings['left-edge']) {
        style['left'] = 0
      } else if (this.snappings['right-edge']) {
        style['right'] = 0
      } else {
        style['left'] = this.left + 'px'
      }

      if (this.snappings['vertical-center']) {
        style['top'] = '50%'
        style['margin-top'] = -(this.panelHeight / 2)  + 'px'
      } else if (this.snappings['top-edge']) {
        style['top'] = 0
      } else if (this.snappings['bottom-edge']) {
        style['bottom'] = 0
      } else {
        style['top'] = this.top + 'px'
      }

      return style
    },
    panelHeight() {
      return this.size + this.padding * 2
    },
    panelWidth() {
      return this.size + this.padding * 2
    }
  },
  methods: {
    setCursor(event) {
      let clientX = event.touches ? event.touches[0].clientX : event.clientX
      let clientY = event.touches ? event.touches[0].clientY : event.clientY

      this.cursor.dx = this.cursor.x - clientX
      this.cursor.dy = this.cursor.y - clientY
      this.cursor.x = clientX
      this.cursor.y = clientY
    },
    doDrag(event) {
      this.setCursor(event)

      let clientWidth = document.documentElement.clientWidth;
      let clientHeight = document.documentElement.clientHeight;

      this.left = Math.min(Math.max(this.left - this.cursor.dx, 0), clientWidth - this.panelWidth)
      this.top = Math.min(Math.max(this.top - this.cursor.dy, 0), clientHeight - this.panelHeight)
      
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
