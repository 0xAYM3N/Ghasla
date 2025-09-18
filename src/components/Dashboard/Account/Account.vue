<script setup>
import './Account.css'
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const originalValues = reactive({ ...form })
const editMode = reactive({ email: false, password: false })
const fieldMessages = reactive({ email: '', password: '' })
const globalMessage = ref('')

const fetchUserData = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error

    const user = data.user
    if (user) {
      form.email = user.email
      Object.assign(originalValues, { email: form.email })
      userStore.user = user
    }
  } catch (err) {
    console.error('خطأ عند جلب بيانات المستخدم:', err.message)
  }
}

onMounted(fetchUserData)

const enableEdit = (field) => {
  editMode[field] = true
  fieldMessages[field] = ''
}

const cancelEdit = (field) => {
  form[field] = originalValues[field]
  editMode[field] = false
  fieldMessages[field] = ''
}

const handleSave = async (field) => {
  const value = form[field]

  if (field !== 'password' && value === originalValues[field]) {
    fieldMessages[field] = 'لم يتم إجراء أي تعديل'
    editMode[field] = false
    return
  }

  if (!value) {
    fieldMessages[field] = `${field === 'email' ? 'البريد الإلكتروني' : 'كلمة المرور'} لا يمكن أن يكون فارغ`
    return
  }

  try {
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        fieldMessages.email = "الرجاء إدخال بريد إلكتروني صالح"
        return
      }

      const { error } = await supabase.auth.updateUser({ email: value })
      if (error) {
        if (error.message.includes("already registered")) {
          fieldMessages.email = "البريد الإلكتروني مسجّل مسبقًا"
        } else {
          fieldMessages.email = "حدث خطأ أثناء تحديث البريد الإلكتروني"
        }
        return
      }

      originalValues.email = value
      userStore.user = { ...userStore.user, email: value }
      globalMessage.value = 'تم تحديث البريد الإلكتروني'
    }

    if (field === 'password') {
      if (value.length < 6) {
        fieldMessages.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        return
      }

      const { error } = await supabase.auth.updateUser({ password: value })
      if (error) {
        fieldMessages.password = "حدث خطأ أثناء تحديث كلمة المرور"
        return
      }

      form.password = ''
      globalMessage.value = 'تم تحديث كلمة المرور بنجاح'
    }

    editMode[field] = false
    fieldMessages[field] = ''
    setTimeout(() => (globalMessage.value = ''), 4000)
  } catch (err) {
    console.error('خطأ عند التحديث:', err.message)
    fieldMessages[field] = 'حدث خطأ أثناء التحديث'
  }
}

// Logout
function logout() {
  if (userStore.isLoggedIn) {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <div class="account">
    <h2>إدارة الحساب</h2>

    <div v-if="globalMessage" class="toast">{{ globalMessage }}</div>

    <!-- Email -->
    <div class="form-row">
      <label>البريد الإلكتروني</label>
      <div class="input-group">
        <input v-model="form.email" :disabled="!editMode.email" />
        <button v-if="!editMode.email" class="edit-btn" @click="enableEdit('email')">تعديل</button>
        <button v-else class="save-btn" @click="handleSave('email')">حفظ</button>
        <button v-if="editMode.email" class="cancel-btn" @click="cancelEdit('email')">إلغاء</button>
      </div>
      <p class="error" v-if="fieldMessages.email">{{ fieldMessages.email }}</p>
    </div>

    <!-- Password -->
    <div class="form-row">
      <label>تغيير كلمة المرور</label>
      <div class="input-group">
        <input
          type="password"
          v-model="form.password"
          :disabled="!editMode.password"
          placeholder="كلمة المرور الجديدة"
        />
        <button v-if="!editMode.password" class="edit-btn" @click="enableEdit('password')">تعديل</button>
        <button v-else class="save-btn" @click="handleSave('password')">حفظ</button>
        <button v-if="editMode.password" class="cancel-btn" @click="cancelEdit('password')">إلغاء</button>
      </div>
      <p class="error" v-if="fieldMessages.password">{{ fieldMessages.password }}</p>
    </div>

    <div class="form-row logout-section">
      <button class="logout-btn" @click="logout">
        <i class="fa-solid fa-right-from-bracket"></i>
        تسجيل خروج
      </button>
    </div>
  </div>
</template>

