<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { supabase } from '../../../lib/supabaseClient'
import './Notifications.css'

const userStore = useUserStore()
const notifications = ref([])
const isLoading = ref(false)
const errorMessage = ref(null)

async function loadNotifications() {
  if (!userStore.user) return

  try {
    isLoading.value = true
    errorMessage.value = null

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('id, notify, created_at')
      .eq('user_id', userStore.user.id)
      .not('notify', 'is', null)

    if (txError) throw txError

    const walletNotifications = (txs || []).map(t => ({
      id: `wallet-${t.id}`,
      message: t.notify,
      date: t.created_at
    }))

    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, notify, created_at')
      .eq('user_id', userStore.user.id)
      .not('notify', 'is', null)

    if (bookingError) throw bookingError

    const bookingNotifications = (bookings || []).map(b => ({
      id: `booking-${b.id}`,
      message: b.notify,
      date: b.created_at
    }))

    notifications.value = [...walletNotifications, ...bookingNotifications]
      .sort((a, b) => new Date(b.date) - new Date(a.date))

  } catch (error) {
    console.error('❌ خطأ أثناء جلب الإشعارات:', error.message)
    errorMessage.value = 'تعذر جلب الإشعارات. حاول لاحقاً.'
  } finally {
    isLoading.value = false
  }
}

async function deleteNotification(id) {
  try {
    if (id.startsWith('wallet-')) {
      const txId = parseInt(id.replace('wallet-', ''))
      const { error } = await supabase
        .from('transactions')
        .update({ notify: null })
        .eq('id', txId)
      if (error) throw error
    } else if (id.startsWith('booking-')) {
      const bookingId = id.replace('booking-', '')
      const { error } = await supabase
        .from('bookings')
        .update({ notify: null })
        .eq('id', bookingId)
      if (error) throw error
    }

    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (error) {
    console.error('❌ خطأ أثناء حذف الإشعار:', error.message)
  }
}

async function deleteAll() {
  try {
    await supabase
      .from('transactions')
      .update({ notify: null })
      .eq('user_id', userStore.user.id)

    await supabase
      .from('bookings')
      .update({ notify: null })
      .eq('user_id', userStore.user.id)

    notifications.value = []
  } catch (error) {
    console.error('❌ خطأ أثناء حذف جميع الإشعارات:', error.message)
  }
}

watch(
  () => userStore.isAuthReady,
  (ready) => {
    if (ready && userStore.user) {
      loadNotifications()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="notifications-page">
    <div class="header">
      <h2>الإشعارات</h2>
      <button v-if="notifications.length" @click="deleteAll" class="delete-all">
        حذف الكل
      </button>
    </div>

    <p v-if="isLoading">⏳ جاري التحميل...</p>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <ul v-if="!isLoading && notifications.length">
      <li v-for="n in notifications" :key="n.id">
        <span>{{ n.message }}</span>
        <button @click="deleteNotification(n.id)">حذف</button>
      </li>
    </ul>

    <p v-if="!isLoading && notifications.length === 0">
      لا توجد إشعارات حالياً
    </p>
  </div>
</template>
