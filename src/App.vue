<template>
  <div>
    <transition name="fade">
      <div v-if="message.show" class="message">They're draggable btw.</div>
    </transition>
    <panel
      v-for="(panel, index) in panels"
      :key="panel.id"
      class="panel"
      v-bind.sync="panels[index]"
      :snap="true"
      @dragstart.once="message.show = false"
    >
      <div class="text">PANEL {{ index }}</div>
    </panel>
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
      message: {
        show: true,
      },
      panels: [
        {
          id: 0,

          top: undefined,
          left: undefined,
          bottom: undefined,
          right: undefined,

          snaps: [
            'top-edge',
            'left-edge',
          ],
          
          locked: false,
        },
        {
          id: 1,

          top: undefined,
          left: undefined,
          bottom: undefined,
          right: undefined,

          snaps: [
            'top-edge',
            'right-edge',
          ],
          
          locked: false,
        },
        {
          id: 2,

          top: undefined,
          left: undefined,
          bottom: undefined,
          right: undefined,

          snaps: [
            'bottom-edge',
            'left-edge',
          ],
          
          locked: false,
        },
        {
          id: 3,

          top: undefined,
          left: undefined,
          bottom: undefined,
          right: undefined,

          snaps: [
            'bottom-edge',
            'right-edge',
          ],
          
          locked: false,
        },
      ],
    }
  }
}
</script>

<style>

@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700;800&display=swap');

html {
  font-family: 'JetBrains Mono', monospace;
}

.panel {
  background-color: gray;
  border-radius: .5rem;
  box-shadow: 0 0 1rem rgba(0,0,0,.15);
  padding: 8px;
  margin: 8px;
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

.message {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);

  max-width: 75%;

  color: #333;
  font-weight: 800;
  font-size: 3em;
  text-align: center;
  text-transform: uppercase;
}

.text {
  color: white;
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
}

.small-text {
  font-size: 14px;
  font-weight: normal;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-leave-to {
  opacity: 0;
}
</style>
