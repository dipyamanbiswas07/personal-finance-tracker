import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  categories: 'budget_categories',
  tracking: 'budget_tracking',
  settings: 'budget_settings',
}

const COLOR_PALETTE = [
  '#6366f1', '#ef4444', '#10b981', '#f59e0b',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
  '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48',
]

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useBudgetStore = defineStore('budget', () => {
  const categories = ref([])
  const tracking = ref({})
  const settings = ref({
    currencySymbol: '₹',
    currentYear: new Date().getFullYear(),
  })

  // ── Getters ────────────────────────────────────────────────────────────────

  const expenses = computed(() => categories.value.filter(c => c.type === 'Expense'))
  const investments = computed(() => categories.value.filter(c => c.type === 'Investment'))
  const emis = computed(() => categories.value.filter(c => c.type === 'EMI / Loan'))
  const savings = computed(() => categories.value.filter(c => c.type === 'Short term saving'))

  const totalExpense = computed(() =>
    expenses.value.reduce((sum, c) => sum + (c.amount || 0), 0)
  )
  const totalInvestment = computed(() =>
    investments.value.reduce((sum, c) => sum + (c.amount || 0), 0)
  )
  const totalEMI = computed(() =>
    emis.value.reduce((sum, c) => sum + (c.amount || 0), 0)
  )
  const totalSaving = computed(() =>
    savings.value.reduce((sum, c) => sum + (c.amount || 0), 0)
  )
  const totalBudget = computed(() =>
    totalExpense.value + totalInvestment.value + totalEMI.value + totalSaving.value
  )

  function completionForMonth(year, month) {
    const monthData = tracking.value[year]?.[month] ?? {}
    const total = categories.value.length
    const done = categories.value.filter(c => {
      const v = monthData[c.id]
      return v === true || (typeof v === 'number' && v > 0)
    }).length
    const percent = total === 0 ? 0 : Math.round((done / total) * 100)
    return { done, total, percent }
  }

  function completionForYear(year) {
    return Array.from({ length: 12 }, (_, i) => completionForMonth(year, i + 1))
  }

  function isTracked(year, month, categoryId) {
    const v = tracking.value[year]?.[month]?.[categoryId]
    return v === true || (typeof v === 'number' && v > 0)
  }

  function getTrackingValue(year, month, categoryId) {
    return tracking.value[year]?.[month]?.[categoryId] ?? false
  }

  function setTracking(year, month, categoryId, value) {
    if (!tracking.value[year]) tracking.value[year] = {}
    if (!tracking.value[year][month]) tracking.value[year][month] = {}
    tracking.value[year][month][categoryId] = value
    persistTracking()
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function addCategory(payload) {
    const usedColors = categories.value.map(c => c.color)
    const nextColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) ?? COLOR_PALETTE[categories.value.length % COLOR_PALETTE.length]
    categories.value.push({
      id: generateId(),
      name: payload.name.trim(),
      amount: Number(payload.amount),
      type: payload.type,
      color: payload.color ?? nextColor,
      createdAt: new Date().toISOString(),
    })
    persistCategories()
  }

  function updateCategory(id, payload) {
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx === -1) return
    categories.value[idx] = {
      ...categories.value[idx],
      name: payload.name.trim(),
      amount: Number(payload.amount),
      type: payload.type,
    }
    persistCategories()
  }

  function deleteCategory(id) {
    categories.value = categories.value.filter(c => c.id !== id)
    persistCategories()
  }

  function toggleTracking(year, month, categoryId) {
    if (!tracking.value[year]) tracking.value[year] = {}
    if (!tracking.value[year][month]) tracking.value[year][month] = {}
    const current = tracking.value[year][month][categoryId] ?? false
    tracking.value[year][month][categoryId] = !current
    persistTracking()
  }

  function setYear(year) {
    settings.value.currentYear = year
    persistSettings()
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  function persistCategories() {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories.value))
  }

  function persistTracking() {
    localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(tracking.value))
  }

  function persistSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings.value))
  }

  function loadFromStorage() {
    try {
      const cats = localStorage.getItem(STORAGE_KEYS.categories)
      if (cats) categories.value = JSON.parse(cats)

      const track = localStorage.getItem(STORAGE_KEYS.tracking)
      if (track) tracking.value = JSON.parse(track)

      const sett = localStorage.getItem(STORAGE_KEYS.settings)
      if (sett) {
        const parsed = JSON.parse(sett)
        settings.value = { ...settings.value, ...parsed }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }

  return {
    // state
    categories,
    tracking,
    settings,
    // getters
    expenses,
    investments,
    emis,
    savings,
    totalExpense,
    totalInvestment,
    totalEMI,
    totalSaving,
    totalBudget,
    completionForMonth,
    completionForYear,
    isTracked,
    getTrackingValue,
    // actions
    addCategory,
    updateCategory,
    deleteCategory,
    toggleTracking,
    setTracking,
    setYear,
    loadFromStorage,
  }
})
