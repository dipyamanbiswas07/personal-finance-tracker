<template>
  <div class="min-h-screen bg-bg-base">
    <!-- Ambient background glow -->
    <div class="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div
        class="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[560px] rounded-full"
        style="background: radial-gradient(ellipse at top, rgba(99,102,241,0.09) 0%, transparent 68%)"
      />
    </div>

    <!-- Full-screen loading spinner -->
    <div v-if="isLoading" class="relative z-10 flex items-center justify-center min-h-screen">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-8 h-8 border-2 rounded-full border-accent/30 border-t-accent animate-spin"
        />
        <p class="text-sm text-text-muted">Loading…</p>
      </div>
    </div>

    <template v-else>
      <div class="relative z-10">
        <AppHeader v-if="authStore.user" />
        <main :class="authStore.user ? 'max-w-7xl mx-auto px-4 sm:px-6 py-8' : ''">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "./stores/authStore.js";
import { useCreditCardStore } from "./stores/creditCardStore.js";
import { useBudgetStore } from "./stores/budgetStore.js";
import AppHeader from "./components/layout/AppHeader.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const store = useBudgetStore();
const ccStore = useCreditCardStore();

const isLoading = computed(
  () => authStore.loading || store.loading || ccStore.loading,
);

onMounted(async () => {
  await authStore.init();
  if (authStore.user) {
    await Promise.all([store.loadData(), ccStore.loadData()]);
  }
});

watch(
  () => authStore.user,
  async (user) => {
    if (user) {
      await Promise.all([store.loadData(), ccStore.loadData()]);
      // After OAuth redirect the router guard may have already landed on /login
      // before the session was established — push to dashboard if still on a public page.
      if (route.meta.public) {
        router.push("/");
      }
    } else {
      store.clearData();
      ccStore.clearData();
    }
  },
);
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
