<template>
  <NuxtLink :to="to" class="block">
    <div class="flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:bg-surface-container-highest/50 dark:hover:bg-surface-container-high/50" :class="variantClasses">
      <div :class="iconClasses" class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
        <component :is="icon" class="w-5 h-5" />
      </div>
      <span class="text-label-md font-medium text-on-surface dark:text-on-surface">{{ label }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  to: string;
  icon: any;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
});

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary/10 dark:bg-primary-dark/10 border border-primary/20 dark:border-primary-dark/20',
    secondary: 'bg-surface-container-highest dark:bg-surface-container-high border border-outline-variant dark:border-outline-variant',
    ghost: 'bg-transparent border border-outline-variant dark:border-outline-variant',
  };
  return variants[props.variant];
});

const iconClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark',
    secondary: 'bg-surface-container-high dark:bg-surface-container-high text-on-surface dark:text-on-surface',
    ghost: 'bg-transparent text-on-surface-variant dark:text-on-surface-variant',
  };
  return variants[props.variant];
};
</script>