import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';

type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('dark');
  const resolvedTheme = ref<Theme>('dark');
  let initialized = false;

  const init = () => {
    if (initialized) return;
    initialized = true;

    if (import.meta.client) {
      const stored = localStorage.getItem('theme') as Theme | null;
      theme.value = stored || 'dark';
      applyTheme(theme.value);

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          theme.value = e.matches ? 'dark' : 'light';
          applyTheme(theme.value);
        }
      });
    }
  };

  const applyTheme = (t: Theme) => {
    resolvedTheme.value = t;
    theme.value = t;
    if (typeof document !== 'undefined') {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body?.classList.add('dark');
        document.body?.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body?.classList.remove('dark');
        document.body?.classList.add('light');
      }
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.style.colorScheme = t;

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', t === 'dark' ? '#0b1326' : '#f8fafc');
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = resolvedTheme.value === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', nextTheme);
    }
    applyTheme(nextTheme);
  };

  const setTheme = (t: Theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', t);
    }
    applyTheme(t);
  };

  const isDark = computed(() => resolvedTheme.value === 'dark');

  onMounted(() => {
    init();
  });

  return {
    theme: computed(() => theme.value),
    resolvedTheme: computed(() => resolvedTheme.value),
    isDark,
    toggleTheme,
    setTheme,
    init,
    applyTheme,
  };
});