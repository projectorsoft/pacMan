<template>
  <div id="container">
    <span v-if="!gameLoaded">Loading game... {{ message }}</span>
    <canvas
      id="canvas"
      :width="getWidth"
      :height="getHeight"
      :style="{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        'font-family': 'pixelCode'
      }"
    >
    </canvas>
  </div>
</template>

<script lang="ts">
import { Game } from '../game/game'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      gameLoaded: false,
      message: ''
    }
  },
  computed: {
    getWidth(): number {
      return window.innerWidth;
    },
    getHeight(): number {
      return window.innerHeight;
    }
  },
  mounted() {
    const game = new Game();
    game.onGameLoaded = this.onGameLoaded;
  },
  methods: {
    onGameLoaded(value: boolean, reason?: string): void {
      this.gameLoaded = value;
      this.message = reason ? reason : '';
    }
  }
})
</script>

<style scoped>
@font-face {
  font-family: 'pixelCode';
  src: url('../assets/fonts/pixelCode.woff') format('woff');
}

#container {
  font-family: 'pixelCode';
  color: rgb(255, 255, 255);
}
</style>