import { ref, computed, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark';

const theme = ref<Theme>('light');
const resolvedTheme = ref<Theme>('light');
let initialized = false;

export function useTheme() {
  const init = () => {
    if (initialized) return;
    initialized = true;

    if (import.meta.client) {
      const stored = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme.value = stored || (prefersDark ? 'dark' : 'light');
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
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.style.colorScheme = t;
    
    // Update meta theme-color for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', t === 'dark' ? '#191c1e' : '#f7f9fb');
    }
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
    applyTheme(theme.value);
  };

  const setTheme = (t: Theme) => {
    theme.value = t;
    localStorage.setItem('theme', t);
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
  };
}