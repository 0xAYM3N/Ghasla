<script setup>
import './style.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'
import { supabase } from '../../lib/supabaseClient'

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (error) throw error

    if (!data?.session) {
      message.value = 'تم تسجيل الدخول ولكن الحساب يحتاج تفعيل عبر البريد. تحقق من صندوق البريد الخاص بك.'
      isSubmitting.value = false
      return
    }

    await userStore.initAuth()

    const role = userStore.role || userStore.profile?.role || null

    if (role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('Login error:', err)
    message.value = err?.message || 'فشل تسجيل الدخول، تحقق من البيانات أو اتصالك'
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
