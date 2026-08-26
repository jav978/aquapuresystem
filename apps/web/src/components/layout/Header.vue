<template>
  <header class="bg-surface-container/80 dark:bg-surface-container/80 backdrop-blur-xl fixed top-0 right-0 h-16 left-0 md:left-[280px] z-30 flex justify-between items-center px-4 md:px-8 w-full md:w-[calc(100%-280px)] shadow-md shadow-black/5 dark:shadow-black/25 transition-all duration-200">
    <!-- Mobile Menu Toggle Button -->
    <button
      @click="$emit('menu-toggle')"
      class="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors mr-2 cursor-pointer"
      aria-label="Toggle navigation menu"
    >
      <span class="material-symbols-outlined">{{ menuOpen ? 'close' : 'menu' }}</span>
    </button>

    <!-- Global Search Bar / Command Palette Trigger -->
    <div class="flex-1 max-w-md">
      <div
        @click="showSearchModal = true"
        class="relative flex items-center bg-surface-container/60 hover:bg-surface-container-high rounded-xl px-4 py-2 transition-all cursor-pointer group shadow-sm"
      >
        <span class="material-symbols-outlined text-on-surface-variant mr-3 text-lg group-hover:text-primary transition-colors">search</span>
        <span class="text-on-surface-variant/70 text-sm flex-1 truncate select-none">
          Buscar productos, clientes, facturas...
        </span>
        <kbd class="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-surface-container-highest/60 text-on-surface-variant rounded shadow-inner">
          Ctrl K
        </kbd>
      </div>
    </div>

    <!-- Trailing Actions & Profile -->
    <div class="flex items-center gap-2 sm:gap-3 ml-4">
      <!-- Dark/Light Theme Toggle -->
      <button
        @click="toggleTheme"
        class="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-xl relative cursor-pointer active:scale-95"
        :title="themeStore.isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
        aria-label="Toggle theme mode"
      >
        <span class="material-symbols-outlined text-xl">{{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}</span>
      </button>

      <!-- Notifications Dropdown -->
      <div class="relative notifications-menu-container">
        <button
          @click="toggleNotifications"
          class="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-xl relative cursor-pointer active:scale-95"
          title="Notificaciones del Sistema"
          aria-label="Notificaciones"
        >
          <span class="material-symbols-outlined text-xl">notifications</span>
          <span v-if="unreadNotificationsCount > 0" class="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error-red ring-2 ring-surface-container animate-pulse"></span>
        </button>

        <!-- Notifications Popover Panel -->
        <Transition name="dropdown">
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-3 w-80 sm:w-96 glass-card z-50 overflow-hidden animate-in"
          >
            <div class="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-surface-container-highest/40">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-on-surface">Notificaciones</span>
                <span v-if="unreadNotificationsCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
                  {{ unreadNotificationsCount }} nuevas
                </span>
              </div>
              <button
                v-if="unreadNotificationsCount > 0"
                @click="markAllAsRead"
                class="text-xs text-primary hover:underline cursor-pointer font-medium"
              >
                Marcar leídas
              </button>
            </div>

            <div class="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
              <div
                v-for="item in notifications"
                :key="item.id"
                class="p-3.5 hover:bg-surface-container-high/60 transition-colors flex gap-3 cursor-pointer active:scale-[0.99]"
                :class="{ 'bg-primary/10 font-medium': !item.read }"
                @click="handleNotificationClick(item)"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  :class="[
                    item.type === 'alert' ? 'bg-error-red/10 text-error-red ' :
                    item.type === 'sale' ? 'bg-billing-green/10 text-billing-green ' :
                    'bg-primary/10 text-primary '
                  ]"
                >
                  <span class="material-symbols-outlined text-base">{{ item.icon }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-on-surface leading-snug">{{ item.title }}</p>
                  <p class="text-[11px] text-on-surface-variant mt-0.5 leading-tight">{{ item.message }}</p>
                  <span class="text-[10px] text-on-surface-variant/60 mt-1 block">{{ item.time }}</span>
                </div>
              </div>
            </div>

            <div class="p-2.5 text-center border-t border-black/5 dark:border-white/5 bg-surface-container-lowest">
              <NuxtLink
                to="/inventory"
                @click="showNotifications = false"
                class="text-xs font-semibold text-primary hover:underline"
              >
                Ver todas las alertas de inventario
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Help Button -->
      <button
        @click="showHelpModal = true"
        class="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-xl hidden sm:flex items-center justify-center cursor-pointer active:scale-95"
        title="Centro de Ayuda y Atajos"
        aria-label="Ayuda"
      >
        <span class="material-symbols-outlined text-xl">help_outline</span>
      </button>

      <!-- Profile Avatar & Role Dropdown -->
      <div class="relative user-menu-container">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-3 pl-2 sm:pl-3 hover:opacity-95 transition-opacity cursor-pointer p-1.5 rounded-xl hover:bg-surface-container-high/60"
          aria-label="Menú de usuario"
        >
          <div class="h-9 w-9 rounded-full overflow-hidden bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
            {{ userInitial }}
          </div>
          <div class="text-left hidden lg:block">
            <p class="text-xs font-bold text-on-surface leading-tight">{{ authStore.user?.fullName || 'Admin Principal' }}</p>
            <p class="text-[11px] text-admin-gold font-medium leading-tight">{{ authStore.user?.role === 'ADMIN' ? 'Super Administrador' : (authStore.user?.role || 'Operaciones') }}</p>
          </div>
        </button>

        <!-- User Dropdown Menu -->
        <Transition name="dropdown">
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-3 w-64 glass-card py-2 z-50 animate-in shadow-2xl border-0"
          >
            <!-- User Info Header -->
            <div class="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
                {{ userInitial }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-on-surface truncate">{{ authStore.user?.fullName || 'Admin Principal' }}</p>
                <p class="text-[11px] text-on-surface-variant truncate font-mono mt-0.5">{{ authStore.user?.email || 'admin@aquasystem.com' }}</p>
                <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">
                  {{ authStore.user?.role === 'ADMIN' ? 'Super Administrador' : (authStore.user?.role || 'Operaciones') }}
                </span>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="py-1.5 space-y-0.5">
              <NuxtLink
                to="/users"
                class="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high/80 transition-colors"
                @click="showUserMenu = false"
              >
                <span class="material-symbols-outlined text-lg text-primary">group</span>
                Gestión de Usuarios
              </NuxtLink>

              <NuxtLink
                to="/settings"
                class="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high/80 transition-colors"
                @click="showUserMenu = false"
              >
                <span class="material-symbols-outlined text-lg text-primary">settings</span>
                Configuración del Sistema
              </NuxtLink>

              <button
                type="button"
                @click="toggleTheme"
                class="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high/80 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-lg text-primary">{{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}</span>
                  <span>{{ themeStore.isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro' }}</span>
                </div>
                <span class="text-[10px] font-mono uppercase text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container">
                  {{ themeStore.isDark ? 'DARK' : 'LIGHT' }}
                </span>
              </button>
            </div>

            <div class="pt-1 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                @click="logout"
                class="flex items-center gap-3 w-full text-left px-4 py-2.5 text-xs font-bold text-error-red hover:bg-error-red/10 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-lg">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>

  <!-- Teleported Modals to Body for Full-Screen Unconstrained Centering -->
  <Teleport to="body">
    <!-- Global Command Palette / Search Modal -->
    <div v-if="showSearchModal" class="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="showSearchModal = false"></div>
      <div class="relative glass-card w-full max-w-2xl z-10 overflow-hidden animate-in">
        <div class="flex items-center px-4 py-3.5 border-b border-black/5 dark:border-white/5 bg-surface-container-highest/30">
          <span class="material-symbols-outlined text-primary text-xl mr-3">search</span>
          <input
            v-model="searchQuery"
            type="text"
            autofocus
            placeholder="Escribe para buscar (Ej: Botellón, INV-001, Cliente...)"
            class="bg-transparent border-none outline-none text-on-surface text-base w-full focus:ring-0 placeholder:text-on-surface-variant/60"
            @keydown.esc="showSearchModal = false"
          />
          <button @click="showSearchModal = false" class="p-1 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer">
            <kbd class="px-2 py-0.5 text-xs bg-surface-container-highest/60 text-on-surface-variant rounded shadow-inner">ESC</kbd>
          </button>
        </div>

        <div class="p-4 max-h-96 overflow-y-auto space-y-4">
          <!-- Quick Page Links -->
          <div>
            <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-2">Páginas y Módulos</span>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <button
                v-for="page in quickPages"
                :key="page.path"
                @click="navigateSearch(page.path)"
                class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-left cursor-pointer"
              >
                <span class="material-symbols-outlined text-primary text-lg">{{ page.icon }}</span>
                <span class="text-xs font-semibold text-on-surface">{{ page.name }}</span>
              </button>
            </div>
          </div>

          <!-- Filtered Items List -->
          <div v-if="filteredResults.length > 0">
            <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-2">Resultados Coincidentes</span>
            <div class="mt-2 space-y-1">
              <div
                v-for="item in filteredResults"
                :key="item.id"
                @click="navigateSearch(item.link)"
                class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-lg text-primary">{{ item.icon }}</span>
                  <div>
                    <p class="text-xs font-bold text-on-surface">{{ item.title }}</p>
                    <p class="text-[11px] text-on-surface-variant">{{ item.subtitle }}</p>
                  </div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-mono">
                  {{ item.category }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Modal (Properly Centered in Viewport) -->
    <div v-if="showHelpModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="showHelpModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in my-auto">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">help</span>
            </div>
            <div>
              <h4 class="text-lg font-bold text-on-surface">Centro de Ayuda</h4>
              <p class="text-xs text-on-surface-variant">AquaPure Pro v1.0.0</p>
            </div>
          </div>
          <button @click="showHelpModal = false" class="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <h5 class="text-xs font-bold text-primary uppercase tracking-wider mb-2">Atajos de Teclado</h5>
            <div class="space-y-2 bg-surface-container/50 rounded-xl p-3 text-xs">
              <div class="flex justify-between items-center py-1">
                <span class="text-on-surface font-medium">Buscador Global</span>
                <kbd class="px-2 py-0.5 bg-surface-container-highest rounded font-mono text-primary font-bold shadow-inner">Ctrl + K</kbd>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-on-surface font-medium">Nuxt DevTools</span>
                <kbd class="px-2 py-0.5 bg-surface-container-highest rounded font-mono text-primary font-bold shadow-inner">Shift + Alt + D</kbd>
              </div>
            </div>
          </div>

          <div>
            <h5 class="text-xs font-bold text-primary uppercase tracking-wider mb-2">Contacto de Soporte Técnico</h5>
            <div class="bg-surface-container/50 rounded-xl p-3.5 text-xs space-y-1.5">
              <p class="text-sm text-on-surface font-bold">Ing. José Vásquez</p>
              <p class="text-xs text-primary flex items-center gap-1.5 font-mono">
                <span class="material-symbols-outlined text-sm">mail</span>
                jav1978@gmail.com
              </p>
              <p class="text-[11px] text-on-surface-variant pt-1">Soporte y Mantenimiento del Sistema AquaPure Pro</p>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-black/5 dark:border-white/5 text-right">
          <button
            @click="showHelpModal = false"
            class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover cursor-pointer active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useThemeStore } from '~/stores/theme';

const props = defineProps<{
  menuOpen: boolean;
}>();

const emit = defineEmits<{
  'menu-toggle': [];
}>();

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const showUserMenu = ref(false);
const showNotifications = ref(false);
const showHelpModal = ref(false);
const showSearchModal = ref(false);
const searchQuery = ref('');

const userInitial = computed(() => {
  if (authStore.user?.firstName) {
    return authStore.user.firstName.charAt(0).toUpperCase();
  }
  return 'A';
});

// Notifications state with navigation links
const notifications = ref([
  { id: 1, type: 'alert', icon: 'warning', title: 'Stock Bajo: Botellón 20L', message: 'Inventario por debajo del umbral mínimo de 20 unidades.', time: 'Hace 15m', read: false, link: '/inventory' },
  { id: 2, type: 'sale', icon: 'receipt', title: 'Nueva Factura Emitida', message: 'Factura INV-2026-004 generada para Clínica San Lucas ($150.00).', time: 'Hace 1h', read: false, link: '/sales/invoices' },
  { id: 3, type: 'info', icon: 'water_drop', title: 'Ciclo de Purificación TK-01', message: 'Filtrado y desinfección completados con éxito.', time: 'Hace 3h', read: false, link: '/dashboard' },
]);

const unreadNotificationsCount = computed(() => notifications.value.filter(n => !n.read).length);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false;
};

const handleNotificationClick = (item: any) => {
  item.read = true;
  showNotifications.value = false;
  if (item.link) {
    router.push(item.link);
  }
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};

// Global search state & pages
const quickPages = [
  { name: 'Dashboard General', path: '/dashboard', icon: 'dashboard' },
  { name: 'Ventas y Pedidos', path: '/sales', icon: 'point_of_sale' },
  { name: 'Facturación Fiscal', path: '/sales/invoices', icon: 'receipt_long' },
  { name: 'Control de Inventario', path: '/inventory', icon: 'inventory_2' },
  { name: 'Configuración', path: '/settings', icon: 'settings' },
];

const searchableData = [
  { id: '1', title: '500ml Water Bottle (WB-001)', subtitle: 'Stock: 450 unid. | $1.50', category: 'Producto', icon: 'water_bottle', link: '/inventory' },
  { id: '2', title: '5L Water Jug (WJ-001)', subtitle: 'Stock: 120 unid. | $8.00', category: 'Producto', icon: 'water', link: '/inventory' },
  { id: '3', title: 'Carbon Filter Cartridge (FL-001)', subtitle: 'Stock: 35 unid. | $12.00', category: 'Producto', icon: 'filter_alt', link: '/inventory' },
  { id: '4', title: 'Restaurante El Puerto', subtitle: 'Cliente Frecuente | Tax ID: TAX-001', category: 'Cliente', icon: 'person', link: '/sales' },
  { id: '5', title: 'Oficinas Central Tech', subtitle: 'Cliente Corporativo | Tax ID: TAX-002', category: 'Cliente', icon: 'business', link: '/sales' },
  { id: '6', title: 'Factura FAC-00102', subtitle: '$45.00 | Restaurante El Puerto | Pagada', category: 'Factura', icon: 'receipt', link: '/sales/invoices' },
];

const filteredResults = computed(() => {
  if (!searchQuery.value.trim()) return searchableData;
  const q = searchQuery.value.toLowerCase();
  return searchableData.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.subtitle.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  );
});

const navigateSearch = (path: string) => {
  showSearchModal.value = false;
  searchQuery.value = '';
  router.push(path);
};

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const logout = async () => {
  showUserMenu.value = false;
  await authStore.logout();
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.user-menu-container')) {
    showUserMenu.value = false;
  }
  if (!target.closest('.notifications-menu-container')) {
    showNotifications.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    showSearchModal.value = !showSearchModal.value;
  }
};

onMounted(() => {
  themeStore.init();
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside);
    window.removeEventListener('keydown', handleKeyDown);
  }
});
</script>