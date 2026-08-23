<template>
  <header class="h-16 bg-surface dark:bg-surface-container border-b border-outline-variant dark:border-outline-variant flex items-center justify-between px-4 sm:px-6 lg:px-8">
    <!-- Mobile Menu Button -->
    <button
      @click="$emit('menu-toggle')"
      class="lg:hidden p-2 rounded-lg text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors"
      aria-label="Toggle menu"
      aria-expanded="menuOpen"
    >
      <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Page Title / Breadcrumb -->
    <div class="flex-1 lg:pl-8">
      <slot name="title">
        <h1 class="text-headline-md font-semibold text-on-surface dark:text-on-surface truncate">
          AquaPure Pro
        </h1>
      </slot>
    </div>

    <!-- Right Side Actions -->
    <div class="flex items-center gap-3">
      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="p-2 rounded-lg text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors"
        :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <svg v-if="!themeStore.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button class="p-2 rounded-lg text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors relative" aria-label="Notifications">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
        </button>
      </div>

      <!-- User Menu -->
      <div class="relative">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors"
          aria-label="User menu"
          aria-expanded="showUserMenu"
        >
          <Avatar :name="authStore.user?.fullName || 'User'" :src="authStore.user?.avatar" size="sm" :status="authStore.user?.isActive ? 'online' : 'offline'" />
          <span class="hidden sm:block text-label-md font-medium text-on-surface dark:text-on-surface truncate max-w-[150px]">
            {{ authStore.user?.fullName || 'User' }}
          </span>
          <svg class="w-4 h-4 text-on-surface-variant dark:text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- User Menu Dropdown -->
        <Transition name="dropdown">
          <div v-if="showUserMenu" class="absolute right-0 mt-2 w-56 bg-surface dark:bg-surface-container rounded-lg shadow-level2 dark:shadow-level2 border border-outline-variant dark:border-outline-variant py-1 z-50">
            <div class="px-3 py-2 border-b border-outline-variant dark:border-outline-variant">
              <p class="text-label-md font-medium text-on-surface dark:text-on-surface truncate">{{ authStore.user?.fullName }}</p>
              <p class="text-label-sm text-on-surface-variant dark:text-on-surface-variant truncate">{{ authStore.user?.email }}</p>
              <span class="badge badge-xs mt-1" :variant="getRoleVariant(authStore.user?.role)">{{ authStore.user?.role }}</span>
            </div>
            <NuxtLink to="/settings" class="block px-3 py-2 text-label-md text-on-surface dark:text-on-surface hover:bg-surface-container-highest dark:hover:bg-surface-container-high" @click.native="showUserMenu = false">
              <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Settings
            </NuxtLink>
            <hr class="my-1 border-outline-variant dark:border-outline-variant" />
            <button @click="logout" class="block w-full text-left px-3 py-2 text-label-md text-error dark:text-error-dark hover:bg-surface-container-highest dark:hover:bg-surface-container-high flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useThemeStore } from '~/stores/theme';
import Avatar from '~/components/ui/Avatar.vue';

const props = defineProps<{
  menuOpen: boolean;
}>();

const emit = defineEmits<{
  'menu-toggle': [];
}>();

const authStore = useAuthStore();
const themeStore = useThemeStore();

const showUserMenu = ref(false);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'error';
    case 'MANAGER': return 'warning';
    case 'OPERATOR': return 'primary';
    default: return 'default';
  }
};

const logout = () => {
  authStore.logout();
  showUserMenu.value = false;
};
</script>