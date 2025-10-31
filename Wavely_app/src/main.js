import './assets/main.css'
import './assets/fonts.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

const pinia = createPinia()
import App from './Main.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
