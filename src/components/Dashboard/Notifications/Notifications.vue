<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../../../stores/userStore'
import './Notifications.css'

const userStore = useUserStore()
const notifications = ref([])

async function loadNotifications() {
  userStore.loadUserFromStorage()
  if (!userStore.id) return

  try {
    const userResponse = await axios.get(`http://localhost:3000/users/${userStore.id}`)
    const walletNotifications = (userResponse.data.transactions || [])
      .filter(t => t.notify)
      .map(t => ({
        id: `wallet-${t.id}`,
        message: t.notify,
        date: t.date || t.createdAt 
      }))

    const bookingsResponse = await axios.get(`http://localhost:3000/bookings?userId=${userStore.id}`)
    const bookingNotifications = bookingsResponse.data
      .filter(b => b.notify)
      .map(b => ({
        id: `booking-${b.id}`,
        message: b.notify,
        date: b.createdAt 
      }))

    notifications.value = [...walletNotifications, ...bookingNotifications]
      .sort((a, b) => new Date(b.date) - new Date(a.date))

  } catch (error) {
    console.error("❌ حدث خطأ أثناء جلب الإشعارات:", error)
  }
}

async function deleteNotification(id) {
  try {
    if (id.startsWith('wallet-')) {
      const transactionId = parseInt(id.replace('wallet-', ''))
      const userData = await axios.get(`http://localhost:3000/users/${userStore.id}`)
      const updatedTransactions = (userData.data.transactions || []).map(t => {
        if (t.id === transactionId) t.notify = null
        return t
      })
      await axios.patch(`http://localhost:3000/users/${userStore.id}`, { transactions: updatedTransactions })
    } else if (id.startsWith('booking-')) {
      const bookingId = id.replace('booking-', '')
      await axios.patch(`http://localhost:3000/bookings/${bookingId}`, { notify: null })
    }
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (error) {
    console.error("❌ حدث خطأ أثناء حذف الإشعار:", error)
  }
}

async function deleteAll() {
  try {
    for (const n of notifications.value) {
      if (n.id.startsWith('wallet-')) {
        const transactionId = parseInt(n.id.replace('wallet-', ''))
        const userData = await axios.get(`http://localhost:3000/users/${userStore.id}`)
        const updatedTransactions = (userData.data.transactions || []).map(t => {
          if (t.id === transactionId) t.notify = null
          return t
        })
        await axios.patch(`http://localhost:3000/users/${userStore.id}`, { transactions: updatedTransactions })
      } else if (n.id.startsWith('booking-')) {
        const bookingId = n.id.replace('booking-', '')
        await axios.patch(`http://localhost:3000/bookings/${bookingId}`, { notify: null })
      }
    }
    notifications.value = []
  } catch (error) {
    console.error("❌ حدث خطأ أثناء حذف جميع الإشعارات:", error)
  }
}

onMounted(() => loadNotifications())
</script>

<template>
  <div class="notifications-page">
    <div class="header">
      <h2>الإشعارات</h2>
      <button v-if="notifications.length" @click="deleteAll">حذف الكل</button>
    </div>

    <ul>
    <li v-for="n in notifications" :key="n.id">
      <span>{{ n.message }}</span>
      <button @click="deleteNotification(n.id)">حذف</button>
    </li>
  </ul>


    <p v-if="notifications.length === 0">لا توجد إشعارات حالياً</p>
  </div>
</template>

