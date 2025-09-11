<script setup>
import './Navbar.css'
import { onMounted } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()

onMounted(() => {
  if (!userStore.token) {
    userStore.loadToken()
  }
})
</script>

<template>
  <div class="navbar">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <img src="/logo.png" />
          غسلة
        </router-link>
      </div>

      <div class="links">
        <router-link to="/">الرئيسية</router-link>
        <a href="/#about">من نحن</a>
        <a href="/#service">الخدمات</a>
      </div>

      <div class="btn">
        <router-link v-if="!userStore.isLoggedIn" to="/login">
          تسجيل الدخول
        </router-link>

        <router-link v-else to="/dashboard" class="dashboard-btn">
          لوحة التحكم
        </router-link>
      </div>
    </div>
  </div>
</template>
