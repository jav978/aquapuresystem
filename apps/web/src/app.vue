<template>
  <div class="min-h-screen bg-background text-on-surface">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
    <LockdownModal />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';
import { useLicenseStore } from '~/stores/license';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import LockdownModal from '~/components/layout/LockdownModal.vue';

// Initialize theme and license verification on app start
const themeStore = useThemeStore();
const licenseStore = useLicenseStore();

if (import.meta.client) {
  themeStore.init();
  licenseStore.init();
}
</script>