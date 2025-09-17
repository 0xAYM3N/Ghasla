<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../../../stores/userStore'
import './Notifications.css'

const userStore = useUserStore()
const notifications = ref([])

function getUserEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email
  } catch {
    return null
  }
}

async function loadNotifications() {
  if (!userStore.token) return

  try {
    const email = getUserEmailFromToken(userStore.token)
    if (!email) return

    const usersResponse = await axios.get('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    const currentUser = usersResponse.data.find(u => u.email === email)
    if (!currentUser) return

    const walletNotifications = (currentUser.transactions || [])
      .filter(t => t.notify)
      .map(t => ({
        id: `wallet-${t.id}`,
        message: t.notify,
        date: t.date || t.createdAt
      }))

    const bookingsResponse = await axios.get(`http://localhost:3000/bookings?userId=${currentUser.id}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
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
    console.error('❌ خطأ أثناء جلب الإشعارات:', error)
  }
}

async function deleteNotification(id) {
  try {
    const email = getUserEmailFromToken(userStore.token)
    if (!email) return

    const usersResponse = await axios.get('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    const currentUser = usersResponse.data.find(u => u.email === email)
    if (!currentUser) return

    if (id.startsWith('wallet-')) {
      const transactionId = parseInt(id.replace('wallet-', ''))
      const updatedTransactions = (currentUser.transactions || []).map(t => {
        if (t.id === transactionId) t.notify = null
        return t
      })
      await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
        transactions: updatedTransactions
      }, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
    } else if (id.startsWith('booking-')) {
      const bookingId = id.replace('booking-', '')
      await axios.patch(`/api/bookings/${bookingId}`, { notify: null }, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
    }

    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (error) {
    console.error('❌ خطأ أثناء حذف الإشعار:', error)
  }
}

async function deleteAll() {
  try {
    const email = getUserEmailFromToken(userStore.token)
    if (!email) return

    const usersResponse = await axios.get('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    const currentUser = usersResponse.data.find(u => u.email === email)
    if (!currentUser) return

    const updatedTransactions = (currentUser.transactions || []).map(t => {
      t.notify = null
      return t
    })
    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      transactions: updatedTransactions
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    const bookingsResponse = await axios.get(`/api/bookings?userId=${currentUser.id}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    for (const booking of bookingsResponse.data) {
      await axios.patch(`http://localhost:3000/bookings/${booking.id}`, { notify: null }, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
    }

    notifications.value = []
  } catch (error) {
    console.error('❌ خطأ أثناء حذف جميع الإشعارات:', error)
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

