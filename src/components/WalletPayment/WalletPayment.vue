<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'
import axios from 'axios'
import './WalletPayment.css'

const props = defineProps({
  amount: { type: Number, required: true },
  onSuccess: { type: Function, required: true }
})

const userStore = useUserStore()
const balance = ref(null)
const currentUser = ref(null)
const showConfirmPopup = ref(false)
const isProcessing = ref(false)
const errorMessage = ref("")

function getUserEmailFromToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).email
  } catch {
    return null
  }
}

async function fetchUserAndBalance() {
  if (!userStore.token) return
  try {
    const email = getUserEmailFromToken(userStore.token)
    if (!email) return

    const res = await axios.get('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    const user = res.data.find(u => u.email === email)
    if (!user) return

    currentUser.value = user
    balance.value = parseFloat(user.balance || 0)
  } catch (err) {
    errorMessage.value = "حدث خطأ أثناء جلب بيانات الرصيد"
    console.error("fetchUserAndBalance error:", err.response?.data || err.message || err)
  }
}

onMounted(fetchUserAndBalance)

const isDisabled = computed(() => {
  return isProcessing.value || balance.value === null || balance.value < props.amount
})

function confirmPayment() {
  if (isDisabled.value) return
  errorMessage.value = ""
  showConfirmPopup.value = true
}

async function payWithWallet() {
  if (!currentUser.value) {
    errorMessage.value = "لم يتم التعرف على المستخدم"
    showConfirmPopup.value = false
    return
  }

  isProcessing.value = true
  try {
    const now = new Date().toISOString()
    const newBalance = parseFloat((balance.value - props.amount).toFixed(2))

    const newTransaction = {
      id: Date.now(),
      type: "خصم",
      amount: props.amount,
      createdAt: now,
      notify: `تم خصم ${props.amount}$`
    }

    const updatedTransactions = [...(currentUser.value.transactions || []), newTransaction]

    await axios.patch(
      `http://localhost:3000/users/${currentUser.value.id}`,
      {
        balance: newBalance,
        transactions: updatedTransactions
      },
      { headers: { Authorization: `Bearer ${userStore.token}` } }
    )

    balance.value = newBalance
    currentUser.value.transactions = updatedTransactions
    showConfirmPopup.value = false
    isProcessing.value = false

    props.onSuccess()
  } catch (err) {
    errorMessage.value = "حصل خطأ أثناء الدفع، حاول مرة ثانية."
    console.error("payWithWallet error:", err.response?.data || err.response?.status || err.message || err)
    showConfirmPopup.value = false
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="wallet-payment">
    <p v-if="balance !== null">رصيدك الحالي: {{ balance.toFixed(2) }}$</p>
    <p v-else>جاري جلب الرصيد...</p>

    <button class="pay-btn" @click="confirmPayment" :disabled="isDisabled">
      <span v-if="!isProcessing">ادفع من المحفظة</span>
      <span v-else>جاري المعالجة...</span>
    </button>

    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

    <div v-if="showConfirmPopup" class="popup">
      <div class="popup-content">
        <h3>سيتم خصم {{ props.amount.toFixed(2) }}$ من محفظتك.</h3>
        <div class="popup-buttons">
          <button class="confirm-btn" @click="payWithWallet" :disabled="isProcessing">تأكيد</button>
          <button class="cancel-btn" @click="showConfirmPopup = false" :disabled="isProcessing">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

