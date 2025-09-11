<script setup>
import "./Navbar.css"

const props = defineProps({
  toggleSidebar: { type: Function, required: true }
})
</script>

<template>
  <div class="navbar-dashboard">
    <button class="toggle-btn" @click="props.toggleSidebar">
      <i class="fa-solid fa-bars"></i>
    </button>

    <router-link to="/">
      <i class="fa-solid fa-arrow-up-right-from-square"></i>
      صفحة الموقع
    </router-link>
  </div>
</template>
