<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
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

function getUserEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email
  } catch {
    return null
  }
}

async function loadWallet() {
  if (!userStore.token) return
  try {
    const res = await axios.get('http://localhost:3000/users', {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })

    const email = getUserEmailFromToken(userStore.token)
    const user = res.data.find(u => u.email === email)
    if (user) {
      wallet.value = {
        id: user.id,
        balance: parseFloat(user.balance) || 0,
        transactions: user.transactions || []
      }
    }
  } catch (err) {
    console.error('❌ خطأ في جلب بيانات المحفظة:', err)
  }
}

onMounted(() => {
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
  const now = new Date().toISOString()

  const newTransaction = {
    id: Date.now(),
    type: 'إضافة رصيد',
    amount,
    date: now,
    createdAt: now,
    notify: `تم إضافة رصيد قدره ${amount}$`
  }

  wallet.value.transactions.push(newTransaction)
  wallet.value.balance += amount

  try {
    await axios.patch(`http://localhost:3000/users/${wallet.value.id}`, {
      balance: wallet.value.balance,
      transactions: wallet.value.transactions
    }, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
  } catch (err) {
    console.error('❌ خطأ في تحديث الرصيد:', err)
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

