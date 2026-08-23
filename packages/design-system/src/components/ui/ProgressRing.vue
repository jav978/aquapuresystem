<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed } from 'vue';

const progressRingVariants = cva(
  'relative inline-flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32',
      },
      strokeWidth: {
        thin: '2',
        normal: '4',
        thick: '8',
      },
    },
    defaultVariants: {
      size: 'md',
      strokeWidth: 'normal',
    },
  }
);

interface Props extends VariantProps<typeof progressRingVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  label?: string;
  trackColor?: string;
  fillColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showValue: true,
  strokeWidth: 'normal',
});

const classes = computed(() => progressRingVariants({ size: props.size, strokeWidth: props.strokeWidth }));

const radius = computed(() => {
  const sizes: Record<string, number> = { sm: 48, md: 64, lg: 96, xl: 128 };
  return sizes[props.size] / 2 - Number(props.strokeWidth);
});

const circumference = computed(() => 2 * Math.PI * radius.value);

const strokeDashoffset = computed(() => {
  const progress = Math.min(Math.max(props.value / props.max, 0), 1);
  return circumference.value * (1 - progress);
});

const percentage = computed(() => Math.round((props.value / props.max) * 100));

const trackColor = computed(() => props.trackColor || 'var(--color-tertiary-container)');
const fillColor = computed(() => props.fillColor || 'var(--color-primary)');
</script>

<template>
  <div :class="classes" role="progressbar" :aria-valuenow="props.value" :aria-valuemin="0" :aria-valuemax="props.max" :aria-label="props.label">
    <svg :width="props.size === 'sm' ? 48 : props.size === 'md' ? 64 : props.size === 'lg' ? 96 : 128" :height="props.size === 'sm' ? 48 : props.size === 'md' ? 64 : props.size === 'lg' ? 96 : 128" class="transform -rotate-90">
      <circle
        class="text-tertiary-container dark:text-tertiary-container-dark"
        :cx="props.size === 'sm' ? 24 : props.size === 'md' ? 32 : props.size === 'lg' ? 48 : 64"
        :cy="props.size === 'sm' ? 24 : props.size === 'md' ? 32 : props.size === 'lg' ? 48 : 64"
        :r="radius"
        :stroke-width="props.strokeWidth"
        :style="{ fill: 'none', stroke: trackColor }"
      />
      <circle
        class="text-primary dark:text-primary-dark transition-all duration-500 ease-out"
        :cx="props.size === 'sm' ? 24 : props.size === 'md' ? 32 : props.size === 'lg' ? 48 : 64"
        :cy="props.size === 'sm' ? 24 : props.size === 'md' ? 32 : props.size === 'lg' ? 48 : 64"
        :r="radius"
        :stroke-width="props.strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :stroke-linecap="'round'"
        :style="{ fill: 'none', stroke: fillColor, filter: 'drop-shadow(0 0 4px rgba(0,88,188,0.4))' }"
      />
    </svg>
    <div v-if="props.showValue || props.label" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span v-if="props.showValue" class="text-headline-md font-bold text-on-surface dark:text-on-surface">{{ percentage }}%</span>
      <span v-if="props.label" class="text-label-sm text-on-surface-variant dark:text-on-surface-variant">{{ props.label }}</span>
    </div>
  </div>
</template>