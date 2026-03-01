<template>
  <div class="glass-card overflow-hidden">
    <!-- Empty state -->
    <div v-if="store.categories.length === 0" class="text-center py-16">
      <p class="text-text-muted text-sm">No categories yet.</p>
      <RouterLink to="/categories" class="text-accent hover:underline text-sm mt-1 inline-block">
        Add categories first →
      </RouterLink>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto scrollbar-thin">
      <table class="w-full min-w-[700px]">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-40 sticky left-0 bg-bg-card z-10">
              Category
            </th>
            <th
              v-for="(month, idx) in MONTHS"
              :key="idx"
              :class="[
                'px-2 py-3 text-xs font-semibold text-center uppercase tracking-wider w-12',
                idx + 1 === currentMonth && isCurrentYear
                  ? 'text-accent'
                  : 'text-text-muted',
              ]"
            >
              {{ month }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cat in store.categories"
            :key="cat.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors group"
          >
            <!-- Category name (sticky) -->
            <td class="px-4 py-2.5 sticky left-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-1.5 h-5 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
                <span class="text-sm text-text-primary truncate">{{ cat.name }}</span>
              </div>
            </td>

            <!-- Month cells -->
            <td
              v-for="monthIdx in 12"
              :key="monthIdx"
              :class="[
                'px-1.5 py-2.5 text-center',
                monthIdx === currentMonth && isCurrentYear ? 'bg-accent/5' : '',
              ]"
            >
              <div class="flex justify-center">
                <MonthCell
                  :year="store.settings.currentYear"
                  :month="monthIdx"
                  :category-id="cat.id"
                />
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-white/10 bg-bg-surface/50">
            <td class="px-4 py-2.5 sticky left-0 bg-bg-surface/80 z-10">
              <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Done</span>
            </td>
            <td
              v-for="monthIdx in 12"
              :key="monthIdx"
              :class="[
                'px-1.5 py-2.5 text-center',
                monthIdx === currentMonth && isCurrentYear ? 'bg-accent/5' : '',
              ]"
            >
              <span
                :class="[
                  'text-xs font-medium',
                  completions[monthIdx - 1].done === store.categories.length && store.categories.length > 0
                    ? 'text-investment'
                    : 'text-text-muted',
                ]"
              >
                {{ completions[monthIdx - 1].done }}/{{ completions[monthIdx - 1].total }}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'
import MonthCell from './MonthCell.vue'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const store = useBudgetStore()
const now = new Date()
const currentMonth = now.getMonth() + 1
const isCurrentYear = computed(() => store.settings.currentYear === now.getFullYear())
const completions = computed(() => store.completionForYear(store.settings.currentYear))
</script>
