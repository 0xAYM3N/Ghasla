<script setup>
import './style.css'
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-box">
        <div class="auth-title">
          <span>تسجيل الدخول</span>
        </div>
        <form action="">
          <div class="auth-row">
            <i class="fa-solid fa-envelope"></i>
            <input type="text" placeholder="Email" name="email" required />
          </div>
          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input type="password" placeholder="Password" name="password" required />
          </div>
          <div class="auth-row auth-button">
            <input type="submit" value="Login" />
          </div>
          <div class="auth-link">
            ليس لديك حساب؟
            <router-link to="/signup">انشاء حساب</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
