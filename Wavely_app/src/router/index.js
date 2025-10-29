import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
<<<<<<< HEAD
import PromptPage from '../views/PromptPage.vue'
=======
import ProfilePage from '@/views/ProfilePage.vue'
>>>>>>> MainPageBranch

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage,
    },
    {
<<<<<<< HEAD
      path: '/promptPage',
      name: 'promptPage',
      component: PromptPage,
=======
      path: '/profile',
      name: 'profilePage',
      component: ProfilePage
>>>>>>> MainPageBranch
    }
  ]
})

export default router