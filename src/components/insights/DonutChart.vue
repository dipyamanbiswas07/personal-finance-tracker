<template>
  <div class="glass-card p-5 flex flex-col">
    <h2 class="font-semibold text-text-primary mb-1">Budget Split</h2>
    <p class="text-text-muted text-xs mb-5">Breakdown by category type</p>

    <div v-if="store.totalBudget === 0" class="flex items-center justify-center h-40">
      <p class="text-text-muted text-sm">No data yet</p>
    </div>

    <div v-else class="flex items-center gap-6">
      <!-- SVG Donut -->
      <div class="relative shrink-0">
        <svg :width="size" :height="size" class="-rotate-90">
          <!-- Background ring -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            :stroke-width="strokeWidth"
          />
          <!-- Expense arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#ef4444"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.expense} ${circumference}`"
            stroke-dashoffset="0"
            class="transition-all duration-700"
          />
          <!-- Investment arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#10b981"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.investment} ${circumference}`"
            :stroke-dashoffset="-arcs.expense"
            class="transition-all duration-700"
          />
          <!-- EMI arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#f59e0b"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.emi} ${circumference}`"
            :stroke-dashoffset="-(arcs.expense + arcs.investment)"
            class="transition-all duration-700"
          />
          <!-- Short term saving arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#8b5cf6"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.saving} ${circumference}`"
            :stroke-dashoffset="-(arcs.expense + arcs.investment + arcs.emi)"
            class="transition-all duration-700"
          />
        </svg>
        <!-- Center label -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xs text-text-muted">Total</span>
          <span class="text-sm font-bold text-text-primary">
            {{ store.settings.currencySymbol }}{{ formatK(store.totalBudget) }}
          </span>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-3 flex-1">
        <div v-for="item in legend" :key="item.label" class="space-y-1">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
              <span class="text-text-muted">{{ item.label }}</span>
            </div>
            <span class="font-semibold text-text-primary">{{ item.percent }}%</span>
          </div>
          <div class="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: item.percent + '%', backgroundColor: item.color }"
            />
          </div>
          <p class="text-xs text-text-muted">{{ store.settings.currencySymbol }}{{ formatAmount(item.amount) }}</p>
        </div>
      </div>
    </div>

    <!-- Investment by month line chart -->
    <div v-if="store.totalInvestment > 0" class="mt-5 pt-4 border-t border-white/[0.06] flex flex-col flex-1 min-h-0">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Investments — {{ currentYear }}</span>
        </div>
        <div v-if="lastPoint" class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span class="w-4 border-t border-dashed border-text-muted/40" />
            Ideal
          </div>
          <span class="text-xs font-bold text-investment">{{ store.settings.currencySymbol }}{{ formatK(lastPoint.paid) }}</span>
        </div>
      </div>
      <div class="flex-1 min-h-[160px]">
        <svg :viewBox="`0 0 ${CW} ${CH}`" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mini-inv-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.2" />
              <stop offset="60%" stop-color="#34d399" stop-opacity="0.05" />
              <stop offset="100%" stop-color="#34d399" stop-opacity="0" />
            </linearGradient>
            <filter id="line-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Horizontal grid lines -->
          <line
            v-for="i in 4"
            :key="'grid' + i"
            :x1="CPL" :x2="CW - CPR"
            :y1="CPT + ((i - 1) / 3) * CPLOT_H" :y2="CPT + ((i - 1) / 3) * CPLOT_H"
            stroke="rgba(255,255,255,0.04)" stroke-width="1"
          />

          <!-- Y-axis labels -->
          <text
            v-for="i in 4"
            :key="'yl' + i"
            :x="CPL - 2" :y="CPT + ((i - 1) / 3) * CPLOT_H + 3"
            text-anchor="end"
            style="font-size:7px; fill:rgba(113,113,122,0.5)"
          >{{ formatK(chartMaxY * (1 - (i - 1) / 3)) }}</text>

          <!-- Ideal pace line (diagonal from 0 to annual target) -->
          <line
            :x1="cxp(0)" :y1="cyp(0)"
            :x2="cxp(11)" :y2="cyp(store.totalInvestment * 12)"
            stroke="rgba(113,113,122,0.2)" stroke-width="1"
            stroke-dasharray="4 3"
          />

          <!-- Area fill -->
          <path :d="miniAreaD" fill="url(#mini-inv-grad)" />

          <!-- Line with glow -->
          <path :d="miniLineD" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="url(#line-glow)" opacity="0.4" />
          <path :d="miniLineD" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Dots + hover (only months with data) -->
          <g
            v-for="m in investmentByMonth.filter(x => x.paid !== null)"
            :key="m.month"
            style="cursor:pointer"
            @mouseenter="hoveredMonth = m.month"
            @mouseleave="hoveredMonth = null"
          >
            <circle :cx="cxp(m.month - 1)" :cy="cyp(m.paid)" r="12" fill="transparent" />

            <!-- Pulse ring on current month -->
            <circle
              v-if="m.month === currentMonth && hoveredMonth !== m.month"
              :cx="cxp(m.month - 1)" :cy="cyp(m.paid)"
              r="8" fill="none" stroke="#34d399" stroke-width="1" opacity="0.25"
              class="animate-ping"
              style="animation-duration:2s; transform-origin: center; transform-box: fill-box;"
            />

            <circle
              :cx="cxp(m.month - 1)" :cy="cyp(m.paid)"
              :r="hoveredMonth === m.month ? 5 : m.month === currentMonth ? 4 : 3"
              fill="#34d399"
              :fill-opacity="m.paid > 0 ? 1 : 0.3"
              stroke="#18181b" stroke-width="2"
              style="transition: r 0.15s ease"
            />

            <!-- Tooltip -->
            <g v-if="hoveredMonth === m.month">
              <!-- Vertical guide line -->
              <line
                :x1="cxp(m.month - 1)" :y1="cyp(m.paid) + 6"
                :x2="cxp(m.month - 1)" :y2="CPT + CPLOT_H"
                stroke="rgba(52,211,153,0.2)" stroke-width="1" stroke-dasharray="2 2"
              />
              <rect
                :x="miniTooltipX(m.month - 1)" :y="cyp(m.paid) - 32"
                :width="TTW" height="24" rx="6"
                fill="#18181b" stroke="rgba(52,211,153,0.25)" stroke-width="1"
              />
              <text
                :x="miniTooltipX(m.month - 1) + TTW / 2" :y="cyp(m.paid) - 16"
                text-anchor="middle"
                style="font-size:9px; fill:#fafaf9; font-weight:600; font-family:Outfit,system-ui,sans-serif"
              >{{ MONTHS_FULL[m.month - 1] }}: {{ store.settings.currencySymbol }}{{ formatAmount(m.paid) }}</text>
            </g>
          </g>

          <!-- X-axis month labels -->
          <text
            v-for="(m, i) in MONTHS_SHORT"
            :key="'xl' + i"
            :x="cxp(i)" :y="CH - 2"
            :text-anchor="i === 0 ? 'start' : i === 11 ? 'end' : 'middle'"
            :style="`font-size:8px; font-family:Outfit,system-ui,sans-serif; fill:${i + 1 === currentMonth ? '#34d399' : 'rgba(113,113,122,0.5)'};${i + 1 === currentMonth ? ' font-weight:600' : ''}`"
          >{{ m }}</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'

