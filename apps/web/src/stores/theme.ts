import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ThemeMode = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeMode>('dark');
  let isInitialized = false;

  const applyDomTheme = (theme: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // 1. Instantly freeze all CSS transitions across the entire page
    root.classList.add('theme-switching', 'disable-theme-transitions');

    // 2. Apply theme classes and attributes atomically
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    }

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#060b14' : '#f6f9fc');
    }

    // 3. Force browser to compute and render the full DOM styles in this single frame
    void root.offsetHeight;

    // 4. Safely remove the freeze lock after render pass
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching', 'disable-theme-transitions');
      });
    });
  };

  const init = () => {
    if (isInitialized) return;
    isInitialized = true;

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = (localStorage.getItem('aquapure_theme') || localStorage.getItem('theme')) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark') {
        currentTheme.value = stored;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme.value = prefersDark ? 'dark' : 'dark';
      }
      applyDomTheme(currentTheme.value);

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('aquapure_theme') && !localStorage.getItem('theme')) {
          currentTheme.value = e.matches ? 'dark' : 'light';
          applyDomTheme(currentTheme.value);
        }
      });
    }
  };

  const toggleTheme = () => {
    const next: ThemeMode = currentTheme.value === 'dark' ? 'light' : 'dark';
    currentTheme.value = next;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aquapure_theme', next);
      localStorage.setItem('theme', next);
    }
    applyDomTheme(next);
  };

  const setTheme = (theme: ThemeMode) => {
    currentTheme.value = theme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aquapure_theme', theme);
      localStorage.setItem('theme', theme);
    }
    applyDomTheme(theme);
  };

  const isDark = computed(() => currentTheme.value === 'dark');

  return {
    theme: currentTheme,
    isDark,
    init,
    toggleTheme,
    setTheme,
    applyDomTheme,
  };
});