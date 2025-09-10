import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

import Home from '../Pages/Home.vue'
import Login from '../Pages/Login.vue'
import Signup from '../Pages/Signup.vue'
import Booking from '../Pages/Booking.vue'
import PageNotFound from '../components/PageNotFound/PageNotFound.vue'

import Dashboard from '../Pages/Dashboard.vue'
import Account from '../components/Dashboard/Account/Account.vue'
import Bookings from '../components/Dashboard/Bookings/Bookings.vue'
import Notifications from '../components/Dashboard/Notifications/Notifications.vue'
import Wallet from '../components/Dashboard/Wallet/Wallet.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/booking', component: Booking, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: PageNotFound },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      { path: 'account', component: Account },
      { path: 'bookings', component: Bookings },
      { path: 'notifications', component: Notifications },
      { path: 'wallet', component: Wallet },
      { path: '', redirect: '/dashboard/account' }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token 

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/signup') && token) {
    next('/')
  } else {
    next()
  }
})

export default router
