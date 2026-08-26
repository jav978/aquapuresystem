<template>
  <div class="min-h-screen bg-background text-on-surface transition-colors duration-200">
    <!-- Desktop SideNavBar -->
    <aside class="fixed left-0 top-0 h-full w-[280px] z-40 hidden md:block bg-surface-container-lowest shadow-xl shadow-black/5 dark:shadow-black/30 transition-all duration-200">
      <SidebarNav />
    </aside>

    <!-- Mobile Drawer SideNavBar -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-50 md:hidden flex">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="sidebarOpen = false" />
      <aside class="relative z-10 w-[280px] h-full bg-surface-container-lowest shadow-2xl">
        <SidebarNav @close="sidebarOpen = false" />
      </aside>
    </div>

    <!-- Top App Bar -->
    <Header :menu-open="sidebarOpen" @menu-toggle="sidebarOpen = !sidebarOpen" />

    <!-- Main Content Canvas with generous responsive padding -->
    <main class="md:ml-[280px] pt-20 md:pt-24 min-h-screen px-4 sm:px-6 md:px-8 pb-12 flex flex-col gap-6 w-full max-w-[1600px]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SidebarNav from '~/components/layout/SidebarNav.vue';
import Header from '~/components/layout/Header.vue';

const sidebarOpen = ref(false);
</script>