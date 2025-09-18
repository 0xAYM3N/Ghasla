<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { supabase } from '../../../lib/supabaseClient'
import './Bookings.css'

const showPopup = ref(false)
const popupMessage = ref("")
const bookingToCancel = ref(null)
const bookings = ref([])
const loadingCancel = ref(false) 

const userStore = useUserStore()

function openPopup(msg, id) {
  popupMessage.value = msg
  bookingToCancel.value = id
  showPopup.value = true
}

function closePopup() {
  showPopup.value = false
  bookingToCancel.value = null
  loadingCancel.value = false
}

async function loadBookings() {
  if (!userStore.user) return
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userStore.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    bookings.value = data || []
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الحجوزات:", error.message)
  }
}

function cancelBooking(id) {
  openPopup("هل أنت متأكد أنك تريد إلغاء هذا الحجز؟", id)
}

async function confirmCancel() {
  if (!bookingToCancel.value || loadingCancel.value) return

  loadingCancel.value = true 

  try {
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'ملغى' })
      .eq('id', bookingToCancel.value)

    if (updateError) throw updateError

    bookings.value = bookings.value.map(b =>
      b.id === bookingToCancel.value ? { ...b, status: 'ملغى' } : b
    )
  } catch (error) {
    console.error("❌ خطأ أثناء إلغاء الحجز:", error.message)
  }

  closePopup() 
}

function formatDateTime(unix) {
  if (!unix) return { date: "-", time: "-" }
  const d = new Date(unix * 1000)
  const date = d.toLocaleDateString("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
  const time = d.toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
  return { date, time }
}

onMounted(loadBookings)
</script>

<template>
  <div class="bookings-page">
    <div class="header">
      <h2>إدارة الحجوزات</h2>
      <router-link class="add-btn" to="/booking">+ إضافة حجز جديد</router-link>
    </div>

    <div class="bookings-cards">
      <div 
        v-for="booking in bookings" 
        :key="booking.id" 
        class="booking-card"
        :class="{ 'disabled-card': booking.status === 'ملغى' }"
      >
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

        <div class="card-actions" v-if="booking.status === 'قيد الانتظار'">
          <button class="cancel-btn" @click="cancelBooking(booking.id)">إلغاء</button>
        </div>
      </div>
    </div>

    <!-- Popup -->
    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <h3>{{ popupMessage }}</h3>
        <div class="buttons">
          <button 
            class="confirm-cancel" 
            @click="confirmCancel" 
            :disabled="loadingCancel"
          >
            {{ loadingCancel ? "⏳ جاري التنفيذ..." : "تأكيد الإلغاء" }}
          </button>
          <button class="close-popup" @click="closePopup">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>
