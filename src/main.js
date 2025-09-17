import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia' 
import { useUserStore } from './stores/userStore'
import './Global.css'

const app = createApp(App)

app.use(createPinia()) 
app.use(router)

const userStore = useUserStore()
userStore.initAuth().then(() => {
  app.mount('#app')
})
