<script setup>
import './Account.css'
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { supabase } from '../../../lib/supabaseClient'

const userStore = useUserStore()

const form = reactive({
  email: '',
  password: ''
})

const originalValues = reactive({ ...form })
const editMode = reactive({ email: false, password: false })
const fieldMessages = reactive({ email: '', password: '' })
const globalMessage = ref('')

const fetchUserData = async () => {
  if (!userStore.user) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, balance, created_at, auth:users(email)')
      .eq('id', userStore.user.id)
      .single()

    if (error) throw error

    form.email = data.auth.email
    Object.assign(originalValues, { email: form.email })
    userStore.user = { ...userStore.user, email: data.auth.email }
  } catch (err) {
    console.error('خطأ في تحميل البيانات:', err.message)
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

  try {
    if (field === 'email') {
      const { error } = await supabase.auth.updateUser({ email: value })
      if (error) throw error

      originalValues.email = value
      userStore.user = { ...userStore.user, email: value }
    }

    if (field === 'password') {
      if (value.length < 6) {
        fieldMessages.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        return
      }
      const { error } = await supabase.auth.updateUser({ password: value })
      if (error) throw error
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

