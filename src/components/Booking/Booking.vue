<script>
import './Booking.css'

const box = document.querySelectorAll('.box');

box.onclick = () => {
  box.classList.add('active')
}
</script>

<template>
  <div class="booking">
    <div class="container">
      <div class="form">
        <div class="choose-wash-type">
          <h2>اختر نوع الغسل</h2>
          <div class="wash-types">
            <div class="box" data-value="internal">
              <h3>غسل داخلي</h3>
            </div>
            <div class="box" data-value="external">
              <h3>غسل خارجي</h3>
            </div>
            <div class="box" data-value="full">
              <h3>غسل شامل</h3>
            </div>
          </div>
          <div class="btn">
            <input type="submit" value="Submit">
          </div>
        </div>



      </div>
    </div>
  </div>
</template>
