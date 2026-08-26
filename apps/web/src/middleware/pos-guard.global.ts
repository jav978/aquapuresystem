import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useLicenseStore } from '~/stores/license';

export default defineNuxtRouteMiddleware((to) => {
  // Skip on server
  if (import.meta.server) return;

  // Verify license tamper state globally
  const licenseStore = useLicenseStore();
  licenseStore.verifyAntiClockTamper();

  // If system is tampered and user tries to navigate away, keep them locked
  if (licenseStore.isTampered && to.path !== '/login') {
    // Handled by LockdownModal overlay
    return;
  }
});
