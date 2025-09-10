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

const getUserIdFromToken = () => {
  if (!userStore.token) return null
  try {
    const decoded = jwtDecode(userStore.token)
    return decoded?.id || decoded?.userId || decoded?.sub || null
  } catch (err) {
    console.error('خطأ في فك التوكن:', err)
    return null
  }
}

const fetchUserData = async () => {
  const userId = getUserIdFromToken()
  if (!userId) {
    console.error('لا يوجد userId في التوكن')
    return
  }

  try {
    const res = await axios.get(`http://localhost:3000/users/${userId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    const user = res.data
    form.email = user.email
    Object.assign(originalValues, form)
    userStore.user = user
  } catch (err) {
    console.error('خطأ في تحميل البيانات:', err)
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
    fieldMessages[field] = `${field} لا يمكن أن يكون فارغ`
    return
  }

  if (field === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldMessages.email = 'الرجاء إدخال بريد إلكتروني صالح'
      return
    }

    try {
      const res = await axios.get(`http://localhost:3000/users?email=${value}`)
      const existingUser = res.data.find((u) => u.email === value && u.id !== userStore.user.id)
      if (existingUser) {
        fieldMessages.email = 'البريد الإلكتروني مستخدم مسبقًا'
        return
      }
    } catch (err) {
      console.error('خطأ في التحقق من البريد:', err)
    }
  }

  if (field === 'password' && value.length < 6) {
    fieldMessages.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    return
  }

  try {
    const body = field === 'password' ? { password: value } : { [field]: value }

    await axios.patch(`http://localhost:3000/users/${userStore.user.id}`, body, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    if (field !== 'password') {
      originalValues[field] = value
      userStore.user = { ...userStore.user, [field]: value }
    } else {
      form.password = ''
    }

    editMode[field] = false
    fieldMessages[field] = ''
    globalMessage.value = 'تم التحديث بنجاح'
    setTimeout(() => (globalMessage.value = ''), 3000)
  } catch (err) {
    console.error(err)
    fieldMessages[field] = 'حدث خطأ أثناء التحديث'
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
        <input type="password" v-model="form.password" :disabled="!editMode.password" placeholder="كلمة المرور الجديدة" />
        <button v-if="!editMode.password" class="edit-btn" @click="enableEdit('password')">تعديل</button>
        <button v-else class="save-btn" @click="handleSave('password')">حفظ</button>
        <button v-if="editMode.password" class="cancel-btn" @click="cancelEdit('password')">إلغاء</button>
      </div>
      <p class="error" v-if="fieldMessages.password">{{ fieldMessages.password }}</p>
    </div>
  </div>
</template>

