<template>
  <header class="sticky top-0 z-40 bg-bg-surface/80 backdrop-blur-md border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
            <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="font-semibold text-text-primary text-sm hidden sm:block">Personal Finance Tracker</span>
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="hidden sm:flex items-center gap-1">
          <RouterLink v-for="link in mainLinks" :key="link.to" :to="link.to" class="nav-link">
            {{ link.label }}
          </RouterLink>
          <span class="w-px h-4 bg-white/15 mx-1" />
          <RouterLink v-for="link in utilLinks" :key="link.to" :to="link.to" class="nav-link">
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Right side: export/import + sign out + mobile nav -->
        <div class="flex items-center gap-1">
          <!-- Export / Import (always visible) -->
          <button
            title="Export data to file"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="exportData"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Export
          </button>
          <button
            title="Import data from file"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="triggerImport"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Import
          </button>

          <!-- Clear data -->
          <button
            title="Clear all data"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
            @click="handleClearData"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear data
          </button>

          <!-- Sign Out -->
          <button
            title="Sign out"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="handleSignOut"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign out
          </button>

          <!-- Icon-only on mobile -->
          <button title="Export" class="sm:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors" @click="exportData">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
          <button title="Import" class="sm:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors" @click="triggerImport">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button title="Clear data" class="sm:hidden p-2 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors" @click="handleClearData">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button title="Sign out" class="sm:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors" @click="handleSignOut">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
          <input ref="fileInput" type="file" accept=".json" class="hidden" @change="importData" />

          <!-- Mobile nav (divider + links, small screens only) -->
          <div class="flex sm:hidden items-center gap-1 ml-1 pl-2 border-l border-white/10">
            <RouterLink v-for="link in mainLinks" :key="link.to" :to="link.to"
              class="px-2 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              active-class="!text-accent !bg-accent/10"
            >
              {{ link.label }}
            </RouterLink>
            <span class="w-px h-3.5 bg-white/15 mx-0.5" />
            <RouterLink v-for="link in utilLinks" :key="link.to" :to="link.to"
              class="px-2 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              active-class="!text-accent !bg-accent/10"
            >
              {{ link.label }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'
import { useBudgetStore } from '../../stores/budgetStore.js'
import { useCreditCardStore } from '../../stores/creditCardStore.js'

const router = useRouter()
const authStore = useAuthStore()
const store = useBudgetStore()
const ccStore = useCreditCardStore()

const mainLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
]
const utilLinks = [
  { to: '/credit-cards', label: 'Cards' },
]

const fileInput = ref(null)

function exportData() {
  const data = {
    budget_categories: store.categories,
    budget_tracking: store.tracking,
    budget_settings: store.settings,
    cc_cards: ccStore.cards,
    cc_tracking: ccStore.tracking,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finance-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value.click()
}

async function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      await Promise.all([
        store.importFromJSON(data),
        ccStore.importFromJSON(data),
      ])
      alert('Import complete!')
    } catch (err) {
      alert('Import failed: ' + (err.message ?? 'Invalid file.'))
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

async function handleClearData() {
  if (!confirm('Delete ALL your data permanently? This cannot be undone.')) return
  await Promise.all([store.clearAllData(), ccStore.clearAllData()])
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>
