<script>
import './Footer.css'
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="brand-info">
        <div class="logo">
          <img src="/logo.png" alt="Ghasla Logo">
          <h2>غسلة</h2>
        </div>
        <p>
          خدمة غسيل سيارات احترافية <br />
          تصلك إلى موقعك
        </p>
      </div>

      <div class="links">
        <h3>روابط</h3>
        <router-link to="/">الرئيسية</router-link>
        <a href="/#about">من نحن</a>
        <a href="/#service">الخدمات</a>
      </div>

      <div class="service-links">
        <h3>الخدمات</h3>
        <a href="/#wash">غسيل خارجي</a>
        <a href="/#interior">تنظيف داخلي</a>
        <a href="/#premium">باقات مميزة</a>
      </div>

      <address class="contact">
        <h3>تواصل معنا</h3>
        <p><i class="fas fa-phone"></i> (555) 123-4567</p>
        <p><i class="fas fa-envelope"></i> info@ghasla.com</p>
      </address>
    </div>

    <div class="copyright">
      <p>© {{ new Date().getFullYear() }} غسلة. جميع الحقوق محفوظة.</p>
    </div>
  </footer>
</template>

