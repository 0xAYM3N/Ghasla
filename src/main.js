import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia' 
import { useUserStore } from './stores/userStore'
import './Global.css'

const app = createApp(App)

app.use(createPinia()) 
app.use(router)

app.mount('#app')

// بعد تحميل الـ app نتحقق من بيانات المستخدم
app.config.globalProperties.$nextTick(() => {
  const userStore = useUserStore()
  userStore.fetchUser()
})

