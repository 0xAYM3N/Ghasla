<script setup>
import './style.css'
import { ref } from "vue";
import axios from "axios";

const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
});

const message = ref("");

// Sent Data To Api
async function submitSignupForm() {
  if (form.value.password !== form.value.confirmPassword) {
    message.value = "كلمة المرور غير متطابقة ❌";
    return;
  }

  try {
    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        confirmPassword: form.value.confirmPassword,
      },
    );

    console.log("✅ Response:", response.data);
  } catch (error) {
    console.log("Error In The Sent", error);
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-box">
        <div class="auth-title">
          <span>انشاء حساب</span>
        </div>
        <form @submit.prevent="submitSignupForm">
          <div class="auth-row">
            <i class="fas fa-user"></i>
            <input v-model="form.username" type="text" placeholder="Username" name="username" required />
          </div>
          <div class="auth-row">
            <i class="fa-solid fa-envelope"></i>
            <input v-model="form.email" type="email" placeholder="Email" name="email" required />
          </div>
          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input v-model="form.password" type="password" placeholder="Password" name="password" required />
          </div>
          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input v-model="form.confirmPassword" type="password" placeholder="Confirm Password" name="confirmPass" required />
          </div>
          <p v-if="message">{{ message }}</p>
          <div class="auth-row auth-button">
            <input type="submit" value="Signup"/>
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
