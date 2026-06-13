import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getNextOccurrence(dateStr, recurring) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (!recurring) return new Date(year, month - 1, day)
  const thisYear = new Date(today.getFullYear(), month - 1, day)
  if (thisYear >= today) return thisYear
  return new Date(today.getFullYear() + 1, month - 1, day)
}

export function daysUntil(dateStr, recurring) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = getNextOccurrence(dateStr, recurring)
  return Math.round((next - today) / (1000 * 60 * 60 * 24))
}

export const useImportantDatesStore = defineStore('importantDates', () => {
  const dates = ref([])
  const loading = ref(false)
  let userId = null

  const sortedDates = computed(() => {
    return [...dates.value].sort((a, b) => {
      const da = daysUntil(a.date, a.recurring)
      const db = daysUntil(b.date, b.recurring)
      const aNeg = da < 0
      const bNeg = db < 0
      if (!aNeg && !bNeg) return da - db   // both upcoming: closest first
      if (aNeg && bNeg) return db - da     // both past: most recent first
      return aNeg ? 1 : -1                 // upcoming before past
    })
  })

  async function loadData() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id ?? null

      const { data, error } = await supabase
        .from('important_dates')
        .select('*')
        .order('date')

      if (error) throw error
      dates.value = (data ?? []).map(row => ({
        id: row.id,
        title: row.title,
        date: row.date,
        type: row.type,
        notes: row.notes ?? '',
        recurring: row.recurring,
        createdAt: row.created_at,
      }))
    } finally {
      loading.value = false
    }
  }

  async function addDate(payload) {
    const newDate = {
      id: generateId(),
      user_id: userId,
      title: payload.title.trim(),
      date: payload.date,
      type: payload.type,
      notes: payload.notes?.trim() ?? '',
      recurring: payload.recurring,
    }
    const { error } = await supabase.from('important_dates').insert(newDate)
    if (error) throw error
    dates.value.push({ ...newDate, createdAt: new Date().toISOString() })
  }

  async function updateDate(id, payload) {
    const updates = {
      title: payload.title.trim(),
      date: payload.date,
      type: payload.type,
      notes: payload.notes?.trim() ?? '',
      recurring: payload.recurring,
    }
    const { error } = await supabase.from('important_dates').update(updates).eq('id', id)
    if (error) throw error
    const idx = dates.value.findIndex(d => d.id === id)
    if (idx !== -1) Object.assign(dates.value[idx], updates)
  }

  async function deleteDate(id) {
    const { error } = await supabase.from('important_dates').delete().eq('id', id)
    if (error) throw error
    dates.value = dates.value.filter(d => d.id !== id)
  }

  function clearData() {
    dates.value = []
    userId = null
  }

  async function clearAllData() {
    if (userId) await supabase.from('important_dates').delete().eq('user_id', userId)
    clearData()
  }

  return {
    dates,
    loading,
    sortedDates,
    loadData,
    addDate,
    updateDate,
    deleteDate,
    clearData,
    clearAllData,
  }
})
