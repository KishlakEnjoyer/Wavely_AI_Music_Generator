import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import PromptPage from '../views/PromptPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage,
    },
    {
      path: '/promptPage',
      name: 'promptPage',
      component: PromptPage,
    }
  ]
})

export default router