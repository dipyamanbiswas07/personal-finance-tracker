import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import TrackerView from '../views/TrackerView.vue'
import InsightsView from '../views/InsightsView.vue'
import CreditCardsView from '../views/CreditCardsView.vue'

const routes = [
  { path: '/', component: DashboardView, meta: { title: 'Dashboard' } },
  { path: '/categories', component: CategoriesView, meta: { title: 'Categories' } },
  { path: '/tracker', component: TrackerView, meta: { title: 'Tracker' } },
  { path: '/insights', component: InsightsView, meta: { title: 'Insights' } },
  { path: '/credit-cards', component: CreditCardsView, meta: { title: 'Credit Cards' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Personal Finance Tracker'} — Personal Finance Tracker`
})

export default router
