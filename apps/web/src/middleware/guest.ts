import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.loading && !authStore.isAuthenticated) {
    await authStore.initialize();
  }

  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = watch(() => authStore.loading, (loading) => {
        if (!loading) {
          unwatch();
          resolve(true);
        }
      });
    });
  }

  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard');
  }
});