<script setup>
import { ref } from 'vue'
import './Dashboard.css'

const user = {
  name: "Ghasla",
  email: "Ghasla@ghasla.com",
}

const showPopup = ref(false)
const isSidebarOpen = ref(true)

const togglePopup = () => {
  showPopup.value = !showPopup.value
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div v-if="isSidebarOpen" class="sidebar">
      <div class="top-part">
        <div class="sidebar-header">
          <h2 class="sidebar-title">غسلة</h2>
          <div class="sidebar-toggle" @click="toggleSidebar">
            <i class="fa-solid fa-bars"></i>
          </div>
        </div>

        <div class="sidebar-nav">
          <router-link to="#"><i class="fa-solid fa-calendar"></i>ادارة الحجوزات</router-link>
          <router-link to="#"><i class="fa-solid fa-bell"></i>الاشعارات</router-link>
          <router-link to="#"><i class="fa-solid fa-wallet"></i>المحفظة</router-link>
        </div>
      </div>

      <div class="sidebar-user" @click="togglePopup">
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
        <div class="user-icon">
          <i class="fa-solid fa-user"></i>
        </div>

        <div v-if="showPopup" class="popup-menu">
          <div class="links">
            <router-link to="/manageAccount">
              <i class="fa-solid fa-gear"></i>
              إدارة الحساب
            </router-link>
            <router-link to="/logout">
              <i class="fa-solid fa-right-from-bracket"></i>
              تسجيل خروج
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="sidebar-toggle only" @click="toggleSidebar">
      <i class="fa-solid fa-bars"></i>
    </div>
  </div>
</template>
