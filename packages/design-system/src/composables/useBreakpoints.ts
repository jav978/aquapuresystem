import { ref, computed, onMounted, onUnmounted } from 'vue';

export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultra: 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function useBreakpoints() {
  const current = ref<Breakpoint>('desktop');

  const updateBreakpoint = () => {
    const width = window.innerWidth;
    if (width >= breakpoints.ultra) current.value = 'ultra';
    else if (width >= breakpoints.wide) current.value = 'wide';
    else if (width >= breakpoints.desktop) current.value = 'desktop';
    else if (width >= breakpoints.tablet) current.value = 'tablet';
    else current.value = 'mobile';
  };

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint);
  });

  const isMobile = computed(() => current.value === 'mobile');
  const isTablet = computed(() => current.value === 'tablet');
  const isDesktop = computed(() => current.value !== 'mobile' && current.value !== 'tablet');
  const isWide = computed(() => current.value === 'wide' || current.value === 'ultra');

  const greaterOrEqual = (bp: Breakpoint) => computed(() => {
    const currentIndex = Object.keys(breakpoints).indexOf(current.value);
    const targetIndex = Object.keys(breakpoints).indexOf(bp);
    return currentIndex >= targetIndex;
  });

  const lessThan = (bp: Breakpoint) => computed(() => {
    const currentIndex = Object.keys(breakpoints).indexOf(current.value);
    const targetIndex = Object.keys(breakpoints).indexOf(bp);
    return currentIndex < targetIndex;
  });

  return {
    current: computed(() => current.value),
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    greaterOrEqual,
    lessThan,
    breakpoints,
  };
}