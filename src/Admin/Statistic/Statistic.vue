<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import "./Statistic.css"

const usersCount = ref(0)
const bookingsCount = ref(0)
const totalRevenue = ref(0)
const loading = ref(true)
const error = ref(null)

async function loadStats() {
  try {
    const [resUsers, resBookings] = await Promise.all([
      axios.get("http://localhost:3000/users"),
      axios.get("http://localhost:3000/bookings")
    ])

    usersCount.value = resUsers.data.length
    bookingsCount.value = resBookings.data.length

    totalRevenue.value = resBookings.data
      .filter(b => b.status === "مؤكد")
      .reduce((sum, b) => sum + b.price, 0)

  } catch (err) {
    console.error(err)
    error.value = "حدث خطأ أثناء تحميل الإحصائيات"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="statistic">
    <h2>الإحصائيات</h2>

    <div v-if="loading" class="loading">جارٍ التحميل...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="cards">
      <div class="card">
        <h2>عدد المستخدمين</h2>
        <p>{{ usersCount }}</p>
      </div>
      <div class="card">
        <h2>عدد الحجوزات</h2>
        <p>{{ bookingsCount }}</p>
      </div>
      <div class="card">
        <h2>إجمالي الأرباح</h2>
        <p>{{ totalRevenue }}$</p> 
      </div>
    </div>
  </div>
</template>

