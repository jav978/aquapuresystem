<template>
  <div class="min-h-screen bg-background text-on-surface relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
    <!-- Ambient Background Hydro Glow Orbs -->
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none animate-blob -z-10"></div>
    <div class="fixed bottom-10 right-1/4 w-[28rem] h-[28rem] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-blob-delay-2 -z-10"></div>

    <!-- Desktop SideNavBar (230px) -->
    <aside class="fixed left-0 top-0 h-full w-[230px] z-40 hidden lg:block bg-surface-container-lowest shadow-xl shadow-black/5 dark:shadow-black/40">
      <SidebarNav />
    </aside>

    <!-- Mobile / Tablet Drawer SideNavBar (Visible on < 1024px) -->
    <Transition name="drawer">
      <div v-if="sidebarOpen" class="fixed inset-0 z-50 lg:hidden flex">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" @click="sidebarOpen = false" />
        <aside class="relative z-10 w-[240px] h-full bg-surface-container-lowest shadow-2xl animate-in">
          <SidebarNav @close="sidebarOpen = false" />
        </aside>
      </div>
    </Transition>

    <!-- Top App Bar (h-14) -->
    <Header :menu-open="sidebarOpen" @menu-toggle="sidebarOpen = !sidebarOpen" />

    <!-- Main Content Canvas (lg:pl-[230px] prevents horizontal overflow on 14" screens) -->
    <div class="lg:pl-[230px] pt-14 min-h-screen flex flex-col w-full box-border overflow-x-hidden">
      <main class="w-full max-w-full px-3 sm:px-4 lg:px-6 py-3.5 sm:py-5 flex flex-col gap-4 sm:gap-5 flex-1 box-border overflow-x-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SidebarNav from '~/components/layout/SidebarNav.vue';
import Header from '~/components/layout/Header.vue';

const sidebarOpen = ref(false);
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>