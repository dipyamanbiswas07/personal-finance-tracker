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
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Right side: export/import + mobile nav -->
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
          <input ref="fileInput" type="file" accept=".json" class="hidden" @change="importData" />

          <!-- Mobile nav (divider + links, small screens only) -->
          <div class="flex sm:hidden items-center gap-1 ml-1 pl-2 border-l border-white/10">
            <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
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

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/credit-cards', label: 'Cards' },
  { to: '/insights', label: 'Insights' },
]

const KEYS = [
  'budget_categories',
  'budget_tracking',
  'budget_settings',
  'cc_cards',
  'cc_tracking',
  'cc_settings',
]

const fileInput = ref(null)

function exportData() {
  const data = {}
  for (const key of KEYS) {
    const val = localStorage.getItem(key)
    if (val) data[key] = JSON.parse(val)
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

function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      for (const key of KEYS) {
        if (data[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(data[key]))
        }
      }
      window.location.reload()
    } catch {
      alert('Invalid file — please use a file exported from this app.')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>