import { currentMonth, currentYear } from '../../composables/useCurrentPeriod.js'

const store = useBudgetStore()

// ── Mini line chart constants ──────────────────────────────────────────────
const CW = 400
const CH = 180
const CPL = 32
const CPR = 8
const CPT = 14
const CPB = 20
const CPLOT_W = CW - CPL - CPR
const CPLOT_H = CH - CPT - CPB
const TTW = 120

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']

const hoveredMonth = ref(null) // stores month number 1–12

// Cumulative investment tracked, only up to currentMonth; future months are null
const investmentByMonth = computed(() => {
  let running = 0
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    if (month > currentMonth) return { month, paid: null }
    const monthPaid = store.investments.reduce((sum, cat) => {
      const v = store.getTrackingValue(currentYear, month, cat.id)
      if (v === true) return sum + (cat.amount ?? 0)
      if (typeof v === 'number' && v > 0) return sum + v
      return sum
    }, 0)
    running += monthPaid
    return { month, paid: running }
  })
})

const chartMaxY = computed(() => {
  const cumValues = investmentByMonth.value.filter(m => m.paid !== null).map(m => m.paid)
  return Math.max(...cumValues, 1) * 1.1
})

function cxp(monthIdx) { return CPL + (monthIdx / 11) * CPLOT_W }  // monthIdx = 0–11
function cyp(v)         { return CPT + (1 - Math.min(v, chartMaxY.value) / chartMaxY.value) * CPLOT_H }

function miniTooltipX(monthIdx) {
  const x = cxp(monthIdx) - TTW / 2
  if (x < CPL) return CPL
  if (x + TTW > CW - CPR) return CW - CPR - TTW
  return x
}

function buildPath(pts) {
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ')
}

// Only plot the months that have data
const lastPoint = computed(() => {
  const tracked = investmentByMonth.value.filter(m => m.paid !== null)
  if (!tracked.length) return null
  const last = tracked[tracked.length - 1]
  return { x: cxp(last.month - 1), y: cyp(last.paid), paid: last.paid, month: last.month }
})

const miniPoints = computed(() =>
  investmentByMonth.value
    .filter(m => m.paid !== null)
    .map(m => [cxp(m.month - 1), cyp(m.paid)])
)
const miniLineD = computed(() => buildPath(miniPoints.value))
const miniAreaD = computed(() => {
  const pts = miniPoints.value
  if (!pts.length) return ''
  const bot = cyp(0)
  return `${buildPath(pts)} L ${pts[pts.length - 1][0]},${bot} L ${pts[0][0]},${bot} Z`
})

const size = 140
const cx = size / 2
const cy = size / 2
const r = 52
const strokeWidth = 18
const circumference = 2 * Math.PI * r

function pct(amount) {
  return store.totalBudget === 0 ? 0 : Math.round((amount / store.totalBudget) * 100)
}

const percents = computed(() => {
  const exp = pct(store.totalExpense)
  const inv = pct(store.totalInvestment)
  const emi = pct(store.totalEMI)
  const sav = 100 - exp - inv - emi
  return { exp, inv, emi, sav: Math.max(0, sav) }
})

const arcs = computed(() => ({
  expense:    (percents.value.exp / 100) * circumference,
  investment: (percents.value.inv / 100) * circumference,
  emi:        (percents.value.emi / 100) * circumference,
  saving:     (percents.value.sav / 100) * circumference,
}))

const legend = computed(() => [
  { label: 'Expenses',          color: '#ef4444', percent: percents.value.exp, amount: store.totalExpense    },
  { label: 'Investments',       color: '#10b981', percent: percents.value.inv, amount: store.totalInvestment },
  ...(store.totalEMI    > 0 ? [{ label: 'EMI / Loan',        color: '#f59e0b', percent: percents.value.emi, amount: store.totalEMI    }] : []),
  ...(store.totalSaving > 0 ? [{ label: 'Short term saving', color: '#8b5cf6', percent: percents.value.sav, amount: store.totalSaving }] : []),
])

function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function formatK(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
</script>
