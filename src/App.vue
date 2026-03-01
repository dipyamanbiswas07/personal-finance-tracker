<template>
  <div class="min-h-screen bg-bg-base">
    <!-- Full-screen loading spinner -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-8 h-8 border-2 rounded-full border-accent/30 border-t-accent animate-spin"
        />
        <p class="text-sm text-text-muted">Loading…</p>
      </div>
    </div>

    <template v-else>
      <AppHeader v-if="authStore.user" />
      <main
        :class="authStore.user ? 'max-w-7xl mx-auto px-4 sm:px-6 py-8' : ''"
      >
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
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
