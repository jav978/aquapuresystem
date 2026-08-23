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

  const requiredRoles = to.meta.roles as string[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) return;

  if (!authStore.hasRole(requiredRoles)) {
    return navigateTo('/dashboard');
  }
});