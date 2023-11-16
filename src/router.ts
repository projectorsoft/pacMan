import { createRouter, createWebHistory } from 'vue-router'
import GameDetails from './components/GameDetails.vue'
import PacMan from './components/PacMan.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: GameDetails
    },
    {
      path: '/pacman',
      component: PacMan
    }
  ]
})
