<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed } from 'vue';

const cardVariants = cva(
  'bg-surface dark:bg-surface-container rounded-xl transition-shadow duration-200',
  {
    variants: {
      variant: {
        default: 'border border-outline-variant dark:border-outline-variant',
        elevated: 'shadow-level2 dark:shadow-level2 border-none',
        outlined: 'border-2 border-outline dark:border-outline-variant',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'hover:shadow-level2 dark:hover:shadow-level2 cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
);

interface Props {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  as?: 'div' | 'article' | 'section';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
});

const classes = computed(() => cardVariants({
  variant: props.variant,
  padding: props.padding,
  hoverable: props.hoverable,
}));
</script>

<template>
  <component :is="props.as || 'div'" :class="classes">
    <slot />
  </component>
</template>