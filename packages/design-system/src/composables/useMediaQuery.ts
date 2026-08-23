import { ref, onMounted, onUnmounted } from 'vue';

export function useMediaQuery(query: string) {
  const matches = ref(false);

  const updateMatches = () => {
    matches.value = window.matchMedia(query).matches;
  };

  onMounted(() => {
    updateMatches();
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', updateMatches);
    onUnmounted(() => mediaQuery.removeEventListener('change', updateMatches));
  });

  return computed(() => matches.value);
}

export const mediaQueries = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  wide: '(min-width: 1280px)',
  ultra: '(min-width: 1536px)',
  hover: '(hover: hover)',
  pointer: '(pointer: fine)',
  motion: '(prefers-reduced-motion: reduce)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
} as const;