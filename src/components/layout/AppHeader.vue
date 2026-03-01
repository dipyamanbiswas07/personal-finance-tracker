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

        <!-- Mobile nav -->
        <nav class="flex sm:hidden items-center gap-1">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            active-class="!text-accent !bg-accent/10"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/credit-cards', label: 'Cards' },
  { to: '/insights', label: 'Insights' },
]
</script>
