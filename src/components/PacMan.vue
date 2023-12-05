<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col">
        <span v-if="!gameLoaded">Loading game... {{ message }}</span>
        <canvas :style="{'width': width, 'height': height}"
          id="canvas"
          :width="canvasWidth"
          :height="canvasHeight"
        >
        </canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Game } from '../game/game'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      game: {},
      gameLoaded: false,
      message: '',
      canvasWidth: 840,
      canvasHeight: 810,
      width: this.getWidthInPercents(),
      height: this.getHeightInPercents()
    }
  },
  mounted() {
    window.addEventListener('resize', () => this.getDimensions());
    this.game = new Game();
    (this.game as Game).onGameLoaded = this.onGameLoaded;
  },
  unmounted() {
    window.removeEventListener('resize', () => this.getDimensions());
  },
  methods: {
    onGameLoaded(value: boolean, reason?: string): void {
      this.gameLoaded = value;
      this.message = reason ? reason : '';

      (this.game as Game).setScale(this.getXScale() / this.getWidthScaleFactor(), this.getYScale() / this.getHeightScaleFactor());
    },
    getDimensions(): void {
      this.width = this.getWidthInPercents();
      this.height = this.getHeightInPercents();
      
      (this.game as Game).setScale(this.getXScale() / this.getWidthScaleFactor(), this.getYScale() / this.getHeightScaleFactor());
    },
    getWidthInPercents(): string {
      return `${this.getWidthScaleFactor() * 100}%`;
    },
    getHeightInPercents(): string {
      return `${this.getHeightScaleFactor() * 100}%`;
    },
    getWidthScaleFactor(): number {
      return window.innerWidth > window.innerHeight ? window.innerHeight / window.innerWidth : 1;
    },
    getHeightScaleFactor(): number {
      return window.innerHeight > window.innerWidth ? window.innerWidth / window.innerHeight : 1;
    },
    getXScale(): number {
      return this.canvasWidth / window.innerWidth;
    },
    getYScale(): number {
      return this.canvasHeight / window.innerHeight;
    }
  }
})
</script>

<style scoped>
@font-face {
  font-family: 'pixelCode';
  src: url('../assets/fonts/pixelCode.woff') format('woff');
}

.container {
  font-family: 'pixelCode';
  color: rgb(255, 255, 255)
}

#canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
