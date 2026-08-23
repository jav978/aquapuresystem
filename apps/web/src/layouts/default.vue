<template>
  <div class="flex h-screen bg-background dark:bg-background-dark">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out bg-surface dark:bg-surface-container border-r border-outline-variant dark:border-outline-variant"
      :class="{
        '-translate-x-full': isMobile && !sidebarOpen,
        'translate-x-0': !isMobile || sidebarOpen,
      }"
    >
      <SidebarNav @toggle="sidebarCollapsed = !sidebarCollapsed" :collapsed="sidebarCollapsed" />
    </aside>

    <!-- Mobile Overlay -->
    <div
      v-if="isMobile && sidebarOpen"
      class="fixed inset-0 z-30 bg-black/50"
      @click="sidebarOpen = false"
    />

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col overflow-hidden"
      :class="{
        'ml-0': isMobile,
        'ml-16': !isMobile && sidebarCollapsed,
        'ml-72': !isMobile && !sidebarCollapsed,
      }"
    >
      <Header :menu-open="sidebarOpen" @menu-toggle="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 overflow-auto">
        <ResponsiveContainer>
          <slot />
        </ResponsiveContainer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@aquasystem/design-system';
import { useUiStore } from '~/stores/ui';
import SidebarNav from '~/components/layout/SidebarNav.vue';
import Header from '~/components/layout/Header.vue';
import ResponsiveContainer from '~/components/ui/ResponsiveContainer.vue';

const { isMobile, isTablet } = useBreakpoints();
const uiStore = useUiStore();

const sidebarOpen = ref(false);
const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>