<template>
  <div>
    <panel
      class="panel"
      v-bind.sync="state"
      :snap="true"
    >
      <div class="text">DRAG ME</div>
    </panel>
  </div>
</template>

<script>
import Panel from './components/Panel.vue'
import { snaps } from './components/Panel.vue'

export default {
  name: 'App',
  components: {
    Panel,
  },
  data() {
    return {
      state: {
        x: 0,
        y: 0,
        
        size: 64,

        snaps: [
          snaps.horizontalCenter,
          snaps.verticalCenter,
        ],
        
        locked: false,
      },
    }
  }
}
</script>

<style>
.panel {
  background-color: gray;
  border-radius: .5rem;
  box-shadow: 0 0 1rem rgba(0,0,0,.15);
  padding: 8px;

  transition-property: box-shadow, transform, background-color;
  transition-duration: 300ms;
}

.panel[dragging] {
  cursor: grabbing;
  background-color: dimgray;
  box-shadow: 0 0 3rem rgba(0,0,0,.3);
  transform: scale(1.05);
}

.panel[dragging][snapped] {
  box-shadow: 0 0 3rem rgba(200,200,0,.3);
}

.panel[dragging][snapped][snaps*="vertical-center"],
.panel[dragging][snapped][snaps*="horizontal-center"] {
  box-shadow: 0 0 3rem rgba(0,0,200,.3);
}

.panel[dragging][snapped][snaps*="vertical-center"][snaps*="horizontal-center"] {
  box-shadow: 0 0 3rem rgba(0,200,200,.3);
}

.panel[dragging][snapped][snaps*="top-edge"][snaps*="left-edge"],
.panel[dragging][snapped][snaps*="top-edge"][snaps*="right-edge"],
.panel[dragging][snapped][snaps*="bottom-edge"][snaps*="left-edge"],
.panel[dragging][snapped][snaps*="bottom-edge"][snaps*="right-edge"] {
  box-shadow: 0 0 3rem rgba(200,0,0,.3);
}

.panel[dragging][snapped][snaps*="vertical-center"][snaps*="top-edge"],
.panel[dragging][snapped][snaps*="vertical-center"][snaps*="left-edge"],
.panel[dragging][snapped][snaps*="vertical-center"][snaps*="right-edge"],
.panel[dragging][snapped][snaps*="vertical-center"][snaps*="bottom-edge"],
.panel[dragging][snapped][snaps*="horizontal-center"][snaps*="top-edge"],
.panel[dragging][snapped][snaps*="horizontal-center"][snaps*="left-edge"],
.panel[dragging][snapped][snaps*="horizontal-center"][snaps*="right-edge"],
.panel[dragging][snapped][snaps*="horizontal-center"][snaps*="bottom-edge"] {
  box-shadow: 0 0 3rem rgba(200,0,200,.3);
}

.panel[dragging]:not([snapped]) {
  box-shadow: 0 0 3rem rgba(0,200,0,.3);
}

.text {
  display: inline-flex;
  height: 100%;
  align-items: center;

  color: white;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
</style>
