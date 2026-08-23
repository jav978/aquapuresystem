<template>
  <Card class="p-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-label-md text-on-surface-variant dark:text-on-surface-variant">{{ title }}</p>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-headline-lg font-bold text-on-surface dark:text-on-surface">{{ prefix }}{{ formattedValue }}</span>
          <Badge v-if="change !== 0" :variant="change > 0 ? 'success' : 'error'" class="ml-2">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="change > 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7v-18'" />
            </svg>
            {{ Math.abs(change).toFixed(1) }}%
          </Badge>
        </div>
      </div>
      <div class="p-3 rounded-lg" :class="variantClasses">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from '~/components/ui/Card.vue';
import Badge from '~/components/ui/Badge.vue';

interface Props {
  title: string;
  value: number;
  change: number;
  icon: any;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  prefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  prefix: '',
});

const formattedValue = computed(() => {
  if (props.value >= 1000000) return (props.value / 1000000).toFixed(1) + 'M';
  if (props.value >= 1000) return (props.value / 1000).toFixed(1) + 'K';
  return props.value.toLocaleString();
});

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark',
    success: 'bg-success/10 dark:bg-success-dark/10 text-success dark:text-success-dark',
    warning: 'bg-warning/10 dark:bg-warning-dark/10 text-warning dark:text-warning-dark',
    info: 'bg-tertiary/10 dark:bg-tertiary-dark/10 text-tertiary dark:text-tertiary-dark',
    error: 'bg-error/10 dark:bg-error-dark/10 text-error dark:text-error-dark',
  };
  return variants[props.variant] || variants.primary;
};
</script>