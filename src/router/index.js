import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('../views/MemberView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/book',
    name: 'book',
    component: () => import('../views/BookView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/peminjaman',
    name: 'peminjaman',
    component: () => import('../views/PeminjamanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pengembalian',
    name: 'pengembalian',
    component: () => import('../views/PengembalianView.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/chart',
  name: 'chart',
  component: () => import('../views/ChartView.vue'),
  meta: { requiresAuth: true }
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ✅ Navigation Guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/') // redirect ke login
  } else if (to.path === '/' && isLoggedIn) {
    next('/members') // kalau udah login, langsung ke home
  } else {
    next()
  }
})

export default router
