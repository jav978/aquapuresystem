<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: [
    async function () {
      if (import.meta.server) return;
      const auth = useAuthStore();
      if (!auth.loading && !auth.isAuthenticated) {
        await auth.initialize();
      }
      if (auth.isAuthenticated) {
        return navigateTo('/dashboard');
      }
      return navigateTo('/login');
    }
  ]
});
</script>
