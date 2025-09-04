<script setup>
import './Dashboard.css'

const user = {
  name: "Ghasla",
  email: "Ghasla@ghasla.com",
}
</script>

<template>
  <div class="dashboard">
    <div class="sidebar">
      <div class="top-part">
        <div class="sidebar-header">
          <h2 class="sidebar-title">غسلة</h2>
          <div class="sidebar-toggle">
            <i class="fa-solid fa-bars"></i>
          </div>
        </div>

        <div class="sidebar-nav">
          <router-link to="#"><i class="fa-regular fa-user"></i> معلومات الحساب</router-link>
          <router-link to="#"><i class="fa-regular fa-bell"></i> الاشعارات</router-link>
        </div>
      </div>

      <div class="sidebar-user">
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
        <div class="user-icon">
          <i class="fa-solid fa-user"></i>
        </div>
      </div>
    </div>
  </div>
</template>
