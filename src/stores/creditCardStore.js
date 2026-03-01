import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEYS = {
  cards: 'cc_cards',
  tracking: 'cc_tracking',
  settings: 'cc_settings',
}

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

  function addCard(name) {
    const usedColors = cards.value.map(c => c.color)
    const nextColor =
      COLOR_PALETTE.find(c => !usedColors.includes(c)) ??
      COLOR_PALETTE[cards.value.length % COLOR_PALETTE.length]
    cards.value.push({ id: generateId(), name: name.trim(), color: nextColor })
    persistCards()
  }

  function updateCard(id, name) {
    const card = cards.value.find(c => c.id === id)
    if (!card) return
    card.name = name.trim()
    persistCards()
  }

  function deleteCard(id) {
    cards.value = cards.value.filter(c => c.id !== id)
    persistCards()
  }

  function togglePayment(year, month, cardId) {
    if (!tracking.value[year]) tracking.value[year] = {}
    if (!tracking.value[year][month]) tracking.value[year][month] = {}
    tracking.value[year][month][cardId] = !tracking.value[year][month][cardId]
    persistTracking()
  }

  function setYear(year) {
    currentYear.value = year
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ currentYear: year }))
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  function persistCards() {
    localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards.value))
  }

  function persistTracking() {
    localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(tracking.value))
  }

  function loadFromStorage() {
    try {
      const c = localStorage.getItem(STORAGE_KEYS.cards)
      if (c) cards.value = JSON.parse(c)

      const t = localStorage.getItem(STORAGE_KEYS.tracking)
      if (t) tracking.value = JSON.parse(t)

      const s = localStorage.getItem(STORAGE_KEYS.settings)
      if (s) {
        const parsed = JSON.parse(s)
        if (parsed.currentYear) currentYear.value = parsed.currentYear
      }
    } catch (e) {
      console.error('Failed to load credit card data:', e)
    }
  }

  return {
    cards,
    currentYear,
    isPaid,
    paidForMonth,
    addCard,
    updateCard,
    deleteCard,
    togglePayment,
    setYear,
    loadFromStorage,
  }
})
