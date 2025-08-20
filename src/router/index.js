import { createRouter, createWebHistory } from 'vue-router'

import Home from '../Pages/Home.vue'
import Login from '../Pages/Login.vue'
import Signup from '../Pages/Signup.vue'
import Booking from '../Pages/Booking.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/booking', component: Booking },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
