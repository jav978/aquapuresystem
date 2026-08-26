<template>
  <div class="min-h-screen bg-background text-on-surface">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';
import ToastContainer from '~/components/ui/ToastContainer.vue';

// Initialize theme on app start
const themeStore = useThemeStore();
if (import.meta.client) {
  themeStore.init();
}
</script>