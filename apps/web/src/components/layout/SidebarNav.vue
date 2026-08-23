<template>
  <nav class="flex flex-col h-full" :aria-label="collapsed ? 'Collapsed navigation' : 'Main navigation'">
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-outline-variant dark:border-outline-variant">
      <NuxtLink to="/dashboard" class="flex items-center gap-2" :class="collapsed && 'justify-center'">
        <div class="w-8 h-8 bg-primary dark:bg-primary-dark rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <span v-if="!collapsed" class="text-headline-md font-bold text-on-surface dark:text-on-surface">AquaPure Pro</span>
      </NuxtLink>

      <button
        v-if="!collapsed"
        @click="$emit('toggle')"
        class="p-1.5 rounded-lg text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors"
        aria-label="Collapse sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Navigation Items -->
    <div class="flex-1 overflow-y-auto p-3 space-y-1">
      <nav class="space-y-1" aria-label="Main navigation">
        <template v-for="group in navigationGroups" :key="group.label">
          <div v-if="group.items.length > 0" class="space-y-1">
            <h3 v-if="!collapsed && group.label" class="px-3 py-1.5 text-xs font-semibold text-on-surface-variant/60 dark:text-on-surface-variant/60 uppercase tracking-wider">
              {{ group.label }}
            </h3>
            <template v-for="item in group.items" :key="item.path">
              <NuxtLink
                :to="item.path"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-md font-medium transition-all duration-200"
                :class="[
                  'text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-dark hover:bg-surface-container-highest dark:hover:bg-surface-container-high',
                  isActive(item.path) && 'text-primary dark:text-primary-dark bg-primary/10 dark:bg-primary-dark/10 font-semibold',
                  item.disabled && 'opacity-50 cursor-not-allowed',
                ]"
                :aria-current="isActive(item.path) ? 'page' : undefined"
                :title="collapsed ? item.label : undefined"
              >
                <span class="flex-shrink-0">
                  <component :is="item.icon" class="w-5 h-5" />
                </span>
                <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
                <span v-if="item.badge && !collapsed" class="badge badge-sm" :variant="item.badge > 9 ? 'error' : 'primary'">
                  {{ item.badge > 9 ? '9+' : item.badge }}
                </span>
              </NuxtLink>
            </template>
          </div>
        </template>
      </nav>
    </div>

    <!-- User Menu / Footer -->
    <div class="p-3 border-t border-outline-variant dark:border-outline-variant">
      <div v-if="!collapsed" class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-highest dark:hover:bg-surface-container-high">
        <Avatar :name="userStore.user?.fullName || 'User'" :src="userStore.user?.avatar" size="sm" :status="userStore.user?.isActive ? 'online' : 'offline'" />
        <div class="flex-1 min-w-0">
          <p class="text-label-md font-medium text-on-surface dark:text-on-surface truncate">{{ userStore.user?.fullName || 'User' }}</p>
          <p class="text-label-sm text-on-surface-variant dark:text-on-surface-variant truncate">{{ userStore.user?.role }}</p>
        </div>
      </div>
      <div v-else class="flex justify-center">
        <Avatar :name="userStore.user?.fullName || 'User'" :src="userStore.user?.avatar" size="sm" :status="userStore.user?.isActive ? 'online' : 'offline'" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useThemeStore } from '~/stores/theme';
import Avatar from '~/components/ui/Avatar.vue';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: number;
  disabled?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const route = useRoute();
const userStore = useAuthStore();
const themeStore = useThemeStore();

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const navigationGroups = computed<NavGroup[]>(() => [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { label: 'Control Panel', path: '/panel', icon: LayoutDashboardIcon },
      { label: 'Operator Panel', path: '/operator', icon: UserIcon },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Products', path: '/inventory/products', icon: PackageIcon, badge: 5 },
      { label: 'Inventory List', path: '/inventory', icon: ListIcon },
      { label: 'Movements', path: '/inventory/movements', icon: ArrowUpDownIcon },
      { label: 'Operations', path: '/inventory/operations', icon: SettingsIcon },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Sales Management', path: '/sales', icon: ShoppingCartIcon },
      { label: 'Invoices', path: '/sales/invoices', icon: FileTextIcon },
      { label: 'Returns', path: '/sales/returns', icon: RotateCcwIcon },
      { label: 'Transfers', path: '/sales/transfers', icon: TruckIcon },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', path: '/users', icon: UsersIcon, disabled: !userStore.hasRole(['ADMIN', 'MANAGER']) },
      { label: 'Settings', path: '/settings', icon: SettingsIcon, disabled: !userStore.hasRole(['ADMIN']) },
    ],
  },
]);

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const toggleTheme = () => {
  themeStore.toggleTheme();
};
</script>

<script lang="ts">
// Icons
const HomeIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' };
const LayoutDashboardIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' };
const UserIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' };
const PackageIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' };
const ListIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>' };
const ArrowUpDownIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>' };
const SettingsIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' };
const ShoppingCartIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>' };
const FileTextIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' };
const RotateCcwIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>' };
const TruckIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7.08 6.343 6.343 7.08a4 4 0 000 5.657M15 12a3 3 0 11-6 0 3 3 0 016 0zm6-6a3 3 0 11-6 0 3 3 0 016 0zm7 9a2 2 0 01-2 2H5a2 2 0 01-2-2V7h2l1.707 1.707A1 1 0 007.414 9H17a1 1 0 00.707-.293L21 7h2v9a2 2 0 01-2 2z"></path></svg>' };
const UsersIcon = { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>' };
</script>