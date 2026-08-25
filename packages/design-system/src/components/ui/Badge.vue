<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed } from 'vue';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-container-highest dark:bg-surface-container-high text-on-surface dark:text-on-surface',
        primary: 'bg-primary-container text-primary dark:bg-primary-container-dark dark:text-primary-dark',
        secondary: 'bg-secondary-container text-secondary dark:bg-secondary-container-dark dark:text-secondary-dark',
        success: 'bg-success-container text-success dark:bg-success-container-dark dark:text-success-dark',
        warning: 'bg-warning-container text-warning dark:bg-warning-container-dark dark:text-warning-dark',
        error: 'bg-error-container text-error dark:bg-error-container-dark dark:text-error-dark',
        info: 'bg-tertiary-container text-tertiary dark:bg-tertiary-container-dark dark:text-tertiary-dark',
      },
      size: {
        sm: 'px-2 py-0.5 text-label-sm',
        md: 'px-2.5 py-0.5 text-label-sm',
        lg: 'px-3 py-1 text-label-md',
      },
      dot: {
        true: 'relative pl-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dot: false,
    },
  }
);

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  dot: false,
});

const classes = computed(() => badgeVariants({
  variant: props.variant,
  size: props.size,
  dot: props.dot,
}));
</script>

<template>
  <span :class="classes" style="--badge-dot-color: var(--badge-dot-color, currentColor)">
    <span v-if="props.dot" class="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: props.dotColor || 'currentColor' }" aria-hidden="true"></span>
    <slot />
  </span>
</template>