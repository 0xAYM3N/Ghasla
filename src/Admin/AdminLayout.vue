<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from './Sidebar/Sidebar.vue'
import Navbar from './Navbar/Navbar.vue'
import './AdminLayout.css'

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(() => {
  if (window.innerWidth <= 768) {
    isSidebarOpen.value = false 
  }
})
</script>

<template>
  <div class="dashboard-layout">
    <Navbar :toggle-sidebar="toggleSidebar" />

    <div class="dashboard-body">
      <Sidebar :is-open="isSidebarOpen" />

      <div
        class="sidebar-overlay"
        v-if="isSidebarOpen"
        @click="toggleSidebar"
      ></div>

      <main class="dashboard-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>


