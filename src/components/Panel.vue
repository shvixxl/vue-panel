<template>
  <div
    :class="[{
      [classNameDraggable]: draggable,
      [classNameDragging]: dragging,
    }, 'panel']"
    :style="cssVars"
    ref="panel"
    @mousedown="startDrag"
    @touchstart="startDrag"
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
      top: 0,
      left: 0,

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
    cssVars() {
      return {
        '--size': this.size + 'px',
        '--padding': this.padding + 'px',
        '--position-top': this.top + 'px',
        '--position-left': this.left + 'px',
      }
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
    startDrag() {
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
  top: var(--position-top);
  left: var(--position-left);
  height: var(--size);
  width: var(--size);
  padding: var(--padding);
  background-color: #eee;
}

.panel-draggable {
  cursor: grab;
}

.panel-dragging {
  cursor: grabbing;
}
</style>
