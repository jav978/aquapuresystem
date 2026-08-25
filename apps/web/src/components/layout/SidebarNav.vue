<template>
  <div class="flex flex-col h-full py-6 bg-surface-container-lowest border-r border-outline-variant/30 select-none">
    <!-- Brand Header -->
    <div class="px-6 mb-6">
      <NuxtLink to="/dashboard" class="flex items-center gap-3 group" @click="$emit('close')">
        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-primary/10">
          <span class="material-symbols-outlined text-primary text-2xl" data-weight="fill">water_drop</span>
        </div>
        <div>
          <h1 class="font-headline-md text-lg font-bold text-primary tracking-tight">AquaPure Pro</h1>
          <p class="text-xs text-on-surface-variant">Gestión de Agua</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Section Title: GESTIÓN DE AGUA -->
    <div class="px-6 mb-2">
      <span class="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">
        Gestión de Agua
      </span>
    </div>

    <!-- Navigation Links -->
    <div class="flex-1 flex flex-col gap-1 px-3">
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        :class="[
          isActive('/dashboard')
            ? 'bg-primary/15 text-primary font-bold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        ]"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-xl" :data-weight="isActive('/dashboard') ? 'fill' : undefined">dashboard</span>
        <span class="text-sm font-medium">Dashboard</span>
      </NuxtLink>

      <NuxtLink
        to="/sales"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        :class="[
          isActive('/sales')
            ? 'bg-primary/15 text-primary font-bold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        ]"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-xl" :data-weight="isActive('/sales') ? 'fill' : undefined">payments</span>
        <span class="text-sm font-medium">Ventas</span>
      </NuxtLink>

      <NuxtLink
        to="/inventory"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        :class="[
          isActive('/inventory')
            ? 'bg-primary/15 text-primary font-bold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        ]"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-xl" :data-weight="isActive('/inventory') ? 'fill' : undefined">inventory_2</span>
        <span class="text-sm font-medium">Inventario</span>
      </NuxtLink>

      <NuxtLink
        to="/sales/invoices"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        :class="[
          isActive('/sales/invoices')
            ? 'bg-primary/15 text-primary font-bold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        ]"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-xl" :data-weight="isActive('/sales/invoices') ? 'fill' : undefined">receipt_long</span>
        <span class="text-sm font-medium">Facturación</span>
      </NuxtLink>

      <NuxtLink
        to="/users"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        :class="[
          isActive('/users')
            ? 'bg-primary/15 text-primary font-bold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        ]"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-xl" :data-weight="isActive('/users') ? 'fill' : undefined">group</span>
        <span class="text-sm font-medium">Usuarios</span>
      </NuxtLink>
    </div>

    <!-- Bottom Footer Navigation: Configuración & Cerrar Sesión -->
    <div class="mt-auto px-3 pt-4 border-t border-outline-variant/30 space-y-1">
      <NuxtLink
        to="/settings"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        :class="[
          isActive('/settings')
            ? 'bg-primary/15 text-primary font-bold shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        ]"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-xl" :data-weight="isActive('/settings') ? 'fill' : undefined">settings</span>
        <span class="text-sm font-medium">Configuración</span>
      </NuxtLink>

      <button
        type="button"
        @click="logout"
        class="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-on-surface-variant hover:text-error-red hover:bg-error-red/10 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <span class="material-symbols-outlined text-xl">logout</span>
        <span class="text-sm font-medium">Cerrar Sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

defineEmits<{
  'close': [];
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/';
  }
  if (path === '/sales') {
    return route.path === '/sales';
  }
  if (path === '/sales/invoices') {
    return route.path === '/sales/invoices';
  }
  return route.path.startsWith(path);
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>