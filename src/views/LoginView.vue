<template>
  <div class="login-root">

    <!-- ─── Left Panel ─────────────────────────────────────────────────── -->
    <div class="left-panel">
      <div class="bg-grid" />
      <div class="bg-glow glow-a" />
      <div class="bg-glow glow-b" />
      <div class="bg-symbol" aria-hidden="true">₹</div>

      <div class="left-content">
        <!-- Brand -->
        <header class="brand anim" style="--d:0ms">
          <span class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </span>
          <span class="brand-name">Personal Finance Tracker</span>
        </header>

        <!-- Central content -->
        <div class="center-block">
          <div class="headline-block anim" style="--d:80ms">
            <h1 class="headline">
              Every rupee,<br>
              <em>accounted for.</em>
            </h1>
            <p class="tagline">
              Budget tracking that follows you across every device.<br>No spreadsheets. No excuses.
            </p>
          </div>

          <ul class="feature-list anim" style="--d:160ms">
            <li v-for="f in features" :key="f.text">
              <span class="feature-dot" :style="`background:${f.color}`" />
              <span class="feature-text">{{ f.text }}</span>
            </li>
          </ul>
        </div>

        <!-- Stats footer -->
        <footer class="stats-row anim" style="--d:240ms">
          <div v-for="(s, i) in stats" :key="s.label" class="stat">
            <span class="stat-val">{{ s.val }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
            <span v-if="i < stats.length - 1" class="stat-sep" />
          </div>
        </footer>
      </div>
    </div>

    <!-- ─── Right Panel ────────────────────────────────────────────────── -->
    <div class="right-panel">
      <div class="form-wrap anim" style="--d:120ms">

        <!-- Mobile-only brand -->
        <div class="mobile-brand">
          <span class="brand-icon sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </span>
          <span>Personal Finance Tracker</span>
        </div>

        <!-- Heading -->
        <div class="form-hd">
          <h2>{{ isSignUp ? 'Create account' : 'Welcome back' }}</h2>
          <p>{{ isSignUp ? 'Start tracking your budget today' : 'Sign in to your finance dashboard' }}</p>
        </div>

        <!-- Alerts -->
        <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="alert success">{{ successMsg }}</div>

        <!-- Social providers -->
        <div class="social-btns">
          <button class="social-btn" :disabled="submitting" @click="oauthSignIn('google')">
            <!-- Google -->
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line" />
          <span class="divider-text">or continue with email</span>
          <span class="divider-line" />
        </div>

        <!-- Fields -->
        <div class="fields">
          <label class="field">
            <span class="field-lbl">Email address</span>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              @keyup.enter="submit"
            />
          </label>
          <label class="field">
            <span class="field-lbl">Password</span>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              @keyup.enter="submit"
            />
          </label>
        </div>

        <!-- Submit -->
        <button class="submit-btn" :disabled="submitting" @click="submit">
          <span v-if="!submitting">{{ isSignUp ? 'Create account' : 'Sign in' }}</span>
          <span v-else class="spinner" />
        </button>

        <!-- Toggle mode -->
        <p class="toggle-line">
          {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
          <button class="toggle-btn" @click="toggleMode">
            {{ isSignUp ? 'Sign in' : 'Sign up' }}
          </button>
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const features = [
  { text: 'Track expenses, EMIs, investments & savings', color: '#6366f1' },
  { text: '12-month overview at a single glance',        color: '#10b981' },
  { text: 'Credit card payment tracking built-in',       color: '#f59e0b' },
]

const stats = [
  { val: '12', label: 'Months' },
  { val: '4',  label: 'Categories' },
  { val: '∞',  label: 'Devices' },
]

function toggleMode() {
  isSignUp.value = !isSignUp.value
  errorMsg.value = ''
  successMsg.value = ''
}

async function oauthSignIn(provider) {
  submitting.value = true
  try {
    await authStore.signInWithProvider(provider)
  } catch (err) {
    errorMsg.value = err.message ?? 'OAuth sign-in failed.'
    submitting.value = false
  }
}

async function submit() {
  errorMsg.value = ''
  successMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = 'Please fill in your email and password.'
    return
  }
  submitting.value = true
  try {
    if (isSignUp.value) {
      await authStore.signUp(email.value, password.value)
      successMsg.value = 'Account created! Check your email to confirm, then sign in.'
      isSignUp.value = false
    } else {
      await authStore.signIn(email.value, password.value)
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = err.message ?? 'Something went wrong.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

/* ── Root ─────────────────────────────────────────────────────────────── */
.login-root {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

/* ── Entrance animation ───────────────────────────────────────────────── */
.anim {
  opacity: 0;
  animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Left Panel ───────────────────────────────────────────────────────── */
.left-panel {
  display: none;
  position: relative;
  overflow: hidden;
  background: #06090f;
  flex-direction: column;
}
@media (min-width: 1024px) {
  .left-panel { display: flex; width: 54%; }
}

/* Background grid */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 56px 56px;
}

/* Glow blobs */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}
.glow-a {
  width: 520px; height: 520px;
  top: -140px; right: -100px;
  background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%);
}
.glow-b {
  width: 380px; height: 380px;
  bottom: -100px; left: -80px;
  background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%);
}

/* Decorative large symbol */
.bg-symbol {
  position: absolute;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(280px, 28vw, 440px);
  font-weight: 300;
  color: rgba(99,102,241,0.032);
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  user-select: none;
  pointer-events: none;
  line-height: 1;
  letter-spacing: -0.04em;
}

/* Content layout */
.left-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 52px 60px 48px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(99,102,241,0.35);
}
.brand-icon svg { width: 18px; height: 18px; color: white; }
.brand-icon.sm  { width: 30px; height: 30px; border-radius: 8px; }
.brand-icon.sm svg { width: 14px; height: 14px; }
.brand-name {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.015em;
}

/* Center block */
.center-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  padding: 28px 0;
}

