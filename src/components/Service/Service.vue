<script setup>
import './Service.css'
</script>

<template>
  <div class="service" id="service">
    <div class="title">
      <h1>خدماتنا</h1>
    </div>
    <div class="container">
      <div class="card">
        <div class="header">
          <h3>غسل خارجي</h3>
          <span class="icon">🚗</span>
        </div>
        <h2>تنظيف الهيكل الخارجي فقط</h2>
        <div class="price">100$</div>
        <router-link to="/">احجز الان</router-link>
      </div>

      <div class="card">
        <div class="header">
          <h3>غسل داخلي</h3>
          <span class="icon">🧽</span>
        </div>
        <h2>تنظيف شامل من الداخل</h2>
        <div class="price">100$</div>
        <router-link to="/">احجز الان</router-link>
      </div>

      <div class="card">
        <div class="header">
          <h3>غسل شامل</h3>
          <span class="icon">✨</span>
        </div>
        <h2>يشمل الداخلي + الخارجي</h2>
        <div class="price">200$</div>
        <router-link to="/">احجز الان</router-link>
      </div>
    </div>
  </div>
</template>
