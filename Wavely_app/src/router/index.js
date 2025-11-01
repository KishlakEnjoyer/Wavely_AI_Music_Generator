import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../Views/MainPage.vue'
import ProfilePage from '../Views/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage,
    },
    {
      path: '/profile/:userId',
      name: 'profilePage',
      component: ProfilePage
    }
  ]
})

export default router