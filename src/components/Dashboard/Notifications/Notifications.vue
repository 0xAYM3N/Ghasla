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

    const { data: txs, error: txError } = await supabase
      .from("transactions")
      .select("id, notify, created_at")
      .eq("user_id", userStore.user.id)
      .not("notify", "is", null)

    if (txError) throw txError

    const walletNotifications = (txs || []).map((t) => ({
      id: t.id,
      message: t.notify,
      date: t.created_at,
      source: "transaction",
      uid: `transaction-${t.id}`,
    }))

    const { data: bookings, error: bookingError } = await supabase
      .from("bookings")
      .select("id, notify, created_at")
      .eq("user_id", userStore.user.id)
      .not("notify", "is", null)

    if (bookingError) throw bookingError

    const bookingNotifications = (bookings || []).map((b) => ({
      id: b.id,
      message: b.notify,
      date: b.created_at,
      source: "booking",
      uid: `booking-${b.id}`,
    }))

    notifications.value = [...walletNotifications, ...bookingNotifications].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الإشعارات:", err.message)
    errorMessage.value = "تعذر جلب الإشعارات. حاول لاحقاً."
  } finally {
    isLoading.value = false
  }
}

async function deleteNotification(n) {
  try {
    if (n.source === "transaction") {
      const { error } = await supabase
        .from("transactions")
        .update({ notify: null })
        .eq("id", n.id)
      if (error) throw error
    } else if (n.source === "booking") {
      const { error } = await supabase
        .from("bookings")
        .update({ notify: null })
        .eq("id", n.id)
      if (error) throw error
    }

    notifications.value = notifications.value.filter((x) => x.uid !== n.uid)
  } catch (err) {
    console.error("❌ خطأ أثناء حذف الإشعار:", err.message)
  }
}

async function deleteAll() {
  try {
    await supabase
      .from("transactions")
      .update({ notify: null })
      .eq("user_id", userStore.user.id)

    await supabase
      .from("bookings")
      .update({ notify: null })
      .eq("user_id", userStore.user.id)

    notifications.value = []
  } catch (err) {
    console.error("❌ خطأ أثناء حذف جميع الإشعارات:", err.message)
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
      <button
        v-if="notifications.length"
        @click="deleteAll"
        class="delete-all"
      >
        حذف الكل
      </button>
    </div>

    <p v-if="isLoading">⏳ جاري التحميل...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <ul v-if="!isLoading && notifications.length">
      <li v-for="n in notifications" :key="n.uid">
        <span>{{ n.message }}</span>
        <small>({{ n.source }})</small>
        <button @click="deleteNotification(n)">حذف</button>
      </li>
    </ul>

    <p v-if="!isLoading && notifications.length === 0">
      لا توجد إشعارات حالياً
    </p>
  </div>
</template>
