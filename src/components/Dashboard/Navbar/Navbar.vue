<script setup>
import "./Navbar.css"
import { useUserStore } from "../../../stores/userStore"
import { useRouter } from "vue-router"

const props = defineProps({
  toggleSidebar: { type: Function, required: true }
})

const userStore = useUserStore()
const router = useRouter()

function logout() {
  if (userStore.isLoggedIn) {
    userStore.logout()
    router.push("/login")
  }
}
</script>

<template>
  <div class="navbar-dashboard">
    <button class="toggle-btn" @click="props.toggleSidebar">
      <i class="fa-solid fa-bars"></i>
    </button>

    <button 
      v-if="userStore.isLoggedIn" 
      class="logout-btn" 
      @click="logout"
    >
      <i class="fa-solid fa-right-from-bracket"></i>
      تسجيل خروج
    </button>
  </div>
</template>

