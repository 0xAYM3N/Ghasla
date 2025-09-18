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

    const { data, error } = await supabase
      .from('notifications') 
      .select('*')
      .eq('user_id', userStore.user.id) 
      .order('created_at', { ascending: false })

    if (error) throw error

    notifications.value = data || []
  } catch (err) {
    console.error('❌ Error loading notifications:', err.message)
    errorMessage.value = 'فشل في جلب الإشعارات'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<template>
  <div class="notifications-page">
    <h2>الإشعارات</h2>

    <p v-if="isLoading">⏳ جاري التحميل...</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <ul v-if="!isLoading && notifications.length">
      <li v-for="n in notifications" :key="n.source + '-' + n.id">
        <b>[{{ n.source }}]</b> {{ n.notify }}
        <small>({{ new Date(n.created_at).toLocaleString() }})</small>
      </li>
    </ul>

    <p v-if="!isLoading && notifications.length === 0">
      لا توجد إشعارات حالياً
    </p>
  </div>
</template>

