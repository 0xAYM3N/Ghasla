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
    message.value = '⚠️ الرجاء إدخال البريد وكلمة المرور'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const res = await axios.post('http://localhost:3000/login', {
      email: form.value.email,
      password: form.value.password
    })

    // حفظ التوكن والمستخدم في Pinia
    userStore.setToken(res.data.accessToken, res.data.user)

    // توجيه للصفحة الرئيسية
    router.push('/')
  } catch (err) {
    console.error(err)

    if (err.response?.status === 400) {
      message.value = '⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة'
    } else if (err.response?.status === 500) {
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

