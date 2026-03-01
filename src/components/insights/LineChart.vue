<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-semibold text-text-primary">Investment by Month</h2>
        <p class="text-text-muted text-xs mt-0.5">Cumulative investment done · {{ selectedYear }}</p>
      </div>
      <div v-if="availableYears.length > 1" class="flex items-center gap-1 bg-bg-base rounded-lg p-1">
        <button
          v-for="y in availableYears"
          :key="y"
          :class="[
            'px-3 py-1 rounded-md text-xs font-medium transition-colors',
            selectedYear === y ? 'bg-investment text-white' : 'text-text-muted hover:text-text-primary',
          ]"
          @click="selectedYear = y"
        >{{ y }}</button>
      </div>
    </div>

    <div v-if="store.investments.length === 0" class="flex items-center justify-center h-40">
      <p class="text-text-muted text-sm">No investment categories yet</p>
    </div>

    <template v-else>
      <!-- Legend -->
      <div class="flex items-center gap-5 mb-3">
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <div class="w-5 h-0.5 bg-investment rounded-full" />
          <span>Cumulative invested</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <svg width="20" height="6">
            <line x1="0" y1="3" x2="20" y2="3" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,3" stroke-opacity="0.5" />
          </svg>
          <span>Ideal pace ({{ store.settings.currencySymbol }}{{ formatK(store.totalInvestment) }}/mo)</span>
        </div>
      </div>

      <!-- SVG Chart -->
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" style="height:200px" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="inv-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.01" />
          </linearGradient>
        </defs>

        <!-- Horizontal grid lines -->
        <line
          v-for="tick in yTicks"
          :key="'g' + tick"
          :x1="PL" :y1="yp(tick)"
          :x2="W - PR" :y2="yp(tick)"
          stroke="rgba(255,255,255,0.07)" stroke-width="1"
        />

        <!-- Y-axis labels -->
        <text
          v-for="tick in yTicks"
          :key="'yl' + tick"
          :x="PL - 7" :y="yp(tick) + 4"
          text-anchor="end"
          style="font-size:10px; fill:#94a3b8"
        >{{ formatK(tick) }}</text>

        <!-- X-axis labels -->
        <text
          v-for="(m, i) in MONTHS"
          :key="'xl' + i"
          :x="xp(i)" :y="H - PB + 14"
          text-anchor="middle"
          style="font-size:10px; fill:#94a3b8"
        >{{ m }}</text>

        <!-- Ideal pace line: diagonal from (Jan, totalInvestment) to (Dec, totalInvestment×12) -->
        <line
          v-if="store.totalInvestment > 0"
          :x1="xp(0)"  :y1="yp(store.totalInvestment)"
          :x2="xp(11)" :y2="yp(store.totalInvestment * 12)"
          stroke="#10b981" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="5,4"
        />

        <!-- Area fill -->
        <path :d="areaD" fill="url(#inv-grad)" />

        <!-- Line -->
        <path :d="lineD" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" />

        <!-- Dots + tooltips -->
        <g
          v-for="(val, i) in data"
          :key="'d' + i"
          style="cursor:pointer"
          @mouseenter="hovered = i"
          @mouseleave="hovered = null"
        >
          <!-- Hit area -->
          <circle :cx="xp(i)" :cy="yp(val)" r="10" fill="transparent" />

          <!-- Visible dot -->
          <circle
            :cx="xp(i)" :cy="yp(val)"
            :r="hovered === i ? 5 : 3.5"
            fill="#10b981"
            :fill-opacity="val > 0 ? 1 : 0.2"
            stroke="#0f1117" stroke-width="2"
            style="transition: r 0.1s ease"
          />

          <!-- Tooltip -->
          <g v-if="hovered === i">
            <rect
              :x="tooltipX(i)" :y="yp(val) - 32"
              :width="tooltipW" height="22" rx="5"
              fill="#1e2130" stroke="rgba(255,255,255,0.15)" stroke-width="1"
            />
            <text
              :x="tooltipX(i) + tooltipW / 2" :y="yp(val) - 17"
              text-anchor="middle"
              style="font-size:10px; fill:#f1f5f9; font-weight:600"
            >{{ MONTHS_FULL[i] }}: {{ store.settings.currencySymbol }}{{ formatAmount(val) }}</text>
          </g>
        </g>
      </svg>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'

const store = useBudgetStore()

// ── Chart constants ────────────────────────────────────────────────────────
const W = 560
const H = 200
const PL = 52  // left  (y-axis labels)
const PR = 14  // right
const PT = 16  // top
const PB = 28  // bottom (x-axis labels)
const PLOT_W = W - PL - PR
const PLOT_H = H - PT - PB
const tooltipW = 110

const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ── State ──────────────────────────────────────────────────────────────────
const hovered = ref(null)

// Available years = union of years in tracking + settings.currentYear
const availableYears = computed(() => {
  const s = new Set([store.settings.currentYear])
  Object.keys(store.tracking).forEach(y => s.add(Number(y)))
  return [...s].sort()
})

const selectedYear = ref(store.settings.currentYear)

// ── Data ───────────────────────────────────────────────────────────────────
// Cumulative investment done: each month = sum of all months up to and including it
const data = computed(() => {
  let running = 0
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthTotal = store.investments
      .filter(c => store.isTracked(selectedYear.value, month, c.id))
      .reduce((sum, c) => sum + c.amount, 0)
    running += monthTotal
    return running
  })
})

const maxY = computed(() => {
  const raw = Math.max(...data.value, store.totalInvestment * 12, 1)
  const unit = raw >= 500000 ? 100000 : raw >= 100000 ? 25000 : raw >= 50000 ? 10000 : 5000
  return Math.ceil(raw * 1.1 / unit) * unit
})

const yTicks = computed(() => {
  const m = maxY.value
  return [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * m / 1000) * 1000)
})

// ── Coordinate helpers ─────────────────────────────────────────────────────
function xp(i) { return PL + (i / 11) * PLOT_W }
function yp(v) { return PT + (1 - Math.min(v, maxY.value) / maxY.value) * PLOT_H }

function tooltipX(i) {
  const x = xp(i) - tooltipW / 2
  if (x < PL) return PL
  if (x + tooltipW > W - PR) return W - PR - tooltipW
  return x
}

// ── SVG paths ──────────────────────────────────────────────────────────────
function buildLinePath(pts) {
  if (!pts.length) return ''
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1][0] + pts[i][0]) / 2
    d += ` C ${cpx},${pts[i - 1][1]} ${cpx},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`
  }
  return d
}

const points = computed(() => data.value.map((v, i) => [xp(i), yp(v)]))

const lineD = computed(() => buildLinePath(points.value))

const areaD = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const bottom = yp(0)
  return `${buildLinePath(pts)} L ${pts[pts.length - 1][0]},${bottom} L ${pts[0][0]},${bottom} Z`
})

// ── Formatting ─────────────────────────────────────────────────────────────
function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function formatK(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
  if (n >= 1000)   return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
</script>
