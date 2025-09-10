
<template>
  <div class="page-not-found">
    <h1>404</h1>
    <p>الصفحة غير موجودة</p>
    <router-link to="/">العودة للصفحة الرئيسية</router-link>
  </div>
</template>

<style>
.page-not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background);
  color: var(--p);
}

.page-not-found h1 {
  font-size: 8rem;
  color: var(--blue);
}

.page-not-found p {
  font-size: 1.5rem;
  margin-block: 30px;
}

.page-not-found a {
  background: var(--navbar);
  color: var(--white);
  border: 2px solid var(--border);
  padding: 12px 40px;
  font-weight: 800;
  border-radius: 10px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: .2s;
}

.page-not-found a:hover {
  background: var(--yellow);
  color: #999;
}

@media (max-width: 600px) {
  .page-not-found h1 {
    font-size: 5rem;
  }

  .page-not-found p {
    font-size: 1.2rem;
  }
}
</style>

