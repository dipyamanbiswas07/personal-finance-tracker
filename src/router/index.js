import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CreditCardsView from '../views/CreditCardsView.vue'
import FamilyView from '../views/FamilyView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/authStore.js'

const routes = [
  { path: '/login', component: LoginView, meta: { public: true, title: 'Sign In' } },
  { path: '/', component: DashboardView, meta: { title: 'Dashboard' } },
  { path: '/categories', component: CategoriesView, meta: { title: 'Categories' } },
  { path: '/tracker', redirect: '/categories' },
  { path: '/insights', redirect: '/' },
  { path: '/credit-cards', component: CreditCardsView, meta: { title: 'Credit Cards' } },
  { path: '/family', component: FamilyView, meta: { title: 'Family' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Supabase implicit OAuth flow returns tokens in the hash fragment.
  // Strip the leading #/ or # that Vue Router may have prepended.
  const rawHash = window.location.hash.replace(/^#\/?/, '')
  const hashParams = new URLSearchParams(rawHash)
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  if (accessToken && refreshToken) {
    await authStore.handleImplicitCallback(accessToken, refreshToken)
    window.history.replaceState({}, '', window.location.origin + '/#/')
    return authStore.user ? '/' : '/login'
  }

  await authStore.init()
  if (!to.meta.public && !authStore.user) return '/login'
  if (to.path === '/login' && authStore.user) return '/'
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Personal Finance Tracker'} — Personal Finance Tracker`
})

export default router
