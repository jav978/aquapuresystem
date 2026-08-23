<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  delay: 200,
  disabled: false,
});

const show = ref(false);
const tooltipRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLElement>();
let showTimeout: ReturnType<typeof setTimeout>;
let hideTimeout: ReturnType<typeof setTimeout>;

const placementClasses = computed(() => {
  const placements: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return placements[props.placement] || placements.top;
});

const arrowPlacement = computed(() => {
  const arrows: Record<string, string> = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-surface-container dark:border-t-surface-container-dark',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-surface-container dark:border-b-surface-container-dark',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-surface-container dark:border-l-surface-container-dark',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-surface-container dark:border-r-surface-container-dark',
  };
  return arrows[props.placement] || arrows.top;
});

const handleMouseEnter = () => {
  if (props.disabled) return;
  clearTimeout(hideTimeout);
  showTimeout = setTimeout(() => {
    show.value = true;
  }, props.delay);
};

const handleMouseLeave = () => {
  if (props.disabled) return;
  clearTimeout(showTimeout);
  hideTimeout = setTimeout(() => {
    show.value = false;
  }, props.delay);
};

const handleFocus = () => {
  if (props.disabled) return;
  show.value = true;
};

const handleBlur = () => {
  if (props.disabled) return;
  show.value = false;
};

onMounted(() => {
  triggerRef.value?.addEventListener('mouseenter', handleMouseEnter);
  triggerRef.value?.addEventListener('mouseleave', handleMouseLeave);
  triggerRef.value?.addEventListener('focus', handleFocus);
  triggerRef.value?.addEventListener('blur', handleBlur);
});

onUnmounted(() => {
  clearTimeout(showTimeout);
  clearTimeout(hideTimeout);
  triggerRef.value?.removeEventListener('mouseenter', handleMouseEnter);
  triggerRef.value?.removeEventListener('mouseleave', handleMouseLeave);
  triggerRef.value?.removeEventListener('focus', handleFocus);
  triggerRef.value?.removeEventListener('blur', handleBlur);
});
</script>

<template>
  <span ref="triggerRef" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @focus="handleFocus" @blur="handleBlur" class="relative inline-block">
    <slot />
    <Transition name="tooltip">
      <div
        v-if="show && !props.disabled"
        ref="tooltipRef"
        :class="[
          'absolute z-50 px-2 py-1 text-label-sm font-medium text-on-surface dark:text-on-surface bg-surface-container dark:bg-surface-container-dark rounded-md shadow-level2 whitespace-nowrap',
          placementClasses,
        ]"
        role="tooltip"
      >
        {{ props.content }}
        <div class="absolute w-0 h-0 border-2 border-transparent" :class="arrowPlacement"></div>
      </div>
    </Transition>
  </span>
</template>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>