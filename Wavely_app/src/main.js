import './assets/main.css'
import './assets/fonts.css'

import { createApp } from 'vue'
import App from './Main.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
