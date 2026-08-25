import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side (SSR)
  if (import.meta.server) return;

  const authStore = useAuthStore();

  // Initialize auth if not already done
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
      new Promise<void>(resolve => setTimeout(resolve, 5000)), // 5s timeout
    ]);
  }

  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath !== '/login' ? to.fullPath : undefined },
    });
  }
});