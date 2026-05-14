import { createRouter, createWebHistory } from 'vue-router'
import MapView from '@/pages/MapView.vue'
import CheckInView from '@/pages/CheckInView.vue'
import ListView from '@/pages/ListView.vue'
import MeView from '@/pages/MeView.vue'

const routes = [
  { path: '/', name: 'map', component: MapView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/list', name: 'list', component: ListView },
  { path: '/me', name: 'me', component: MeView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router