/* Headline */
.headline-block { display: flex; flex-direction: column; gap: 18px; }
.headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(42px, 4.2vw, 62px);
  font-weight: 300;
  line-height: 1.12;
  color: rgba(255,255,255,0.93);
  margin: 0;
  letter-spacing: -0.01em;
}
.headline em {
  font-style: italic;
  color: #a5b4fc;
}
.tagline {
  font-size: 14px;
  font-weight: 300;
  line-height: 1.75;
  color: rgba(255,255,255,0.38);
  margin: 0;
  max-width: 340px;
}

/* Features */
.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.feature-list li {
  display: flex;
  align-items: center;
  gap: 11px;
}
.feature-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.feature-text {
  font-size: 13.5px;
  font-weight: 300;
  color: rgba(255,255,255,0.48);
}

/* Stats footer */
.stats-row {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}
.stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 400;
  color: rgba(255,255,255,0.88);
  line-height: 1;
}
.stat-lbl {
  font-size: 10.5px;
  font-weight: 400;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}
.stat-sep {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 30px;
  background: rgba(255,255,255,0.09);
}

/* ── Right Panel ──────────────────────────────────────────────────────── */
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: #1a1d27;
  position: relative;
  overflow: hidden;
}
.right-panel::before {
  content: '';
  position: absolute;
  top: -100px; right: -100px;
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.right-panel::after {
  content: '';
  position: absolute;
  bottom: -80px; left: -80px;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.form-wrap {
  width: 100%;
  max-width: 370px;
  display: flex;
  flex-direction: column;
  gap: 26px;
  position: relative;
  z-index: 1;
}

/* Mobile brand */
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(241,245,249,0.75);
  font-size: 13px;
  font-weight: 500;
}
@media (min-width: 1024px) { .mobile-brand { display: none; } }

/* Form heading */
.form-hd h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px;
  font-weight: 400;
  color: #f1f5f9;
  margin: 0 0 7px;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.form-hd p {
  font-size: 13.5px;
  font-weight: 300;
  color: #64748b;
  margin: 0;
}

/* Alerts */
.alert {
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.55;
}
.alert.error   { background: rgba(239,68,68,0.08);   border: 1px solid rgba(239,68,68,0.22);   color: #fca5a5; }
.alert.success { background: rgba(16,185,129,0.08);  border: 1px solid rgba(16,185,129,0.22);  color: #6ee7b7; }

/* Social buttons */
.social-btns { display: flex; flex-direction: column; gap: 10px; }
.social-btn {
  width: 100%;
  min-height: 42px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(241,245,249,0.85);
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.15s, border-color 0.15s, transform 0.12s;
  letter-spacing: 0.01em;
}
.social-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.18);
  transform: translateY(-1px);
}
.social-btn:active:not(:disabled) { transform: translateY(0); }
.social-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
}
.divider-text {
  font-size: 11.5px;
  color: #334155;
  white-space: nowrap;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Fields */
.fields { display: flex; flex-direction: column; gap: 14px; }
.field  { display: flex; flex-direction: column; gap: 7px; }
.field-lbl {
  font-size: 11.5px;
  font-weight: 500;
  color: #475569;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.field input {
  width: 100%;
  padding: 11px 15px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.03);
  color: #f1f5f9;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  -webkit-appearance: none;
}
.field input::placeholder { color: rgba(148,163,184,0.35); }
.field input:hover {
  border-color: rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.045);
}
.field input:focus {
  border-color: rgba(99,102,241,0.55);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  background: rgba(99,102,241,0.03);
}

/* Submit button */
.submit-btn {
  width: 100%;
  min-height: 44px;
  padding: 11px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  box-shadow: 0 4px 20px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  letter-spacing: 0.01em;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.15);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 12px rgba(99,102,241,0.22);
}
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Spinner */
.spinner {
  display: block;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Toggle */
.toggle-line {
  text-align: center;
  font-size: 13px;
  color: #475569;
  margin: -6px 0 0;
}
.toggle-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: #818cf8;
  transition: color 0.15s;
}
.toggle-btn:hover { color: #a5b4fc; }
</style>
