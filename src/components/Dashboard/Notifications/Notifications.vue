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

    <ul v-if="!isLoading && notifications.length">
      <li v-for="n in notifications" :key="n.source + '-' + n.id">
        <span>{{ n.notify }}</span>
        <button @click="deleteNotification(n)">حذف</button>
      </li>
    </ul>

    <p v-if="!isLoading && notifications.length === 0">
      لا توجد إشعارات حالياً
    </p>
  </div>
</template>
