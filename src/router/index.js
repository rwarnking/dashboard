/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import  Index from '@/pages/index.vue'

// ???????
const routes = [
  { path: '/', redirect: '/dashboard/' },
  { path: '/dashboard/', component: Index },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
