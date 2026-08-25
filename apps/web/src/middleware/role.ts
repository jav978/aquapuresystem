import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
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

  // Check required roles from page meta
  const requiredRoles = to.meta.roles as string[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) return;

  if (!authStore.hasRole(requiredRoles)) {
    // Redirect to dedicated unauthorized page instead of silently redirecting to dashboard
    return navigateTo('/unauthorized');
  }
});