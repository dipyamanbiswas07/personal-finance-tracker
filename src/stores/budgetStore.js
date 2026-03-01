import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

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
  const loading = ref(false)
  let userId = null

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

  const categoryMap = computed(() =>
    Object.fromEntries(categories.value.map(c => [c.id, c]))
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

  // ── Actions ────────────────────────────────────────────────────────────────

  async function loadData() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id ?? null

      const [catsRes, trackRes, settRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at'),
        supabase.from('tracking').select('*'),
        supabase.from('settings').select('*').single(),
      ])

      if (catsRes.data) {
        categories.value = catsRes.data.map(row => ({
          id: row.id,
          name: row.name,
          amount: Number(row.amount),
          type: row.type,
          color: row.color,
          createdAt: row.created_at,
        }))
      }

      if (trackRes.data) {
        const map = {}
        for (const row of trackRes.data) {
          map[row.year] ??= {}
          map[row.year][row.month] ??= {}
          map[row.year][row.month][row.category_id] = row.value
        }
        tracking.value = map
      }

      if (settRes.data) {
        settings.value = {
          currencySymbol: settRes.data.currency_symbol ?? '₹',
          currentYear: settRes.data.current_year ?? new Date().getFullYear(),
        }
      }
    } finally {
      loading.value = false
    }
  }

  async function addCategory(payload) {
    const usedColors = categories.value.map(c => c.color)
    const nextColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) ?? COLOR_PALETTE[categories.value.length % COLOR_PALETTE.length]
    const newCat = {
      id: generateId(),
      user_id: userId,
      name: payload.name.trim(),
      amount: Number(payload.amount),
      type: payload.type,
      color: payload.color ?? nextColor,
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('categories').insert(newCat)
    if (error) throw error
    categories.value.push({
      id: newCat.id,
      name: newCat.name,
      amount: newCat.amount,
      type: newCat.type,
      color: newCat.color,
      createdAt: newCat.created_at,
    })
  }

  async function updateCategory(id, payload) {
    const { error } = await supabase.from('categories').update({
      name: payload.name.trim(),
      amount: Number(payload.amount),
      type: payload.type,
    }).eq('id', id)
    if (error) throw error
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = {
        ...categories.value[idx],
        name: payload.name.trim(),
        amount: Number(payload.amount),
        type: payload.type,
      }
    }
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    categories.value = categories.value.filter(c => c.id !== id)
  }

  async function setTracking(year, month, categoryId, value) {
    // Optimistic update — reflect the change in the UI immediately
    if (!tracking.value[year]) tracking.value[year] = {}
    if (!tracking.value[year][month]) tracking.value[year][month] = {}
    const prev = tracking.value[year][month][categoryId]
    tracking.value[year][month][categoryId] = value

    try {
      const { error } = await supabase.from('tracking').upsert({
        user_id: userId,
        category_id: categoryId,
        year,
        month,
        value,
      }, { onConflict: 'user_id,category_id,year,month' })
      if (error) throw error
    } catch (e) {
      // Revert on failure
      tracking.value[year][month][categoryId] = prev
      throw e
    }
  }

  async function toggleTracking(year, month, categoryId) {
    const current = tracking.value[year]?.[month]?.[categoryId] ?? false
    await setTracking(year, month, categoryId, !current)
  }

  async function setYear(year) {
    const { error } = await supabase.from('settings').upsert({
      user_id: userId,
      current_year: year,
    }, { onConflict: 'user_id' })
    if (error) throw error
    settings.value.currentYear = year
  }

  async function importFromJSON(data) {
    if (Array.isArray(data.budget_categories) && data.budget_categories.length > 0) {
      const rows = data.budget_categories.map(c => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        amount: Number(c.amount),
        type: c.type,
        color: c.color,
        created_at: c.createdAt ?? new Date().toISOString(),
      }))
      const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'id' })
      if (error) throw error
      categories.value = data.budget_categories.map(c => ({ ...c, amount: Number(c.amount) }))
    }

    if (data.budget_tracking) {
      const rows = []
      for (const [year, months] of Object.entries(data.budget_tracking)) {
        for (const [month, cats] of Object.entries(months)) {
          for (const [catId, value] of Object.entries(cats)) {
            rows.push({ user_id: userId, category_id: catId, year: Number(year), month: Number(month), value })
          }
        }
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('tracking').upsert(rows, { onConflict: 'user_id,category_id,year,month' })
        if (error) throw error
      }
      tracking.value = data.budget_tracking
    }

    if (data.budget_settings) {
      await supabase.from('settings').upsert({
        user_id: userId,
        currency_symbol: data.budget_settings.currencySymbol ?? '₹',
        current_year: data.budget_settings.currentYear ?? new Date().getFullYear(),
      }, { onConflict: 'user_id' })
      settings.value = { ...settings.value, ...data.budget_settings }
    }
  }

  function clearData() {
    categories.value = []
    tracking.value = {}
    settings.value = { currencySymbol: '₹', currentYear: new Date().getFullYear() }
    userId = null
  }

  async function clearAllData() {
    // Deleting categories cascades to tracking rows via FK
    await supabase.from('categories').delete().eq('user_id', userId)
    await supabase.from('settings').delete().eq('user_id', userId)
    clearData()
  }

  // ── Legacy alias (called from App.vue) ────────────────────────────────────
  const loadFromStorage = loadData

  return {
    // state
    categories,
    tracking,
    settings,
    loading,
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
    categoryMap,
    completionForMonth,
    completionForYear,
    isTracked,
    getTrackingValue,
    // actions
    loadData,
    loadFromStorage,
    importFromJSON,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleTracking,
    setTracking,
    setYear,
    clearData,
    clearAllData,
  }
})
