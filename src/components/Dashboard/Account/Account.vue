<script setup>
import './Account.css'
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const userStore = useUserStore()

const form = reactive({
  email: '',
  password: ''
})
const originalValues = reactive({ ...form })
const editMode = reactive({ email: false, password: false })
const fieldMessages = reactive({ email: '', password: '' })
const globalMessage = ref('')
const isCheckingEmail = ref(false)

// ✅ استخرج ID من التوكن
const getUserId = () => {
  if (!userStore.token) return null
  try {
    const decoded = jwtDecode(userStore.token)
    return decoded?.id || decoded?.userId || null
  } catch {
    return null
  }
}

// ✅ جلب بيانات المستخدم
const fetchUserData = async () => {
  const userId = getUserId()
  if (!userId) return console.error('❌ لا يوجد userId')

  try {
    const res = await axios.get(`http://localhost:3000/users/${userId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    form.email = res.data.email
    Object.assign(originalValues, { email: res.data.email, password: '' })
    userStore.user = res.data
  } catch (err) {
    console.error('❌ خطأ في تحميل البيانات:', err)
  }
}

// ✅ تحقق إذا الإيميل مأخوذ
const isEmailTaken = async (email) => {
  const value = (email || '').trim().toLowerCase()
  if (!value) return false

  isCheckingEmail.value = true
  try {
    const res = await axios.get('http://localhost:3000/users')
    const users = Array.isArray(res.data) ? res.data : []
    return users.some(
      (u) => u.email?.toLowerCase() === value && u.id !== userStore.user?.id
    )
  } catch (err) {
    console.error('خطأ أثناء التحقق من البريد:', err)
    return true
  } finally {
    isCheckingEmail.value = false
  }
}

// ✅ تفعيل التعديل
const enableEdit = (field) => {
  editMode[field] = true
  fieldMessages[field] = ''
}

// ✅ إلغاء التعديل
const cancelEdit = (field) => {
  form[field] = originalValues[field]
  editMode[field] = false
  fieldMessages[field] = ''
}

// ✅ حفظ التعديلات
const handleSave = async (field) => {
  const value = form[field]

  // تحقق من التغييرات
  if (value === originalValues[field] && field !== 'password') {
    fieldMessages[field] = '⚠️ لم يتم إجراء أي تعديل'
    return
  }

  // تحقق من البريد
  if (field === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldMessages.email = '❌ بريد غير صالح'
      return
    }
    if (await isEmailTaken(value)) {
      fieldMessages.email = '❌ البريد مستخدم بالفعل'
      return
    }
  }

  // تحقق من الباسورد
  if (field === 'password') {
    if (!value || value.length < 6) {
      fieldMessages.password = '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      return
    }
  }

  try {
    const body = field === 'password' ? { password: value } : { [field]: value }
    await axios.patch(`http://localhost:3000/users/${userStore.user.id}`, body, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    // تحديث البيانات محليًا
    if (field !== 'password') {
      originalValues[field] = value
      userStore.user = { ...userStore.user, [field]: value }
    } else {
      form.password = ''
    }

    editMode[field] = false
    fieldMessages[field] = ''
    globalMessage.value =
      field === 'password'
        ? '✅ تم تغيير كلمة المرور'
        : '✅ تم تحديث البيانات'

    setTimeout(() => (globalMessage.value = ''), 3000)
  } catch (err) {
    console.error(err)
    fieldMessages[field] = '❌ حدث خطأ أثناء التحديث'
  }
}

onMounted(fetchUserData)
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
        <button v-if="!editMode.email" @click="enableEdit('email')">تعديل</button>
        <button v-else @click="handleSave('email')">حفظ</button>
        <button v-if="editMode.email" @click="cancelEdit('email')">إلغاء</button>
      </div>
      <p class="error" v-if="fieldMessages.email">{{ fieldMessages.email }}</p>
    </div>

    <!-- Password -->
    <div class="form-row">
      <label>كلمة المرور</label>
      <div class="input-group">
        <input
          type="password"
          v-model="form.password"
          :disabled="!editMode.password"
          placeholder="كلمة المرور الجديدة"
        />
        <button v-if="!editMode.password" @click="enableEdit('password')">تعديل</button>
        <button v-else @click="handleSave('password')">حفظ</button>
        <button v-if="editMode.password" @click="cancelEdit('password')">إلغاء</button>
      </div>
      <p class="error" v-if="fieldMessages.password">{{ fieldMessages.password }}</p>
    </div>
  </div>
</template>

