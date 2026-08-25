<template>
  <div class="min-h-screen flex items-center justify-center bg-background text-on-background px-4 relative overflow-hidden">
    <!-- Ambient Glow Blobs -->
    <div class="absolute top-1/3 left-1/4 w-80 h-80 bg-error-red/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
    <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10 text-center">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-error-red/10 mb-8 shadow-xl shadow-error-red/10 mx-auto">
        <span class="material-symbols-outlined text-error-red" style="font-size: 48px;">lock</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-on-surface mb-3 tracking-tight">Acceso No Autorizado</h1>
      <p class="text-on-surface-variant text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        No tienes los permisos necesarios para acceder a esta sección.
        Si crees que esto es un error, contacta al administrador del sistema.
      </p>

      <!-- Role badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-xs text-on-surface-variant mb-8 shadow-sm">
        <span class="material-symbols-outlined text-base">manage_accounts</span>
        <span>Tu rol actual: <strong class="text-primary font-bold">{{ authStore.user?.role || 'Sin rol asignado' }}</strong></span>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink
          to="/dashboard"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm glow-cyan-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">home</span>
          Volver al Dashboard
        </NuxtLink>
        <button
          @click="authStore.logout()"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container hover:bg-error-red/10 hover:text-error-red text-on-surface-variant font-semibold text-sm transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <span class="material-symbols-outlined text-lg">logout</span>
          Cerrar Sesión
        </button>
      </div>

      <!-- Support info -->
      <p class="mt-10 text-[11px] text-on-surface-variant/50">
        Soporte: <a href="mailto:jav1978@gmail.com" class="text-primary hover:underline">jav1978@gmail.com</a> — Ing. José Vásquez
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: false,
  middleware: ['auth'],
});

const authStore = useAuthStore();
</script>
