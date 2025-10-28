import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage,
      meta: { title: 'Wavely - Главная страница' }
    },
    {
      path: '/profile',
      name: 'profilePage',
      component: ProfilePage,
      meta: { title: 'Wavely - Профиль' }
    }
  ]
})

export default router