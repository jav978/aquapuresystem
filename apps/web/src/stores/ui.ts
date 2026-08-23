import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false);
  const sidebarOpen = ref(false);
  const fullscreenLoading = ref(false);
  const pageLoading = ref(false);

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed;
  };

  const setSidebarOpen = (open: boolean) => {
    sidebarOpen.value = open;
  };

  const setFullscreenLoading = (loading: boolean) => {
    fullscreenLoading.value = loading;
  };

  const setPageLoading = (loading: boolean) => {
    pageLoading.value = loading;
  };

  return {
    sidebarCollapsed: computed(() => sidebarCollapsed.value),
    sidebarOpen: computed(() => sidebarOpen.value),
    fullscreenLoading: computed(() => fullscreenLoading.value),
    pageLoading: computed(() => pageLoading.value),
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarOpen,
    setFullscreenLoading,
    setPageLoading,
  };
});