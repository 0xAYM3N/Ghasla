<script>
import './Navbar.css'
</script>

<template>
  <div class="navbar">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <img src="/logo.png">
          غسلة
        </router-link>
      </div>

      <div class="links">
        <router-link to="/">الرئيسية</router-link>
        <router-link to="/">من نحن</router-link>
        <router-link to="/">العروض</router-link>
      </div>

      <div class="btn">
        <router-link to="/login">تسجيل الدخول</router-link>
      </div>
    </div>
  </div>
</template>
