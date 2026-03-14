import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useFamilyStore } from './familyStore.js'

const COLOR_PALETTE = [
  '#6366f1', '#ef4444', '#10b981', '#f59e0b',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
  '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48',
]

function generateId() {
  return `fam-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useFamilyBudgetStore = defineStore('familyBudget', () => {
  const categories = ref([])
  const tracking = ref({})
  const settings = ref({
    currencySymbol: '₹',
    currentYear: new Date().getFullYear(),
  })
  const loading = ref(false)

  function getFamilyId() {
    return useFamilyStore().family?.id ?? null
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  const expenses = computed(() => categories.value.filter(c => c.type === 'Expense'))
  const investments = computed(() => categories.value.filter(c => c.type === 'Investment'))
  const emis = computed(() => categories.value.filter(c => c.type === 'EMI / Loan'))
  const savings = computed(() => categories.value.filter(c => c.type === 'Short term saving'))

  const totalExpense = computed(() => expenses.value.reduce((s, c) => s + (c.amount || 0), 0))
  const totalInvestment = computed(() => investments.value.reduce((s, c) => s + (c.amount || 0), 0))
  const totalEMI = computed(() => emis.value.reduce((s, c) => s + (c.amount || 0), 0))
  const totalSaving = computed(() => savings.value.reduce((s, c) => s + (c.amount || 0), 0))
  const totalBudget = computed(() => totalExpense.value + totalInvestment.value + totalEMI.value + totalSaving.value)

  const categoryMap = computed(() => Object.fromEntries(categories.value.map(c => [c.id, c])))

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

  // ── Actions ──────────────────────────────────────────────────────────────

  async function loadData() {
    const familyId = getFamilyId()
    if (!familyId) return

    loading.value = true
    try {
      const [catsRes, trackRes, settRes] = await Promise.all([
        supabase.from('family_categories').select('*').eq('family_id', familyId).order('created_at'),
        supabase.from('family_tracking').select('*').eq('family_id', familyId),
        supabase.from('family_settings').select('*').eq('family_id', familyId).maybeSingle(),
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
    const familyId = getFamilyId()
    if (!familyId) throw new Error('No family')

    const usedColors = categories.value.map(c => c.color)
    const nextColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) ?? COLOR_PALETTE[categories.value.length % COLOR_PALETTE.length]
    const newCat = {
      id: generateId(),
      family_id: familyId,
      name: payload.name.trim(),
      amount: Number(payload.amount),
      type: payload.type,
      color: payload.color ?? nextColor,
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('family_categories').insert(newCat)
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
    const { error } = await supabase.from('family_categories').update({
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
    const { error } = await supabase.from('family_categories').delete().eq('id', id)
    if (error) throw error
    categories.value = categories.value.filter(c => c.id !== id)
  }

  async function setTracking(year, month, categoryId, value) {
    const familyId = getFamilyId()
    if (!familyId) throw new Error('No family')

    // Optimistic update
    if (!tracking.value[year]) tracking.value[year] = {}
    if (!tracking.value[year][month]) tracking.value[year][month] = {}
    const prev = tracking.value[year][month][categoryId]
    tracking.value[year][month][categoryId] = value

    try {
      const { error } = await supabase.from('family_tracking').upsert({
        family_id: familyId,
        category_id: categoryId,
        year,
        month,
        value,
      }, { onConflict: 'family_id,category_id,year,month' })
      if (error) throw error
    } catch (e) {
      tracking.value[year][month][categoryId] = prev
      throw e
    }
  }

  async function setYear(year) {
    const familyId = getFamilyId()
    if (!familyId) throw new Error('No family')

    const { error } = await supabase.from('family_settings').upsert({
      family_id: familyId,
      current_year: year,
    }, { onConflict: 'family_id' })
    if (error) throw error
    settings.value.currentYear = year
  }

  function clearData() {
    categories.value = []
    tracking.value = {}
    settings.value = { currencySymbol: '₹', currentYear: new Date().getFullYear() }
  }

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
    addCategory,
    updateCategory,
    deleteCategory,
    setTracking,
    setYear,
    clearData,
  }
})
