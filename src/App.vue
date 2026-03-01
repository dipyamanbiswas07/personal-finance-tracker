<template>
  <div class="min-h-screen bg-bg-base">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBudgetStore } from './stores/budgetStore.js'
import { useCreditCardStore } from './stores/creditCardStore.js'
import AppHeader from './components/layout/AppHeader.vue'

const store = useBudgetStore()
const ccStore = useCreditCardStore()
onMounted(() => {
  store.loadFromStorage()
  ccStore.loadFromStorage()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
