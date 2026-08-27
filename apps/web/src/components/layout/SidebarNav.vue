<template>
  <div class="flex flex-col h-full py-4 bg-surface-container-lowest border-r border-black/5 dark:border-white/5 select-none relative overflow-hidden">
    <!-- Ambient Sidebar Water Aura -->
    <div class="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Brand Header -->
    <div class="px-4 pb-4 mb-2 border-b border-black/5 dark:border-white/5">
      <NuxtLink to="/dashboard" class="flex items-center gap-2.5 group cursor-pointer" @click="$emit('close')">
        <div class="w-9 h-9 bg-primary/15 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/20 transition-all duration-300">
          <span class="material-symbols-outlined text-primary text-xl" data-weight="fill">water_drop</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h1 class="text-sm font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">AquaPure Pro</h1>
            <span class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-primary/15 text-primary border border-primary/20">v2.0</span>
          </div>
          <p class="text-[10px] text-on-surface-variant font-medium">Gestión Hídrica & POS</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Section Title: MENÚ PRINCIPAL -->
    <div class="px-4 pt-2 pb-2 flex items-center justify-between">
      <span class="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/80">
        Menú Principal
      </span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
    </div>

    <!-- Navigation Links -->
    <div class="flex-1 flex flex-col gap-1.5 px-3 py-3 custom-scrollbar overflow-y-auto">
      <NuxtLink
        v-for="item in navLinks"
        :key="item.path"
        :to="item.path"
        class="relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group select-none"
        :class="[
          isActive(item.path)
            ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary font-bold shadow-sm ring-1 ring-primary/30 dark:ring-primary/40'
            : 'text-on-surface-variant hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/15 hover:translate-x-1 hover:shadow-sm'
        ]"
        @click="$emit('close')"
      >
        <!-- Active indicator bar inside -->
        <div class="flex items-center gap-3 min-w-0">
          <div
            v-if="isActive(item.path)"
            class="w-1.5 h-5 rounded-full bg-primary shadow-sm shadow-primary/60 flex-shrink-0 animate-in"
          ></div>
          <span
            class="material-symbols-outlined text-xl transition-all duration-200"
            :class="[
              isActive(item.path)
                ? 'text-primary scale-105'
                : 'text-on-surface-variant/70 group-hover:text-primary group-hover:scale-110'
            ]"
            :data-weight="isActive(item.path) ? 'fill' : undefined"
          >
            {{ item.icon }}
          </span>
          <span
            class="text-xs font-semibold truncate transition-colors"
            :class="[
              isActive(item.path)
                ? 'text-primary font-bold'
                : 'text-on-surface-variant group-hover:text-on-surface dark:group-hover:text-white'
            ]"
          >
            {{ item.label }}
          </span>
        </div>

        <!-- Right Hover/Active Subtle Indicator -->
        <div class="flex items-center flex-shrink-0">
          <div
            v-if="isActive(item.path)"
            class="w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse"
          ></div>
          <span
            v-else
            class="material-symbols-outlined text-sm text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
          >
            chevron_right
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Bottom Footer Navigation: User Info + Settings + Logout -->
    <div class="mt-auto px-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
      <!-- Active User Capsule with Vibrant Glowing Avatar -->
      <div class="p-2.5 rounded-2xl bg-surface-container/60 dark:bg-surface-container/40 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-sm flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <!-- High-contrast Avatar with Glowing Gradient in Dark Mode -->
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 via-primary to-blue-600 dark:from-sky-400 dark:to-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-primary/30 ring-2 ring-white/20 dark:ring-primary/40 flex-shrink-0 font-sans tracking-wide">
            {{ userInitial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-on-surface truncate leading-tight">{{ authStore.user?.fullName || 'Usuario' }}</p>
            <span
              class="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-1 shadow-sm"
              :class="authStore.user?.role === 'ADMIN'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-primary/15 text-primary border border-primary/30'"
            >
              <span v-if="authStore.user?.role === 'ADMIN'" class="material-symbols-outlined text-[10px]" data-weight="fill">verified</span>
              {{ authStore.user?.role === 'ADMIN' ? 'Admin' : (authStore.user?.role === 'MANAGER' ? 'Supervisor' : 'Operador') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-1">
        <!-- Settings (Admin only) -->
        <NuxtLink
          v-if="authStore.canManageSettings"
          to="/settings"
          class="flex items-center justify-between px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer group select-none"
          :class="[
            isActive('/settings')
              ? 'bg-primary/15 text-primary font-bold ring-1 ring-primary/20'
              : 'text-on-surface-variant hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/15 hover:translate-x-1'
          ]"
          @click="$emit('close')"
        >
          <div class="flex items-center gap-3">
            <span
              class="material-symbols-outlined text-lg transition-transform group-hover:rotate-45 duration-300"
              :class="isActive('/settings') ? 'text-primary' : 'text-on-surface-variant/70 group-hover:text-primary'"
              :data-weight="isActive('/settings') ? 'fill' : undefined"
            >
              settings
            </span>
            <span class="text-xs font-semibold group-hover:text-on-surface dark:group-hover:text-white transition-colors">Configuración</span>
          </div>
          <span class="material-symbols-outlined text-sm text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            chevron_right
          </span>
        </NuxtLink>

        <!-- Logout Button -->
        <button
          type="button"
          @click="logout"
          class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-error-red hover:bg-error-red/10 dark:hover:bg-error-red/15 hover:translate-x-1 transition-all duration-200 cursor-pointer group select-none"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-lg text-on-surface-variant/70 group-hover:text-error-red group-hover:scale-110 transition-all duration-200">logout</span>
            <span class="group-hover:text-error-red transition-colors">Cerrar Sesión</span>
          </div>
          <span class="material-symbols-outlined text-sm text-error-red opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

defineEmits<{
  'close': [];
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const userInitial = computed(() => {
  if (authStore.user?.firstName) {
    return authStore.user.firstName.charAt(0).toUpperCase();
  }
  if (authStore.user?.fullName) {
    return authStore.user.fullName.charAt(0).toUpperCase();
  }
  return 'A';
});

const navLinks = computed(() => {
  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Punto de Venta', path: '/sales', icon: 'point_of_sale' },
    { label: 'Inventario & Stock', path: '/inventory', icon: 'inventory_2' },
    { label: 'Facturación', path: '/sales/invoices', icon: 'receipt_long' },
  ];

  if (authStore.canManageUsers) {
    links.push({ label: 'Usuarios', path: '/users', icon: 'group' });
  }

  return links;
});

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