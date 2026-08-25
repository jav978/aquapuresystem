<template>
  <div class="card-elevated p-5 flex flex-col justify-between relative overflow-hidden">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-on-surface-variant">{{ title }}</p>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">{{ prefix }}{{ formattedValue }}</span>
          <span
            v-if="change !== 0"
            class="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
            :class="change > 0 ? 'bg-billing-green/10 text-billing-green' : 'bg-error-red/10 text-error-red'"
          >
            <span class="material-symbols-outlined text-xs mr-0.5">{{ change > 0 ? 'trending_up' : 'trending_down' }}</span>
            {{ Math.abs(change).toFixed(1) }}%
          </span>
        </div>
      </div>
      <div class="p-3 rounded-lg flex items-center justify-center" :class="variantClasses">
        <span v-if="typeof icon === 'string'" class="material-symbols-outlined text-2xl">{{ icon }}</span>
        <component v-else :is="icon" class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
    primary: 'bg-primary/10 text-primary',
    success: 'bg-billing-green/10 text-billing-green',
    warning: 'bg-admin-gold/10 text-admin-gold',
    info: 'bg-primary-container/20 text-primary',
    error: 'bg-error-red/10 text-error-red',
  };
  return variants[props.variant] || variants.primary;
});
</script>