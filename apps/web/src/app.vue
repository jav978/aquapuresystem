<template>
  <div class="min-h-screen bg-background dark:bg-background-dark">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Global app setup
import { useThemeStore } from '~/stores/theme';

// Initialize theme on app start
const themeStore = useThemeStore();
if (import.meta.client) {
  themeStore.init();
}
</script>