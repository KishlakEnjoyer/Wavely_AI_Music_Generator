import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../Views/MainPage.vue'
import ProfilePage from '@/Views/ProfilePage.vue'
import OtherUserProfilePage from '@/Views/OtherUserProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage,
    },
    {
      path: '/profile',
      name: 'profilePage',
      component: ProfilePage
    },
    {
      path: '/user/:userId',
      name: 'userprofile',
      component: OtherUserProfilePage
    }
  ]
})

export default router