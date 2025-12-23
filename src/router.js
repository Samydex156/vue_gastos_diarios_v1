import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import MainLayout from './views/MainLayout.vue'

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login', component: Login
  },
  {
    path: '/app',
    component: MainLayout,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia simple: Si no hay usuario en localStorage, mandar al login
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('dq_user')
  if (to.path.startsWith('/app') && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router