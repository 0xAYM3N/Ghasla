<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../../lib/supabaseClient'
import { useUserStore } from '../../../stores/userStore'
import './Wallet.css'

const userStore = useUserStore()
const showPopup = ref(false)
const newAmount = ref(0)

const wallet = ref({
  id: null,
  balance: 0,
  transactions: []
})

async function loadWallet() {
  if (!userStore.user) return

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('id', userStore.user.id)
      .single()

    if (profileError) throw profileError

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userStore.user.id)
      .order('created_at', { ascending: false })

    if (txError) throw txError

    wallet.value = {
      id: profile.id,
      balance: parseFloat(profile.balance) || 0,
      transactions: txs || []
    }
  } catch (err) {
    console.error('خطأ في جلب بيانات المحفظة:', err.message)
  }
}

onMounted(loadWallet)

const sortedTransactions = computed(() => {
  return [...wallet.value.transactions].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime() || 0
    const dateB = new Date(b.created_at).getTime() || 0
    return dateB - dateA
  })
})

function openPopup() {
  newAmount.value = 0
  showPopup.value = true
}

function closePopup() {
  showPopup.value = false
}

async function addBalance() {
  if (newAmount.value <= 0) return
  const amount = parseFloat(newAmount.value.toFixed(2))

  try {
    const newBalance = parseFloat((wallet.value.balance + amount).toFixed(2))
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', wallet.value.id)

    if (updateError) throw updateError

    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: wallet.value.id,
        type: 'إضافة رصيد',
        amount,
        notify: `تم إضافة رصيد قدره ${amount}$`
      })

    if (insertError) throw insertError

    wallet.value.balance = newBalance
    wallet.value.transactions.unshift({
      user_id: wallet.value.id,
      type: 'إضافة رصيد',
      amount,
      notify: `تم إضافة رصيد قدره ${amount}$`,
      created_at: new Date().toISOString()
    })

  } catch (err) {
    console.error('خطأ في تحديث الرصيد:', err.message)
  }

  closePopup()
}

function formatAmount(value) {
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
</script>

<template>
  <div class="wallet-page">
    <h2>المحفظة</h2>
    <div class="balance-card">
      <div class="balance-info">
        <h3>الرصيد الحالي</h3>
        <p>{{ formatAmount(wallet.balance) }}$</p>
      </div>
      <button class="add-btn" @click="openPopup">+ إضافة رصيد</button>
    </div>

    <h3>سجل العمليات</h3>
    <table class="wallet-table">
      <thead>
        <tr>
          <th>نوع العملية</th>
          <th>المبلغ</th>
          <th>التاريخ والوقت</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(t, index) in sortedTransactions" 
          :key="index"
          :class="{'deposit': t.type === 'إضافة رصيد', 'withdraw': t.type === 'خصم'}"
        >
          <td>{{ t.type }}</td>
          <td>{{ formatAmount(t.amount) }}$</td>
          <td>{{ formatDateTime(t.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <h3>إضافة رصيد</h3>
        <input type="number" step="0.01" v-model.number="newAmount" placeholder="أدخل المبلغ" />
        <div class="buttons">
          <button class="confirm" @click="addBalance">تأكيد</button>
          <button class="close" @click="closePopup">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>
