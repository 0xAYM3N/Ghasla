import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

// Pages
import Home from '../Pages/Home.vue'
import Login from '../Pages/Login.vue'
import Signup from '../Pages/Signup.vue'
import Booking from '../Pages/Booking.vue'
import PageNotFound from '../components/PageNotFound/PageNotFound.vue'

// User Dashboard
import Dashboard from '../components/Dashboard/Dashboard.vue'
import Account from '../components/Dashboard/Account/Account.vue'
import Bookings from '../components/Dashboard/Bookings/Bookings.vue'
import Notifications from '../components/Dashboard/Notifications/Notifications.vue'
import Wallet from '../components/Dashboard/Wallet/Wallet.vue'

// Admin Dashboard
import AdminLayout from '../Admin/AdminLayout.vue'
import Statistic from '../Admin/Statistic/Statistic.vue'
import ClientsBookings from '../Admin/ClientsBookings/ClientsBookings.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/booking', component: Booking, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: PageNotFound },

  // User Dashboard
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
  },

  // Admin Dashboard
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'statistic', component: Statistic },
      { path: 'clients-bookings', component: ClientsBookings },
      { path: '', redirect: '/admin/statistic' }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth) {
    if (!userStore.user) {
      await userStore.fetchUser()
    }

    if (!userStore.user) {
      return next('/login')
    }
  }

  if (to.meta.requiresAdmin && userStore.role !== 'admin') {
    return next('/')
  }

  if ((to.path === '/login' || to.path === '/signup') && userStore.user) {
    return next('/')
  }

  next()
})

export default router
