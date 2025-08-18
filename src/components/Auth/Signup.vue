<script>
import './style.css'
</script>

<template>
  <div class="auth-page">
    <div class="container">

    <div class="auth-box">
        <div class="auth-title"><span>انشاء حساب</span></div>
        <form action="#">
            <div class="auth-row">
                <i class="fas fa-user"></i>
                <input type="text" placeholder="Username" name="username" required />
            </div>
            <div class="auth-row">
                <i class="fa-solid fa-envelope"></i>
                <input type="text" placeholder="Email" name="email" required />
            </div>
            <div class="auth-row">
                <i class="fas fa-lock"></i>
                <input type="password" placeholder="Password" name="password" required />
            </div>
            <div class="auth-row">
                <i class="fas fa-lock"></i>
                <input type="password" placeholder="Confirm Password" name="confirmPass" required />
            </div>
            <div class="auth-row auth-button">
                <input type="submit" value="Signup" />
            </div>
            <div class="auth-link">
              هل لديك حساب؟
              <router-link to="/login">تسجيل دخول</router-link>
            </div>
        </form>
    </div>
    </div>
  </div>
</template>
