import { defineNuxtRouteMiddleware, navigateTo, useRouter } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Initialize auth if not already done
  if (!authStore.loading && !authStore.isAuthenticated) {
    await authStore.initialize();
  }

  // Wait for initialization to complete
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

  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
});