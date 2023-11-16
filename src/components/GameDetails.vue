<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div class="card text-white bg-dark">
          <div class="card-header">Pac-Man</div>
          <div class="card-body">
            <h2 class="header">Rules and description:</h2>
            <p>
              Player starts inside maze. The purpose of game is to "eat" all dots and avoid ghosts.
            </p>
            <p>
              There are four ghosts and all of them starts from ghost's "house". Each ghost moves
              individually and has different movement strategy. For example red ghost by default is
              chasing PacMan. Pink one is trying to chaise PacMan from front side. Other ghost are
              moving in random way.
            </p>
            <p>
              When PacMan eats power up, ghost starts to be in panic mode (blue color) and are a
              little bit slowlier. When PacMan eats ghost in panic time, ghost searches way to
              ghost's hous to respawn changing it speed to maximum. When ghost meets PacMan - life
              is lost.
            </p>
            <p class="header">Features implemented:</p>
            <ul>
              <li>Different maze types</li>
              <li>Animated PacMan when moving</li>
              <li>Colision detection with walls, ghosts, dots and power ups</li>
              <li>Ghosts movement strategy: chasing and random</li>
              <li>Scoring the same as in oroginal game</li>
              <li>Similar sounds</li>
              <li>Animated menu</li>
              <li>Two players mode</li>
            </ul>
          </div>

          <div class="card-footer">
            <button class="btn btn-danger" @click="play()">PLAY</button>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            <img src="@/assets/pacman_menu_screenshot.png" alt="pacman_menu_screenshot" class="img-thumbnail rounded img-fluid">
          </div>
        </div>
        <div class="row">
          <div class="col">
            <img src="@/assets/pacman_screenshot.png" alt="pacman_screenshot" class="img-thumbnail rounded img-fluid">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    play(): void {
      this.$router.push({ path: '/pacMan' })
    }
  }
})
</script>

<style scoped>
.container {
  padding: 40px;
}

.header {
  color: #42b983;
}

.card-header {
  color: #ffccaa;
  font-size: 32px;
}

.card-body {
  color: #ffccaa;
}

.btn {
  width: 100%;
}
</style>
