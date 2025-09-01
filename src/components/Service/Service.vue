<script setup>
import './Service.css'

const checkIconClass = 'fa-solid fa-check'

const services = [
  {
    title: 'غسل خارجي',
    price: 100,
    items: [
      'غسل الهيكل الخارجي للسيارة',
      'تنظيف العجلات والإطارات',
      'إزالة الأتربة والشوائب',
      'تلميع الهيكل الخارجي'
    ],
    popular: false
  },
  {
    title: 'غسل شامل',
    price: 200,
    items: [
      'غسل داخلي وخارجي',
      'تنظيف كامل للمقاعد والسجاد والأرضيات',
      'تنظيف شامل للهيكل الخارجي',
      'إزالة البقع الصعبة',
      'تلميع شامل'
    ],
    popular: true
  },
  {
    title: 'غسل داخلي',
    price: 100,
    items: [
      'تنظيف مقاعد السيارة',
      'تنظيف السجاد والأرضيات',
      'تنظيف الأسطح الداخلية',
      'تنظيف الزجاج الداخلي'
    ],
    popular: false
  }
]
</script>

<template>
  <div class="service" id="service">
    <div class="title">
      <h1>خدماتنا</h1>
    </div>

    <div class="container">
      <div v-for="(service, index) in services" 
        :key="index" 
        class="card" 
        :class="{ popular: service.popular }" 
      >
        <span v-if="service.popular" class="badge">الأكثر شيوعاً</span>

        <div class="header">
          <h3>{{ service.title }}</h3>
          <div class="price">{{ service.price }}$</div>
        </div>

        <ul class="features">
          <li v-for="(item, i) in service.items" :key="i">
            <i :class="checkIconClass"></i> {{ item }}
          </li>
        </ul>

        <router-link to="/Booking">احجز الان</router-link>
      </div>
    </div>
  </div>
</template>

