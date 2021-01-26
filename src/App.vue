<template>
  <div>
    <panel
      class="panel"
      classNameDraggable="panel-draggable"
      classNameDragging="panel-dragging"
      v-bind="state"
      :snap="snap"
    ></panel>
  </div>
</template>

<script>
import Panel from './components/Panel.vue'

export default {
  name: 'App',
  components: {
    Panel,
  },
  data() {
    return {
      state: {
        size: 64,

        snaps: [
          'top-edge',
          'bottom-edge',
        ],
        locked: false,

        margin: 10,
      },
      snap: true,
    }
  }
}
</script>

<style>
.panel {
  background-color: #888 !important;
  border-radius: .25rem !important;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
  transition: 25ms;
  padding: 8px;
}

.panel-draggable {
  cursor: grab;
}

.panel-dragging {
  cursor: grabbing;
  background-color: #777 !important;
  box-shadow: 0 1rem 3rem rgba(0,0,0,.3) !important;
  transform: scale(1.1);
}
</style>
