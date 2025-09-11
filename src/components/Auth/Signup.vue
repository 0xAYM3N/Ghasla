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
  password: '',
  confirmPassword: ''
})

const message = ref('')
const isSubmitting = ref(false)

async function submitSignupForm() {
  if (!form.value.email || !form.value.password || !form.value.confirmPassword) {
    message.value = 'الرجاء إدخال جميع الحقول'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(form.value.email)) {
    message.value = 'الرجاء إدخال بريد إلكتروني صالح'
    return
  }

  if (form.value.password.length < 6) {
    message.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    message.value = 'كلمتا المرور غير متطابقتين'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const res = await axios.post('http://localhost:3000/register', {
      email: form.value.email,
      password: form.value.password,
      balance: 0,
      transactions: [],
      role: 'user'
    })

    userStore.setToken(res.data.accessToken)
    if (res.data.user) {
      userStore.user = res.data.user
      userStore.role = res.data.user.role || 'user'
    }

    router.push('/dashboard')
  } catch (error) {
    console.error(error)

    if (error.response?.data === 'Email already exists') {
      message.value = 'البريد الإلكتروني مستخدم بالفعل'
    } else if (error.response?.status === 500) {
      message.value = 'خطأ في الخادم، حاول لاحقاً'
    } else {
      message.value = 'فشل إنشاء الحساب، تحقق من اتصالك'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-box">
        <div class="auth-title"><span>إنشاء حساب</span></div>

        <form @submit.prevent="submitSignupForm">
          <div class="auth-row">
            <i class="fa-solid fa-envelope"></i>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="Email" 
              autocomplete="username"
              required
            />
          </div>

          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="Password"
              autocomplete="new-password"
              required 
            />
          </div>

          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input 
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm Password"
              autocomplete="new-password"
              required 
            />
          </div>

          <div class="error-msg">
            <p v-if="message">{{ message }}</p>
          </div>

          <div class="auth-row auth-button">
            <input
              type="submit"
              :disabled="isSubmitting"
              :value="isSubmitting ? 'جارٍ الإرسال...' : 'إنشاء حساب'"
            />
          </div>

          <div class="auth-link">
            لديك حساب؟
            <router-link to="/login">تسجيل الدخول</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

