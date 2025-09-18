<script setup>
import { ref, computed, onMounted } from "vue"
import { supabase } from "../../lib/supabaseClient"
import "./ClientsBookings.css"
import ClientMap from "../ClientMap/ClientMap.vue"

const bookings = ref([])
const loading = ref(true)
const error = ref(null)
const filterStatus = ref("all")
const showMapModal = ref(false)
const selectedUserCoords = ref([24.7136, 46.6753])

const searchQuery = ref("")
const searchField = ref("email")

async function loadData() {
  try {
    loading.value = true
    error.value = null

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")

    if (bookingsError) throw bookingsError

    bookings.value = bookingsData || []
  } catch (err) {
    error.value = "خطأ أثناء جلب البيانات"
    console.error("loadData error:", err.message)
  } finally {
    loading.value = false
  }
}

async function updateBookingStatus(booking, newStatus) {
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id)
    if (error) throw error
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث الحالة:", err.message)
  }
}

function openMapModal(booking) {
  if (!booking?.location) {
    selectedUserCoords.value = [24.7136, 46.6753]
  } else {
    selectedUserCoords.value = Array.isArray(booking.location)
      ? [...booking.location]
      : [booking.location.lat, booking.location.lng]
  }
  showMapModal.value = true
}

function closeMapModal() {
  showMapModal.value = false
}

function formatDateTime(unix) {
  if (!unix) return "-"
  const d = new Date(unix * 1000)
  return d.toLocaleString("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

const filteredBookings = computed(() => {
  let result = bookings.value

  if (filterStatus.value !== "all") {
    result = result.filter(b => b.status === filterStatus.value)
  }

  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(b => {
      if (searchField.value === "type") return b.type?.toLowerCase().includes(query)
      if (searchField.value === "email") return b.email?.toLowerCase().includes(query)
      return false
    })
  }

  return result
})

onMounted(loadData)
</script>

<template>
  <div class="clients-bookings">
    <div class="header">
      <h2>جميع الحجوزات</h2>
      <div class="controls">
        <div class="filter">
          <label>تصفية:</label>
          <select v-model="filterStatus">
            <option value="all">الكل</option>
            <option value="قيد الانتظار">قيد الانتظار</option>
            <option value="مؤكد">مؤكد</option>
            <option value="ملغى">ملغى</option>
          </select>
        </div>
        <div class="search">
          <select v-model="searchField">
            <option value="email">إيميل العميل</option>
            <option value="type">نوع الخدمة</option>
          </select>
          <input type="text" v-model="searchQuery" placeholder="ابحث هنا..." />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">جارٍ التحميل...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="bookings-table-container">
        <table class="bookings-table">
          <thead>
            <tr>
              <th>رقم الحجز</th>
              <th>الخدمة</th>
              <th>التاريخ والوقت</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>إيميل العميل</th>
              <th>إظهار الموقع</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(b, index) in filteredBookings" :key="b.id">
              <td>{{ index + 1 }}</td>
              <td>{{ b.type }}</td>
              <td>{{ formatDateTime(b.datetime) }}</td>
              <td>{{ b.price }}$</td>
              <td>
                <select
                  class="status-select"
                  :class="{
                    'status-pending': b.status === 'قيد الانتظار',
                    'status-confirmed': b.status === 'مؤكد',
                    'status-cancelled': b.status === 'ملغى'
                  }"
                  v-model="b.status"
                  @change="updateBookingStatus(b, b.status)"
                >
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مؤكد">مؤكد</option>
                  <option value="ملغى">ملغى</option>
                </select>
              </td>
              <td>{{ b.email || "-" }}</td>
              <td>
                <button class="show-map-btn" @click="openMapModal(b)">
                  عرض موقع العميل
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showMapModal" class="modal">
      <div class="modal-content">
        <h3>موقع العميل</h3>
        <ClientMap :coords="selectedUserCoords" />
        <button class="close-modal" @click="closeMapModal">إغلاق</button>
      </div>
    </div>
  </div>
</template>
