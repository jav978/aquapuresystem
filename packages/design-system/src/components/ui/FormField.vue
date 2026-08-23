<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed } from 'vue';

const formFieldVariants = cva(
  'w-full space-y-1.5',
  {
    variants: {
      layout: {
        vertical: '',
        horizontal: 'flex items-start gap-4',
      },
    },
    defaultVariants: {
      layout: 'vertical',
    },
  }
);

interface Props extends VariantProps<typeof formFieldVariants> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  required: false,
});

const fieldId = props.id || `field-${Math.random().toString(36).substr(2, 9)}`;
const hintId = `${fieldId}-hint`;
const errorId = `${fieldId}-error`;

const classes = computed(() => formFieldVariants({ layout: props.layout }));

const labelClasses = computed(() => {
  const base = 'block text-label-sm font-medium text-on-surface dark:text-on-surface';
  const layouts: Record<string, string> = {
    vertical: 'mb-1.5',
    horizontal: 'w-32 flex-shrink-0 pt-2',
  };
  return `${base} ${layouts[props.layout]}`;
});

const inputWrapperClasses = computed(() => {
  const layouts: Record<string, string> = {
    vertical: '',
    horizontal: 'flex-1',
  };
  return layouts[props.layout];
});
</script>

<template>
  <div :class="classes">
    <label v-if="props.label" :for="fieldId" :class="labelClasses">
      {{ props.label }}
      <span v-if="props.required" class="text-error ml-1" aria-hidden="true">*</span>
    </label>
    <div :class="inputWrapperClasses">
      <slot />
      <div v-if="props.error || props.hint" class="mt-1.5 flex items-start gap-1.5" role="alert">
        <svg v-if="props.error" class="h-4 w-4 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <svg v-else-if="props.hint" class="h-4 w-4 text-on-surface-variant dark:text-on-surface-variant flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p :id="props.error ? errorId : hintId" class="text-label-sm">
          {{ props.error || props.hint }}
        </p>
      </div>
    </div>
  </div>
</template>