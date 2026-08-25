import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async () => {
  // Skip middleware on server-side (SSR)
  if (import.meta.server) return;

  const authStore = useAuthStore();

  if (!authStore.loading && !authStore.isAuthenticated) {
    await authStore.initialize();
  }

  // Wait for initialization to complete (with timeout safety)
  if (authStore.loading) {
    await Promise.race([
      new Promise<void>(resolve => {
        const unwatch = watch(() => authStore.loading, (loading) => {
          if (!loading) {
            unwatch();
            resolve();
          }
        });
      }),
      new Promise<void>(resolve => setTimeout(resolve, 5000)),
    ]);
  }

  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard');
  }
});