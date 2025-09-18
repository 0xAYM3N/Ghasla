<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { supabase } from '../../lib/supabaseClient'
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

async function fetchUserAndBalance() {
  if (!userStore.user) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('id', userStore.user.id)
      .single()

    if (error) throw error
    currentUser.value = data
    balance.value = parseFloat(data.balance || 0)
  } catch (err) {
    errorMessage.value = "حدث خطأ أثناء جلب بيانات الرصيد"
    console.error("fetchUserAndBalance error:", err.message)
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
    const newBalance = parseFloat((balance.value - props.amount).toFixed(2))

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', currentUser.value.id)

    if (updateError) throw updateError

    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: currentUser.value.id,
        type: "خصم",
        amount: props.amount,
        notify: `تم خصم ${props.amount}$`
      })

    if (insertError) throw insertError

    balance.value = newBalance
    showConfirmPopup.value = false
    isProcessing.value = false

    props.onSuccess()
  } catch (err) {
    errorMessage.value = "حصل خطأ أثناء الدفع، حاول مرة ثانية."
    console.error("payWithWallet error:", err.message)
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

