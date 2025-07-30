import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/saas/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/saas/table',
    name: 'Table',
    component: () => import('@/views/Table.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router