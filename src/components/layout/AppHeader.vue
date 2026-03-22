<template>
  <header class="sticky top-0 z-40 bg-bg-surface/80 backdrop-blur-md border-b border-white/10" style="padding-top: env(safe-area-inset-top, 0px)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <svg class="w-8 h-8 shrink-0" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#818cf8"/>
                <stop offset="100%" stop-color="#4338ca"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logo-bg)" class="transition-opacity group-hover:opacity-80"/>
            <path d="M5,22 L11,16 L17,14 L23,8 L23,27 L5,27 Z" fill="rgba(255,255,255,0.07)"/>
            <polyline points="5,22 11,16 17,14 23,8" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
            <path d="M18.5,10.5 L23,8 L21.5,12.5" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
            <circle cx="5"  cy="22" r="1.8" fill="rgba(255,255,255,0.5)"/>
            <circle cx="11" cy="16" r="2"   fill="rgba(255,255,255,0.72)"/>
            <circle cx="17" cy="14" r="2"   fill="rgba(255,255,255,0.9)"/>
          </svg>
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

        <!-- Right side: avatar dropdown + mobile nav -->
        <div class="flex items-center gap-1">

          <!-- User avatar dropdown -->
          <div class="relative" ref="userMenuRef">
            <button
              class="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
              @click="userMenuOpen = !userMenuOpen"
            >
              <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-white/15">
                <img
                  v-if="avatarUrl"
                  :src="avatarUrl"
                  :alt="displayName"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer"
                />
                <div v-else class="w-full h-full bg-accent/30 flex items-center justify-center text-[11px] font-bold text-accent">
                  {{ initials }}
                </div>
              </div>
              <svg
                class="w-3 h-3 text-text-muted hidden sm:block transition-transform duration-150"
                :class="userMenuOpen ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <Transition name="dropdown">
              <div
                v-if="userMenuOpen"
                class="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-white/10 bg-bg-card/95 backdrop-blur-sm shadow-xl z-50 overflow-hidden"
              >
                <!-- User info -->
                <div class="px-4 py-3 flex items-center gap-3 border-b border-white/8">
                  <div class="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-white/15">
                    <img
                      v-if="avatarUrl"
                      :src="avatarUrl"
                      :alt="displayName"
                      class="w-full h-full object-cover"
                      referrerpolicy="no-referrer"
                    />
                    <div v-else class="w-full h-full bg-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                      {{ initials }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-text-primary truncate">{{ displayName }}</p>
                    <p class="text-[11px] text-text-muted truncate mt-0.5">{{ authStore.user?.email }}</p>
                  </div>
                </div>

                <!-- Data actions -->
                <div class="py-1 border-b border-white/8">
                  <p class="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold text-text-muted/50 uppercase tracking-wider">Data</p>
                  <button class="dropdown-item" @click="exportData(); userMenuOpen = false">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Export data
                  </button>
                  <button class="dropdown-item" @click="triggerImport(); userMenuOpen = false">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Import data
                  </button>
                  <button
                    class="dropdown-item text-expense/70 hover:text-expense hover:bg-expense/10"
                    @click="handleClearData(); userMenuOpen = false"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear all data
                  </button>
                </div>

                <!-- Sign out -->
                <div class="py-1">
                  <button
                    class="dropdown-item text-expense/70 hover:text-expense hover:bg-expense/10"
                    @click="handleSignOut(); userMenuOpen = false"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <input ref="fileInput" type="file" accept=".json" class="hidden" @change="importData" />

          <BaseConfirmDialog
            v-model="showClearConfirm"
            title="Clear all data"
            message="Delete ALL your data permanently? This cannot be undone."
            confirm-label="Delete all"
            @confirm="executeClearData"
          />

          <!-- Mobile nav -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'
import { useBudgetStore } from '../../stores/budgetStore.js'
import { useCreditCardStore } from '../../stores/creditCardStore.js'
import { useToast } from '../../composables/useToast.js'
import BaseConfirmDialog from '../ui/BaseConfirmDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const store = useBudgetStore()
const ccStore = useCreditCardStore()
const { toast } = useToast()

const showClearConfirm = ref(false)

const mainLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
]
const utilLinks = [
  { to: '/credit-cards', label: 'Cards' },
  { to: '/family', label: 'Family' },
]

const fileInput = ref(null)
const userMenuOpen = ref(false)
const userMenuRef = ref(null)

const avatarUrl = computed(() => authStore.user?.user_metadata?.avatar_url ?? null)
const displayName = computed(() => {
  const meta = authStore.user?.user_metadata
  return meta?.full_name ?? meta?.name ?? authStore.user?.email?.split('@')[0] ?? 'User'
})
const initials = computed(() => {
  const parts = displayName.value.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return displayName.value.slice(0, 2).toUpperCase()
})

function onClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))

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
      await Promise.all([store.importFromJSON(data), ccStore.importFromJSON(data)])
      toast.success('Import complete!')
    } catch (err) {
      toast.error('Import failed: ' + (err.message ?? 'Invalid file.'))
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function handleClearData() {
  showClearConfirm.value = true
}

async function executeClearData() {
  await Promise.all([store.clearAllData(), ccStore.clearAllData()])
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<style scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 500;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  text-align: left;
}
.dropdown-item:hover {
  color: #f1f5f9;
  background: rgba(255,255,255,0.06);
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
