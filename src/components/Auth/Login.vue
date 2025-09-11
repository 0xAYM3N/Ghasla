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

async function submitLoginForm() {
  if (!form.value.email || !form.value.password) {
    message.value = 'الرجاء إدخال البريد وكلمة المرور'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const response = await axios.post('http://localhost:3000/login', {
      email: form.value.email,
      password: form.value.password
    })

    // حفظ التوكن
    await userStore.setToken(response.data.accessToken)

    // حفظ بيانات المستخدم والدور
    if (response.data.user) {
      userStore.user = response.data.user
      userStore.role = response.data.user.role || null
    }

    // التوجيه بناءً على الدور
    if (userStore.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error(error)
    if (error.response?.status === 400) {
      message.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    } else if (error.response?.status === 500) {
      message.value = 'خطأ في الخادم، حاول لاحقاً'
    } else {
      message.value = 'فشل تسجيل الدخول، تحقق من اتصالك'
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
        <div class="auth-title"><span>تسجيل الدخول</span></div>

        <form @submit.prevent="submitLoginForm">
          <div class="auth-row">
            <i class="fa-solid fa-envelope"></i>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="Email" 
              autocomplete="email"
              required 
            />
          </div>

          <div class="auth-row">
            <i class="fas fa-lock"></i>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="Password" 
              autocomplete="current-password"
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

