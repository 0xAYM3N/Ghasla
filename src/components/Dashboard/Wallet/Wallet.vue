<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../../../stores/userStore'
import './Wallet.css'

const userStore = useUserStore()
const showPopup = ref(false)
const newAmount = ref(0)

const wallet = ref({
  balance: 0,
  transactions: []
})

async function loadWallet() {
  if (!userStore.id) return
  const response = await axios.get(`http://localhost:3000/users/${userStore.id}`)
  const data = response.data
  wallet.value.balance = parseFloat(data.balance) || 0
  wallet.value.transactions = data.transactions || []
}

onMounted(() => {
  userStore.loadUserFromStorage()
  loadWallet()
})

const sortedTransactions = computed(() => {
  return [...wallet.value.transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date).getTime() || 0
    const dateB = new Date(b.createdAt || b.date).getTime() || 0
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
  const now = new Date()
  const isoDate = now.toISOString()

  const newTransaction = {
    id: Date.now(),
    type: 'إضافة رصيد',
    amount,
    date: isoDate,
    createdAt: isoDate,
    notify: `تم إضافة رصيد قدره ${amount}$`
  }

  wallet.value.transactions.push(newTransaction)
  wallet.value.balance += amount

  await axios.patch(`http://localhost:3000/users/${userStore.id}`, {
    balance: wallet.value.balance,
    transactions: wallet.value.transactions
  })

  userStore.setUser({
    ...userStore.$state,
    balance: wallet.value.balance,
    transactions: wallet.value.transactions
  })

  closePopup()
}

function formatAmount(value) {
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(date) {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
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
          :key="t.id || index" 
          :class="{'deposit': t.type === 'إضافة رصيد', 'withdraw': t.type === 'خصم'}"
        >
          <td>{{ t.type }}</td>
          <td>{{ formatAmount(t.amount) }}$</td>
          <td>{{ formatDateTime(t.createdAt || t.date) }}</td>
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

