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
        <a href="/#about">من نحن</a>
        <a href="/#service">الخدمات</a>
      </div>

      <div class="btn">
        <router-link to="/login">تسجيل الدخول</router-link>
      </div>
    </div>
  </div>
</template>
