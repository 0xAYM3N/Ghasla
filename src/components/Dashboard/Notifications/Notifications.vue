<script setup>
import { ref, watch } from "vue"
import { useUserStore } from "../../../stores/userStore"
import { supabase } from "../../../lib/supabaseClient"

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
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    notifications.value = data
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الإشعارات:", err.message)
    errorMessage.value = "تعذر جلب الإشعارات. حاول لاحقاً."
  } finally {
    isLoading.value = false
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
    </div>

    <p v-if="isLoading">⏳ جاري التحميل...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <ul v-if="!isLoading && notifications.length">
      <li v-for="n in notifications" :key="`${n.source}-${n.id}`">
        <span>{{ n.notify }}</span>
        <small>({{ n.source }})</small>
        <small>{{ new Date(n.created_at).toLocaleString() }}</small>
      </li>
    </ul>

    <p v-if="!isLoading && notifications.length === 0">
      لا توجد إشعارات حالياً
    </p>
  </div>
</template>

