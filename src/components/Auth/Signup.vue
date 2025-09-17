<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'
import axios from 'axios'
import './style.css'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const message = ref('')
const isSubmitting = ref(false)

function validateForm() {
  if (!form.value.email || !form.value.password || !form.value.confirmPassword) {
    return 'الرجاء إدخال جميع الحقول'
  }
  if (form.value.password.length < 6) {
    return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  }
  if (form.value.password !== form.value.confirmPassword) {
    return 'كلمتا المرور غير متطابقتين'
  }
  return null
}

async function submitSignupForm() {
  const validationError = validateForm()
  if (validationError) {
    message.value = validationError
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const response = await axios.post('/api/signup', {
      email: form.value.email,
      password: form.value.password
    }, { withCredentials: true })

    const token = response.data.token 
    
    localStorage.setItem('token', token)
    
    const decodedToken = jwtDecode(token) 
    
    userStore.user = decodedToken.user
    userStore.role = decodedToken.role

    router.push('/')
  } catch (err) {
    console.error(err)
    message.value = 'تعذر إنشاء الحساب'
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
            <input v-model="form.email" type="email" placeholder="Email" required />
          </div>
          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input v-model="form.password" type="password" placeholder="Password" required />
          </div>
          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input v-model="form.confirmPassword" type="password" placeholder="Confirm Password" required />
          </div>

          <div class="error-msg">
            <p v-if="message">{{ message }}</p>
          </div>

          <div class="auth-row auth-button">
            <input type="submit" :disabled="isSubmitting" :value="isSubmitting ? 'جارٍ الإرسال...' : 'إنشاء حساب'" />
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

