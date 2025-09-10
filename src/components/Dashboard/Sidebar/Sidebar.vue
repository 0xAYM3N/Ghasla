<script setup>
import './Sidebar.css'

defineProps({
  isOpen: { type: Boolean, default: true }
})

const navItems = [
  { path: '/dashboard/account', icon: 'fa-user', label: 'ادارة الحساب' },
  { path: '/dashboard/bookings', icon: 'fa-calendar', label: 'ادارة الحجوزات' },
  { path: '/dashboard/notifications', icon: 'fa-bell', label: 'الاشعارات' },
  { path: '/dashboard/wallet', icon: 'fa-wallet', label: 'المحفظة' },
]
</script>

<template>
  <div class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-container">
      <div class="top-part">
        <div class="sidebar-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
          >
            <i :class="['fa-solid', item.icon]"></i>
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

