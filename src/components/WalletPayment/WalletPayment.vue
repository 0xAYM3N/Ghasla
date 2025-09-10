<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/userStore'
import axios from 'axios'
import './WalletPayment.css'

const props = defineProps({
  amount: { type: Number, required: true },
  onSuccess: { type: Function, required: true }
})

const userStore = useUserStore()
const balance = ref(0)

const showConfirmPopup = ref(false)

async function loadBalance() {
  if (!userStore.id) return
  try {
    const response = await axios.get(`http://localhost:3000/users/${userStore.id}`)
    balance.value = parseFloat(response.data.balance) || 0
  } catch (error) {
    console.error("خطأ أثناء جلب الرصيد:", error)
  }
}

onMounted(() => {
  userStore.loadUserFromStorage()
  loadBalance()
})

function confirmPayment() {
  if (balance.value < props.amount) {
    alert("❌ رصيدك غير كاف!")
    return
  }
  showConfirmPopup.value = true
}

function payWithWallet() {
  showConfirmPopup.value = false
  props.onSuccess()
}
</script>

<template>
  <div class="wallet-payment">
    <p>رصيدك الحالي: {{ balance.toFixed(2) }}$</p>
    <button class="pay-btn" @click="confirmPayment" :disabled="balance < props.amount">
      ادفع من المحفظة
    </button>

    <div v-if="showConfirmPopup" class="popup">
      <div class="popup-content">
        <h3>سيتم خصم {{ props.amount.toFixed(2) }}$ من محفظتك.</h3>
        <div class="popup-buttons">
          <button class="colse-popup" @click="payWithWallet">تأكيد</button>
          <button class="confirm-pay" @click="showConfirmPopup = false">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

