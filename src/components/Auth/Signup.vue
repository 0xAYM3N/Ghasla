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
    const { data, error } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password
    })

    if (error) throw error

    const user = data?.user
    if (!user) {
      message.value = 'تم إنشاء الحساب، تحقق من بريدك لتفعيل الحساب'
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          role: 'user',
          balance: 0,
        }
      ])

    if (profileError) throw profileError

    await userStore.initAuth()

    router.push('/dashboard')
  } catch (error) {
    console.error(error)
    message.value = error.message || 'فشل إنشاء الحساب، تحقق من اتصالك'
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
