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
    console.error('❌ Error fetching user:', err.message)
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
    fieldMessages[field] = 'No changes detected'
    editMode[field] = false
    return
  }

  if (!value) {
    fieldMessages[field] = `${field} cannot be empty`
    return
  }

  try {
    if (field === 'email') {
      const { error } = await supabase.auth.updateUser({ email: value })
      if (error) {
        if (error.message.includes("already registered")) {
          fieldMessages.email = "This email is already in use"
        } else {
          fieldMessages.email = "Error while updating email"
        }
        return
      }

      originalValues.email = value
      userStore.user = { ...userStore.user, email: value }
      globalMessage.value = 'Email updated. Please confirm your new email.'
    }

    if (field === 'password') {
      if (value.length < 6) {
        fieldMessages.password = 'Password must be at least 6 characters'
        return
      }

      const { error } = await supabase.auth.updateUser({ password: value })
      if (error) {
        fieldMessages.password = "Error while updating password"
        return
      }

      form.password = ''
      globalMessage.value = 'Password updated successfully'
    }

    editMode[field] = false
    fieldMessages[field] = ''
    setTimeout(() => (globalMessage.value = ''), 4000)
  } catch (err) {
    console.error('❌ Error updating:', err.message)
    fieldMessages[field] = 'Error while updating'
  }
}
</script>

<template>
  <div class="account">
    <h2>Account Management</h2>

    <div v-if="globalMessage" class="toast">{{ globalMessage }}</div>

    <!-- Email -->
    <div class="form-row">
      <label>Email</label>
      <div class="input-group">
        <input v-model="form.email" :disabled="!editMode.email" />
        <button v-if="!editMode.email" class="edit-btn" @click="enableEdit('email')">Edit</button>
        <button v-else class="save-btn" @click="handleSave('email')">Save</button>
        <button v-if="editMode.email" class="cancel-btn" @click="cancelEdit('email')">Cancel</button>
      </div>
      <p class="error" v-if="fieldMessages.email">{{ fieldMessages.email }}</p>
    </div>

    <!-- Password -->
    <div class="form-row">
      <label>Change Password</label>
      <div class="input-group">
        <input
          type="password"
          v-model="form.password"
          :disabled="!editMode.password"
          placeholder="New password"
        />
        <button v-if="!editMode.password" class="edit-btn" @click="enableEdit('password')">Edit</button>
        <button v-else class="save-btn" @click="handleSave('password')">Save</button>
        <button v-if="editMode.password" class="cancel-btn" @click="cancelEdit('password')">Cancel</button>
      </div>
      <p class="error" v-if="fieldMessages.password">{{ fieldMessages.password }}</p>
    </div>
  </div>
</template>

