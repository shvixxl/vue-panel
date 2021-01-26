<template>
  <div>
    <panel
      class="panel"
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
          'horizontal-center',
          'vertical-center',
        ],
        locked: false,
      },
      snap: true,
    }
  }
}
</script>

<style>
.panel {
  background-color: #888;
  border-radius: .25rem;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
  padding: 8px;

  transition-property: box-shadow, transform, background-color;
  transition-duration: 200ms;
}

.panel[dragging] {
  cursor: grabbing;
  background-color: #777;
  box-shadow: 0 1rem 3rem rgba(0,0,0,.3);
  transform: scale(1.05);
}

.panel[dragging][snapped] {
  box-shadow: 0 1rem 3rem rgba(200,0,0,.3);
}

.panel[dragging][snapped][snaps*="vertical-center"],
.panel[dragging][snapped][snaps*="horizontal-center"] {
  box-shadow: 0 1rem 3rem rgba(0,0,200,.3);
}
</style>
