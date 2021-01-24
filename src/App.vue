<template>
  <panel
    class="panel"
    classNameDraggable="panel-draggable"
    classNameDragging="panel-dragging"
    :size="32"
    :padding="4"
    :margin="10"
    :locked="false"
    :snap="true"
  ></panel>
</template>

<script>
import Panel from './components/Panel.vue'

export default {
  name: 'App',
  components: {
    Panel,
  },
}
</script>

<style>
.panel {
  background-color: #888 !important;
  border-radius: .25rem !important;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
}

.panel-draggable {
  cursor: grab;
}

.panel-dragging {
  cursor: grabbing;
  background-color: #777 !important;
  box-shadow: 0 1rem 3rem rgba(0,0,0,.3) !important;
}
</style>
