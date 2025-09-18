<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../../lib/supabaseClient'
import { useUserStore } from '../../../stores/userStore'
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

    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('id, notify, created_at')
      .eq('user_id', userStore.user.id)
      .not('notify', 'is', null)

    if (txError) throw txError

    const { data: bk, error: bkError } = await supabase
      .from('bookings')
      .select('id, notify, created_at')
      .eq('user_id', userStore.user.id)
      .not('notify', 'is', null)

    if (bkError) throw bkError

    notifications.value = [
      ...(tx || []).map(n => ({ ...n, source: 'transaction' })),
      ...(bk || []).map(n => ({ ...n, source: 'booking' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  } catch (err) {
    console.error('❌ خطأ في جلب الإشعارات:', err.message)
    errorMessage.value = 'فشل في جلب الإشعارات'
  } finally {
    isLoading.value = false
  }
}

function formatDateTime(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

async function deleteNotification(n) {
  try {
    if (n.source === 'transaction') {
      const { error } = await supabase
        .from('transactions')
        .update({ notify: null })
        .eq('id', n.id)
      if (error) throw error
    } else if (n.source === 'booking') {
      const { error } = await supabase
        .from('bookings')
        .update({ notify: null })
        .eq('id', n.id)
      if (error) throw error
    }

    notifications.value = notifications.value.filter(x => !(x.id === n.id && x.source === n.source))
  } catch (err) {
    console.error('خطأ أثناء حذف الإشعار:', err.message)
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
  } catch (err) {
    console.error('❌ خطأ أثناء حذف جميع الإشعارات:', err.message)
  }
}

onMounted(loadNotifications)
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
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <table v-if="!isLoading && notifications.length" class="notifications-table">
      <thead>
        <tr>
          <th>المصدر</th>
          <th>الإشعار</th>
          <th>التاريخ والوقت</th>
          <th>إجراء</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in notifications" :key="n.source + '-' + n.id">
          <td>{{ n.source === 'transaction' ? 'معاملة' : 'حجز' }}</td>
          <td>{{ n.notify }}</td>
          <td>{{ formatDateTime(n.created_at) }}</td>
          <td><button @click="deleteNotification(n)">حذف</button></td>
        </tr>
      </tbody>
    </table>

    <p v-if="!isLoading && notifications.length === 0">
      لا توجد إشعارات حالياً
    </p>
  </div>
</template>
