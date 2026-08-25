import { defineNuxtPlugin } from '#app';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin((nuxtApp) => {
  if (nuxtApp.$pinia) {
    (nuxtApp.$pinia as any).use(piniaPluginPersistedstate);
  }
});