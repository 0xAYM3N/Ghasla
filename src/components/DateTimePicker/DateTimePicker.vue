<script setup>
import './DateTimePicker.css'
import { ref, computed, watch } from "vue"

const props = defineProps({
  modelDate: { type: String, default: "" }, 
  modelTime: { type: String, default: "" }
})
const emit = defineEmits(["update:modelDate", "update:modelTime"])

const selectedDate = ref(props.modelDate)
const selectedTime = ref(props.modelTime)

watch(() => props.modelDate, (val) => selectedDate.value = val || "")
watch(() => props.modelTime, (val) => selectedTime.value = val || "")

watch(selectedDate, (val) => emit("update:modelDate", val))
watch(selectedTime, (val) => emit("update:modelTime", val))

// Calendar
const today = new Date()
today.setHours(0, 0, 0, 0)

const currentDate = ref(new Date())

const times = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
]

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const monthYear = computed(() =>
  currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
)

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ number: "", date: null })
  }
  for (let d = 1; d <= lastDate; d++) {
    days.push({ number: d, date: new Date(year, month, d) })
  }
  return days
})

const formatDateForApi = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const formattedDate = computed(() =>
  selectedDate.value
    ? new Date(selectedDate.value).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "اختر تاريخ"
)

const selectDate = (date) => {
  if (date) {
    selectedDate.value = formatDateForApi(date)
  }
}

const isSelected = (date) =>
  date && selectedDate.value === formatDateForApi(date)

const isToday = (date) =>
  date && new Date().toDateString() === date.toDateString()

const isPast = (date) => {
  if (!date) return false
  return date < today
}

const isCurrentMonth = computed(() => {
  const now = new Date()
  return (
    currentDate.value.getMonth() === now.getMonth() &&
    currentDate.value.getFullYear() === now.getFullYear()
  )
})

const prevMonth = () => {
  if (!isCurrentMonth.value) {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
    )
  }
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}
</script>

<template>
  <div class="dtp">
    <!-- Calendar -->
    <div class="calendar">
      <div class="calendar-header">
        <button @click="nextMonth">‹</button>
        <span>{{ monthYear }}</span>
        <button v-if="!isCurrentMonth" @click="prevMonth">›</button>
      </div>

      <div class="calendar-grid">
        <div class="calendar-day" v-for="day in weekDays" :key="day">
          {{ day }}
        </div>
        <div
          v-for="(day, index) in daysInMonth"
          :key="day.date ? day.date.getTime() : 'empty-' + index"
          class="calendar-cell"
          :class="{
            selected: isSelected(day.date),
            today: isToday(day.date),
            disabled: isPast(day.date)
          }"
          @click="!isPast(day.date) && selectDate(day.date)"
        >
          {{ day.number }}
        </div>
      </div>
    </div>

    <!-- Times -->
    <div class="times">
      <h3 class="times-title">الأوقات المتاحة</h3>
      <ul class="times-list">
        <li v-for="time in times" :key="time">
          <input
            type="radio"
            :id="time"
            name="timetable"
            :value="time"
            v-model="selectedTime"
          />
          <label :for="time">{{ time }}</label>
        </li>
      </ul>
      <p class="times-selected">
        {{ formattedDate }} – {{ selectedTime || "No time" }}
      </p>
    </div>
  </div>
</template>

