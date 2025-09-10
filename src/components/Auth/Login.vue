<script setup>
import './style.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  email: '',
  password: ''
})
const message = ref('')
const isSubmitting = ref(false)

function submitLoginForm() {
  if (!form.value.email || !form.value.password) {
    message.value = 'الرجاء إدخال البريد وكلمة المرور'
    return
  }

  isSubmitting.value = true
  message.value = ''

  axios.post('http://localhost:3000/login', {
    email: form.value.email,
    password: form.value.password
  })
    .then((response) => {
      userStore.setToken(response.data.accessToken)

      router.push('/')
    })
    .catch((error) => {
      console.error(error)

      if (error.response?.status === 400) {
        message.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      } else if (error.response?.status === 500) {
        message.value = 'خطأ في الخادم، حاول لاحقاً'
      } else {
        message.value = 'فشل تسجيل الدخول، تحقق من اتصالك'
      }
    })
    .finally(() => {
      isSubmitting.value = false
    })
}
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-box">
        <div class="auth-title"><span>تسجيل الدخول</span></div>

        <form @submit.prevent="submitLoginForm">
          <div class="auth-row">
            <i class="fa-solid fa-envelope"></i>
            <input v-model="form.email" type="email" placeholder="Email" required />
          </div>

          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input v-model="form.password" type="password" placeholder="Password" required />
          </div>

          <div class="error-msg">
            <p v-if="message">{{ message }}</p>
          </div>

          <div class="auth-row auth-button">
            <input
              type="submit"
              :disabled="isSubmitting"
              :value="isSubmitting ? 'جارٍ الإرسال...' : 'تسجيل الدخول'"
            />
          </div>

          <div class="auth-link">
            ليس لديك حساب؟
            <router-link to="/signup">إنشاء حساب</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

