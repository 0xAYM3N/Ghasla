<script setup>
import './Hero.css'
</script>

<template>
  <div class="hero">
    <div class="container">
      <div class="text">
        <h1>
          من خلال منصتنا... غسيل سيارتك صار أسهل من أي وقت
        </h1>
        <div class="btn">
          <router-link href="#contact">
            احجز الآن
          </router-link>
        </div> 
      </div>

      <div class="img">
        <img src="/assets/hero.png">
      </div>
    </div>
  </div>
</template>
