<script setup>
import "./Booking.css"
import { ref } from "vue"
import axios from "axios";

// Select Wash Type
const selectedType = ref(null)
const step = ref(1)

const washTypes = [
  { value: "internal", label: "غسل داخلي" },
  { value: "external", label: "غسل خارجي" },
  { value: "full", label: "غسل شامل" }
]

function selectType(type) {
  selectedType.value = type
}

// Select Day
const selectedDay = ref(null)
const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]

function selectDay(day) {
  selectedDay.value = day
}

// Select Time 
const selectedTime = ref(null)
const times = ["00:00", "08:00", "12:00"]

function selectTime(time) {
  selectedTime.value = time
}

// PopUp State
const showPopup = ref(false)
const popupMessage = ref("")

function openPopup(msg) {
  popupMessage.value = msg
  showPopup.value = true
}
function closePopup() {
  showPopup.value = false
}

// Go Step Next
function nextStep() {
  if (step.value === 1 && !selectedType.value) {
    openPopup("⚠️ الرجاء اختيار نوع الغسل أولاً")
    return
  }

  if (step.value === 2) {
    if (!selectedDay.value || !selectedTime.value) {
      openPopup("⚠️ الرجاء اختيار اليوم والوقت قبل المتابعة");
      return;
    }
  }

  step.value++
}

// Go Step Prev
function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

// Sent Data To Api
async function submitBookingForm() {
  try {
    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        type: selectedType.value,
        day: selectedDay.value,
        time: selectedTime.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  console.log("✅ Response:", response.data);
  } catch (error) {
    console.log("Error In The Sent", error);
  }
}
</script>

<template>
  <div class="booking">
    <div class="container">
      <div class="progress-container">
        <div
          class="progress-step"
          :class="{ active: step === 1, completed: step > 1 }"
          data-step="1">
        <span>نوع الغسل</span>
        </div>
        <div
          class="progress-step"
          :class="{ active: step === 2, completed: step > 2 }"
          data-step="2"
        >
        <span>اليوم والوقت</span>
        </div>
        <div
          class="progress-step"
          :class="{ active: step === 3, completed: step > 3 }"
          data-step="3"
        >
        <span>الموقع</span>
        </div>
        <div
          class="progress-step"
          :class="{ active: step === 4 }"
          data-step="4"
        >
        <span>الدفع</span>
        </div>
      </div>

      <div class="form">
        <!-- Step 1 -->
        <div class="choose-wash-type" v-if="step === 1">
          <h2>اختر نوع الغسل</h2>

          <div class="wash-types">
            <div
              v-for="type in washTypes"
              :key="type.value"
              class="box"
              :class="{ active: selectedType === type.value }"
              @click="selectType(type.value)"
            >
            <h3>{{ type.label }}</h3>
            </div>
          </div>

          <div class="btn">
            <button type="button" class="btn-next" @click="nextStep">
              <i class="fa-solid fa-arrow-right"></i>
              التالي
            </button>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="select-day-and-time" v-if="step === 2">
          <div class="select-day">
            <h2>اختار اليوم</h2>
            <div class="days">
              <h3
                v-for="day in days"
                :key="day"
                :class="{ active: selectedDay === day }"
                @click="selectDay(day)"
              >
              {{ day }}
              </h3>
            </div>
          
            <div class="select-time">
              <h2>اختيار الوقت</h2>
              <div class="times">
                <h3
                  v-for="time in times"
                  :key="time"
                  :class="{ active: selectedTime === time }"
                  @click="selectTime(time)"
                >
                {{ time }}
                </h3>
              </div>
            </div>
            <div class="btn">
              <button type="button" class="btn-next" @click="nextStep">
                <i class="fa-solid fa-arrow-right"></i>
                التالي
              </button>
              <button type="button" class="btn-prev" @click="prevStep">
                رجوع
                <i class="fa-solid fa-arrow-left"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="select-location" v-if="step === 3">
          <h2>حدد الموقع</h2>
          <div class="btn">
            <button type="button" class="btn-next" @click="nextStep">
              <i class="fa-solid fa-arrow-right"></i>
              التالي
            </button>
            <button type="button" class="btn-prev" @click="prevStep">
              رجوع
              <i class="fa-solid fa-arrow-left"></i>
            </button>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="choose-payment-method" v-if="step === 4">
          <h2>اختر وسيلة الدفع</h2>
          <div class="btn">
            <button type="button" class="btn-submit" @click="submitBookingForm">
              <i class="fa-solid fa-paper-plane"></i> 
              إرسال الطلب
            </button>
            <button type="button" class="btn-prev" @click="prevStep">
              رجوع
              <i class="fa-solid fa-arrow-left"></i>
            </button>
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

