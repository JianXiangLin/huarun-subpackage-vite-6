import { createRouter, createWebHistory } from 'vue-router'
import SaasHome from '@/views/Home.vue'

const routes = [
  {
    path: '/saas/home',
    name: 'SaasHome',
    component: SaasHome
  },
  {
    path: '/saas/table',
    name: 'SaasTable',
    component: () => import('@/views/Table.vue')
  },
  {
    path: '/saas/venue',
    name: 'SaasVenue',
    component: () => import('@/views/Venue/Venue.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
