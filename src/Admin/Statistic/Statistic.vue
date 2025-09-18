<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../../lib/supabaseClient"
import "./Statistic.css"

const usersCount = ref(0)
const bookingsCount = ref(0)
const totalRevenue = ref(0)
const loading = ref(true)
const error = ref(null)

async function loadStats() {
  try {
    error.value = null
    loading.value = true

    const { count: users, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (usersError) throw usersError
    usersCount.value = users || 0

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, price, status")

    if (bookingsError) throw bookingsError
    bookingsCount.value = bookings.length

    totalRevenue.value = bookings
      .filter(b => b.status === "مؤكد")
      .reduce((sum, b) => sum + (b.price || 0), 0)

  } catch (err) {
    console.error("❌ Error loading stats:", err.message)
    error.value = "حدث خطأ أثناء تحميل الإحصائيات"
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
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
        <p>{{ totalRevenue.toLocaleString() }}$</p> 
      </div>
    </div>
  </div>
</template>

