<script setup>
import './Sidebar.css'

defineProps({
  isOpen: { type: Boolean, default: true }
})

const navItems = [
  { path: '/admin/statistic', icon: 'fa-chart-simple', label: 'احصائيات' },
  { path: '/admin/clients-bookings', icon: 'fa-calendar', label: 'حجوزات العملاء' },
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
