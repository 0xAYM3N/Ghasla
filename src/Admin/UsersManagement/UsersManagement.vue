<script setup>
import { ref, computed, onMounted } from "vue"
import { supabase } from "../../lib/supabaseClient"
import './UsersManagement.css'

const users = ref([])
const loading = ref(true)
const error = ref(null)

const filterRole = ref("all")
const searchQuery = ref("")

async function loadUsers() {
  try {
    loading.value = true
    error.value = null

    const { data, error: usersError } = await supabase
      .from("users_with_email")
      .select("*")
      .order("created_at", { ascending: false }) 

    if (usersError) throw usersError

    users.value = data || []
  } catch (err) {
    error.value = "خطأ أثناء جلب بيانات المستخدمين"
    console.error("loadUsers error:", err.message)
  } finally {
    loading.value = false
  }
}

const filteredUsers = computed(() => {
  let result = users.value

  if (filterRole.value !== "all") {
    result = result.filter(u => u.role === filterRole.value)
  }

  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u => u.email?.toLowerCase().includes(query))
  }

  return result
})

onMounted(loadUsers)
</script>

<template>
  <div class="users-management">
    <div class="header">
      <h2>قائمة المستخدمين</h2>
      <div class="controls">
        <div class="filter">
          <select v-model="filterRole">
            <option value="all">all</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div class="search">
          <input type="text" v-model="searchQuery" placeholder="ابحث عن الإيميل..." />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">جارٍ التحميل...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الإيميل</th>
              <th>الدور</th>
              <th>الرصيد</th>
              <th>تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, index) in filteredUsers" :key="u.id">
              <td>{{ filteredUsers.length - index }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td>{{ u.balance }}</td>
              <td>{{ new Date(u.created_at).toLocaleString("en-US") }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
