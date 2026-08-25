import { defineNuxtPlugin } from '#app';
import { useThemeStore } from '~/stores/theme';

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    const themeStore = useThemeStore();
    themeStore.init();
  }
});
