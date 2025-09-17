<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import axios from 'axios'
import './Bookings.css'

const showPopup = ref(false)
const popupMessage = ref("")
const bookingToCancel = ref(null)
const bookings = ref([])
const currentUser = ref(null)

const userStore = useUserStore()

function openPopup(msg, id) {
  popupMessage.value = msg
  bookingToCancel.value = id
  showPopup.value = true
}

function closePopup() {
  showPopup.value = false
  bookingToCancel.value = null
}

function getUserEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email
  } catch {
    return null
  }
}

async function loadBookings() {
  if (!userStore.token) return

  try {
    const resUsers = await axios.get('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    const email = getUserEmailFromToken(userStore.token)
    currentUser.value = resUsers.data.find(u => u.email === email)

    if (!currentUser.value) return

    const resBookings = await axios.get(`http://localhost:3000/bookings?userId=${currentUser.value.id}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    bookings.value = resBookings.data.reverse()
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الحجوزات:", error)
  }
}

function cancelBooking(id) {
  openPopup("هل أنت متأكد أنك تريد إلغاء هذا الحجز؟ سيتم استرجاع المبلغ.", id)
}

async function confirmCancel() {
  if (!bookingToCancel.value || !currentUser.value) return

  try {
    // 1️⃣ تحديث حالة الحجز إلى "ملغى"
    const booking = bookings.value.find(b => b.id === bookingToCancel.value)
    if (!booking) return

    await axios.patch(`http://localhost:3000/bookings/${bookingToCancel.value}`, {
      status: 'ملغى'
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    // 2️⃣ استرجاع المبلغ إلى رصيد المستخدم
    const newBalance = currentUser.value.balance + booking.price
    await axios.patch(`http://localhost:3000/users/${currentUser.value.id}`, {
      balance: newBalance
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    currentUser.value.balance = newBalance

    // 3️⃣ تحديث القائمة محلياً
    booking.status = 'ملغى'

  } catch (error) {
    console.error("❌ خطأ أثناء إلغاء الحجز", error)
  }

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
      <div 
        v-for="booking in bookings" 
        :key="booking.id" 
        class="booking-card"
        :class="{ 'disabled-card': booking.status !== 'قيد الانتظار' }"
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
          <button class="confirm-delete" @click="confirmCancel">تأكيد الإلغاء</button>
          <button class="close-popup" @click="closePopup">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>
