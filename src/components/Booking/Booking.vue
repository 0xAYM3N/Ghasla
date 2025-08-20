<script>
import './Booking.css'
</script>

<template>
  <div class="booking">
    <div class="container">
      <div class="form">
        <div class="choose-wash-type">
          <h2>اختر نوع الغسل</h2>
          <input type="checkbox" name="internal" value="internal">
          <label for="vehicle1">غسل داخلي</label><br>
          <input type="checkbox" name="external" value="external">
          <label for="external">غسل خارجي</label><br>
          <input type="checkbox" name="Full" value="Full">
          <label for="Full">غسل شامل</label><br><br>
          <input type="submit" value="Submit">
        </div>
      </div>
    </div>
  </div>
</template>
