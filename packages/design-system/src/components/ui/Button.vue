<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { computed } from 'vue';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary dark:bg-primary-dark dark:hover:bg-primary-dark/90 dark:focus:ring-primary-dark',
        secondary: 'bg-transparent border border-primary text-primary hover:bg-primary/10 focus:ring-primary dark:border-primary-dark dark:text-primary-dark dark:hover:bg-primary-dark/10',
        ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary dark:text-primary-dark dark:hover:bg-primary-dark/10',
        danger: 'bg-error text-white hover:bg-error/90 focus:ring-error dark:bg-error-dark dark:hover:bg-error-dark/90',
        success: 'bg-success text-white hover:bg-success/90 focus:ring-success dark:bg-success-dark dark:hover:bg-success-dark/90',
        warning: 'bg-warning text-white hover:bg-warning/90 focus:ring-warning dark:bg-warning-dark dark:hover:bg-warning-dark/90',
      },
      size: {
        sm: 'px-3 py-1.5 text-label-sm rounded-md gap-1.5',
        md: 'px-4 py-2 text-label-md rounded-lg gap-2',
        lg: 'px-6 py-3 text-body-md rounded-xl gap-2.5',
        xl: 'px-8 py-4 text-body-lg rounded-xl gap-3',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'relative cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

interface Props extends VariantProps<typeof buttonVariants> {
  as?: 'button' | 'a' | 'router-link';
  to?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  loading: false,
  disabled: false,
  type: 'button',
});

const classes = computed(() => buttonVariants({
  variant: props.variant,
  size: props.size,
  fullWidth: props.fullWidth,
  loading: props.loading,
}));

const isRouterLink = computed(() => props.as === 'router-link' && props.to);
const isAnchor = computed(() => props.as === 'a' && props.to);
</script>

<template>
  <component
    :is="props.as || 'button'"
    :to="isRouterLink ? props.to : undefined"
    :href="isAnchor ? props.to : undefined"
    :class="classes"
    :disabled="props.disabled || props.loading"
    :type="isRouterLink || isAnchor ? undefined : props.type"
    :aria-busy="props.loading"
  >
    <span v-if="props.loading" class="flex items-center justify-center" aria-hidden="true">
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot />
  </component>
</template>