<script setup>
import { ref, onMounted, computed } from "vue"
import DateTimePicker from '../DateTimePicker/DateTimePicker.vue'
import MapSelector from '../MapSelector/MapSelector.vue'
import WalletPayment from '../WalletPayment/WalletPayment.vue'
import { useUserStore } from '../../stores/userStore'
import { supabase } from "../../lib/supabaseClient"
import './Booking.css'

const userStore = useUserStore()
const currentUser = ref(null)
const userLoaded = ref(false)

async function fetchUser() {
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  if (userStore.user) {
    currentUser.value = userStore.user
    userLoaded.value = true
  }
}
onMounted(fetchUser)

const isLoggedIn = computed(() => !!currentUser.value)

const step = ref(1)
const showDone = ref(false)

const selectedType = ref(null)
const selectedPrice = ref(0)
const washTypes = [
  { value: "غسل داخلي", price: 50 },
  { value: "غسل شامل", price: 100 },
  { value: "غسل خارجي", price: 50 },
]

function selectType(type) {
  selectedType.value = type.value
  selectedPrice.value = type.price
}

const selectedDay = ref(null)
const selectedTimeStr = ref(null)
const datetime = ref(null)
const markerPosition = ref([24.7136, 46.6753])

const showPopup = ref(false)
const popupMessage = ref("")
function openPopup(msg) {
  popupMessage.value = msg
  showPopup.value = true
}
function closePopup() {
  showPopup.value = false
}

function convertTo24Hour(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 }
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (modifier === 'PM' && hours !== 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  return { hours, minutes, seconds: 0 }
}

function updateDateTime() {
  if (!selectedDay.value || !selectedTimeStr.value) return
  const [year, month, day] = selectedDay.value.split('-').map(Number)
  const { hours, minutes, seconds } = convertTo24Hour(selectedTimeStr.value)
  const dateObj = new Date(year, month - 1, day, hours, minutes, seconds)
  datetime.value = Math.floor(dateObj.getTime() / 1000)
}

function formatDate(unix) {
  if (!unix) return ""
  return new Date(unix * 1000).toLocaleDateString("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
}
function formatTime(unix) {
  if (!unix) return ""
  return new Date(unix * 1000).toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

const nextStep = () => {
  if (step.value === 1 && !selectedType.value) { openPopup("⚠️ اختر نوع الغسل"); return }
  if (step.value === 2 && !datetime.value) { openPopup("⚠️ اختر اليوم والوقت"); return }
  step.value++
}
const prevStep = () => { if (step.value > 1) step.value-- }

async function submitBookingForm() {
  if (!isLoggedIn.value) {
    openPopup("❌ لازم تسجل دخول")
    return
  }

  try {
    const now = new Date().toISOString()

    const bookingData = {
      user_id: currentUser.value.id,
      type: selectedType.value,
      location: markerPosition.value,
      price: selectedPrice.value,
      datetime: datetime.value,
      status: "قيد الانتظار",
      created_at: now,
      notify: `تم إنشاء حجز ${selectedType.value} بسعر ${selectedPrice.value}$`
    }

    const { error } = await supabase
      .from("bookings")
      .insert([bookingData])

    if (error) throw error

    showDone.value = true
  } catch (error) {
    console.error("Error:", error)
    openPopup("❌ مشكلة أثناء إرسال الحجز")
  }
}
</script>

<template>
  <div class="booking">
    <div class="container">

      <!-- Progress Steps -->
      <div class="progress-container" v-if="!showDone">
        <div class="progress-step" :class="{ active: step === 1, completed: step > 1 }" data-step="1">
          <span>نوع الغسل</span>
        </div>
        <div class="progress-step" :class="{ active: step === 2, completed: step > 2 }" data-step="2">
          <span>اليوم والوقت</span>
        </div>
        <div class="progress-step" :class="{ active: step === 3, completed: step > 3 }" data-step="3">
          <span>الموقع</span>
        </div>
        <div class="progress-step" :class="{ active: step === 4 }" data-step="4">
          <span>ملخص الطلب والدفع</span>
        </div>
      </div>

      <div class="form">
        <!-- Step 1 -->
        <div v-if="step === 1 && !showDone" key="step1" class="choose-wash-type">
          <h2>اختر نوع الغسل</h2>
          <div class="wash-types">
            <div 
              v-for="type in washTypes" 
              :key="type.value" 
              class="box" 
              :class="{ active: selectedType === type.value }" 
              @click="selectType(type)"
            >
              <h3>{{ type.value }}</h3>
            </div>
          </div>
          <div class="btn">
            <button type="button" class="btn-next" @click="nextStep">التالي</button>
          </div>
        </div>

        <!-- Step 2 -->
        <div v-if="step === 2 && !showDone" key="step2" class="select-day-and-time">
          <h2>اختر اليوم والوقت</h2>
          <DateTimePicker 
            v-model:modelDate="selectedDay" 
            v-model:modelTime="selectedTimeStr" 
            @update:modelDate="updateDateTime" 
            @update:modelTime="updateDateTime"
          />
          <div class="btn">
            <button type="button" class="btn-next" @click="nextStep">التالي</button>
            <button type="button" class="btn-prev" @click="prevStep">رجوع</button>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-if="step === 3 && !showDone" key="step3" class="select-location">
          <h2>حدد الموقع</h2>
          <MapSelector v-model="markerPosition" @notify="openPopup"/>
          <div class="btn">
            <button type="button" class="btn-next" @click="nextStep">التالي</button>
            <button type="button" class="btn-prev" @click="prevStep">رجوع</button>
          </div>
        </div>

        <!-- Step 4 -->
        <div v-if="step === 4 && !showDone" key="step4" class="summary-payment">
          <h2>ملخص الطلب والدفع</h2>
          <div class="order-summary">
            <p><strong>نوع الغسل:</strong> {{ selectedType }}</p>
            <p><strong>سعر الخدمة:</strong> {{ selectedPrice }}$</p>
            <p><strong>التاريخ:</strong> {{ datetime ? formatDate(datetime) : "" }}</p>
            <p><strong>الوقت:</strong> {{ datetime ? formatTime(datetime) : "" }}</p>
          </div>

          <WalletPayment :amount="selectedPrice" :onSuccess="submitBookingForm" />

          <div class="btn">
            <button type="button" class="btn-prev" @click="prevStep">رجوع</button>
          </div>
        </div>

        <!-- Done -->
        <div v-if="showDone" class="done-page">
          <div class="done-container">
            <div class="icon">✅</div>
            <h2>تمت العملية بنجاح!</h2>
            <p>شكراً لاستخدامك خدمتنا. تم تأكيد حجزك بنجاح.</p>
            <div class="done-btn">
              <router-link to="/">الصفحة الرئيسية</router-link>
              <router-link to="/dashboard/bookings">لوحة إدارة الحجوزات</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Popup -->
      <div v-if="showPopup" class="popup">
        <div class="popup-content">
          <h3>{{ popupMessage }}</h3>
          <button @click="closePopup">إغلاق</button>
        </div>
      </div>

    </div>
  </div>
</template>

