import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

const COLOR_PALETTE = [
  '#6366f1', '#ef4444', '#10b981', '#f59e0b',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
  '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48',
]

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useCreditCardStore = defineStore('creditCard', () => {
  const cards = ref([])
  const tracking = ref({})
  const currentYear = ref(new Date().getFullYear())
  const loading = ref(false)

  // ── Getters ──────────────────────────────────────────────────────────────

  function isPaid(year, month, cardId) {
    return tracking.value[year]?.[month]?.[cardId] === true
  }

  function paidForMonth(year, month) {
    const monthData = tracking.value[year]?.[month] ?? {}
    const total = cards.value.length
    const paid = cards.value.filter(c => monthData[c.id] === true).length
    return { paid, total }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function loadData() {
    loading.value = true
    try {
      const [cardsRes, trackRes] = await Promise.all([
        supabase.from('cc_cards').select('*').order('id'),
        supabase.from('cc_tracking').select('*'),
      ])

      if (cardsRes.data) {
        cards.value = cardsRes.data.map(row => ({
          id: row.id,
          name: row.name,
          color: row.color,
        }))
      }

      if (trackRes.data) {
        const map = {}
        for (const row of trackRes.data) {
          map[row.year] ??= {}
          map[row.year][row.month] ??= {}
          map[row.year][row.month][row.card_id] = row.paid
        }
        tracking.value = map
      }
    } finally {
      loading.value = false
    }
  }

  async function addCard(name) {
    const usedColors = cards.value.map(c => c.color)
    const nextColor =
      COLOR_PALETTE.find(c => !usedColors.includes(c)) ??
      COLOR_PALETTE[cards.value.length % COLOR_PALETTE.length]
    const { data: { session } } = await supabase.auth.getSession()
    const user = session.user
    const newCard = { id: generateId(), user_id: user.id, name: name.trim(), color: nextColor }
    const { error } = await supabase.from('cc_cards').insert(newCard)
    if (error) throw error
    cards.value.push(newCard)
  }

  async function updateCard(id, name) {
    const { error } = await supabase.from('cc_cards').update({ name: name.trim() }).eq('id', id)
    if (error) throw error
    const card = cards.value.find(c => c.id === id)
    if (card) card.name = name.trim()
  }

  async function deleteCard(id) {
    const { error } = await supabase.from('cc_cards').delete().eq('id', id)
    if (error) throw error
    cards.value = cards.value.filter(c => c.id !== id)
  }

  async function togglePayment(year, month, cardId) {
    const current = tracking.value[year]?.[month]?.[cardId] ?? false
    // Optimistic update
    if (!tracking.value[year]) tracking.value[year] = {}
    if (!tracking.value[year][month]) tracking.value[year][month] = {}
    tracking.value[year][month][cardId] = !current

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { error } = await supabase.from('cc_tracking').upsert({
        user_id: session.user.id,
        card_id: cardId,
        year,
        month,
        paid: !current,
      }, { onConflict: 'user_id,card_id,year,month' })
      if (error) throw error
    } catch (e) {
      // Revert on failure
      tracking.value[year][month][cardId] = current
      throw e
    }
  }

  function setYear(year) {
    currentYear.value = year
  }

  async function importFromJSON(data) {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session.user

    if (Array.isArray(data.cc_cards) && data.cc_cards.length > 0) {
      const rows = data.cc_cards.map(c => ({ id: c.id, user_id: user.id, name: c.name, color: c.color }))
      const { error } = await supabase.from('cc_cards').upsert(rows, { onConflict: 'id' })
      if (error) throw error
      cards.value = data.cc_cards.map(c => ({ id: c.id, name: c.name, color: c.color }))
    }

    if (data.cc_tracking) {
      const rows = []
      for (const [year, months] of Object.entries(data.cc_tracking)) {
        for (const [month, cardMap] of Object.entries(months)) {
          for (const [cardId, paid] of Object.entries(cardMap)) {
            rows.push({ user_id: user.id, card_id: cardId, year: Number(year), month: Number(month), paid: Boolean(paid) })
          }
        }
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('cc_tracking').upsert(rows, { onConflict: 'user_id,card_id,year,month' })
        if (error) throw error
      }
      tracking.value = data.cc_tracking
    }
  }

  function clearData() {
    cards.value = []
    tracking.value = {}
    currentYear.value = new Date().getFullYear()
  }

  async function clearAllData() {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session.user
    // Deleting cc_cards cascades to cc_tracking via FK
    await supabase.from('cc_cards').delete().eq('user_id', user.id)
    clearData()
  }

  // ── Legacy alias ────────────────────────────────────────────────────────
  const loadFromStorage = loadData

  return {
    cards,
    currentYear,
    loading,
    isPaid,
    paidForMonth,
    loadData,
    loadFromStorage,
    importFromJSON,
    addCard,
    updateCard,
    deleteCard,
    togglePayment,
    setYear,
    clearData,
    clearAllData,
  }
})
