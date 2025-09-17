<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { supabase } from '../../../lib/supabaseClient'
import './Bookings.css'

const showPopup = ref(false)
const popupMessage = ref("")
const bookingToDelete = ref(null)
const bookings = ref([])

const userStore = useUserStore()

function openPopup(msg, id) {
  popupMessage.value = msg
  bookingToDelete.value = id
  showPopup.value = true
}

function closePopup() {
  showPopup.value = false
  bookingToDelete.value = null
}

async function loadBookings() {
  if (!userStore.user) return
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userStore.user.id)
      .order('datetime', { ascending: false })

    if (error) throw error
    bookings.value = data || []
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الحجوزات:", err.message)
  }
}

async function deleteBooking(id) {
  openPopup("هل أنت متأكد أنك تريد حذف هذا الحجز؟", id)
}

async function confirmDelete() {
  if (!bookingToDelete.value) return
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingToDelete.value)

    if (error) throw error

    bookings.value = bookings.value.filter(b => b.id !== bookingToDelete.value)
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الحجز", err.message)
  }
  bookingToDelete.value = null
  closePopup()
}

function formatDateTime(unix) {
  if (!unix) return { date: "-", time: "-" }
  const d = new Date(unix * 1000)
  const date = d.toLocaleDateString("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
  const time = d.toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
  return { date, time }
}

onMounted(() => {
  loadBookings()
})
</script>

<template>
  <div class="bookings-page">
    <div class="header">
      <h2>إدارة الحجوزات</h2>
      <router-link class="add-btn" to="/booking">+ إضافة حجز جديد</router-link>
    </div>

    <div class="bookings-cards">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="card-row">
          <span class="label">الخدمة:</span>
          <span>{{ booking.type }}</span>
        </div>
        <div class="card-row">
          <span class="label">اليوم:</span>
          <span>{{ formatDateTime(booking.datetime).date }}</span>
        </div>
        <div class="card-row">
          <span class="label">الوقت:</span>
          <span>{{ formatDateTime(booking.datetime).time }}</span>
        </div>
        <div class="card-row">
          <span class="label">سعر الخدمة:</span>
          <span>{{ booking.price }}$</span>
        </div>
        <div class="card-row">
          <span class="label">الحالة:</span>
          <span 
            :class="{
              'status-confirmed': booking.status === 'مؤكد',
              'status-pending': booking.status === 'قيد الانتظار',
              'status-cancelled': booking.status === 'ملغى'
            }"
          >
            {{ booking.status }}
          </span>
        </div>
        <div class="card-actions">
          <button class="delete-btn" @click="deleteBooking(booking.id)">حذف</button>
        </div>
      </div>
    </div>

    <!-- Popup -->
    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <h3>{{ popupMessage }}</h3>
        <div class="buttons">
          <button class="confirm-delete" @click="confirmDelete">تأكيد الحذف</button>
          <button class="close-popup" @click="closePopup">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>
