<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

const toastVariants = cva(
  'flex items-start gap-3 px-4 py-3 rounded-lg shadow-level2 border border-outline-variant dark:border-outline-variant animate-slide-in-right',
  {
    variants: {
      variant: {
        default: 'bg-surface dark:bg-surface-container text-on-surface dark:text-on-surface',
        success: 'bg-success-container border-success text-success dark:bg-success-container-dark dark:border-success dark:text-success',
        warning: 'bg-warning-container border-warning text-warning dark:bg-warning-container-dark dark:border-warning dark:text-warning',
        error: 'bg-error-container border-error text-error dark:bg-error-container-dark dark:border-error dark:text-error',
        info: 'bg-tertiary-container border-tertiary text-tertiary dark:bg-tertiary-container-dark dark:border-tertiary dark:text-tertiary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface Toast {
  id: string;
  type: 'default' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Props {
  modelValue: Toast[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5,
});

const emit = defineEmits<{
  'update:modelValue': [value: Toast[]];
  dismiss: [id: string];
}>();

const positionClasses = computed(() => {
  const positions: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };
  return `fixed z-50 flex flex-col gap-2 ${positions[props.position] || positions['top-right']} ${props.position.includes('center') ? 'w-auto' : 'max-w-sm'}`;
});

const classes = computed(() => toastVariants({ variant: 'default' }));

const removeToast = (id: string) => {
  emit('update:modelValue', props.modelValue.filter((t) => t.id !== id));
  emit('dismiss', id);
};

const handleAction = (toast: Toast) => {
  toast.action?.onClick();
  removeToast(toast.id);
};
</script>

<template>
  <div :class="positionClasses" role="region" aria-label="Notifications" aria-live="polite">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
      <div
        v-for="toast in props.modelValue.slice(0, props.maxToasts)"
        :key="toast.id"
        :class="[
          'flex items-start gap-3 px-4 py-3 rounded-lg shadow-level2 border animate-slide-in-right',
          {
            'bg-success-container border-success text-success dark:bg-success-container-dark dark:border-success dark:text-success': toast.type === 'success',
            'bg-warning-container border-warning text-warning dark:bg-warning-container-dark dark:border-warning dark:text-warning': toast.type === 'warning',
            'bg-error-container border-error text-error dark:bg-error-container-dark dark:border-error dark:text-error': toast.type === 'error',
            'bg-tertiary-container border-tertiary text-tertiary dark:bg-tertiary-container-dark dark:border-tertiary dark:text-tertiary': toast.type === 'info',
            'bg-surface dark:bg-surface-container text-on-surface dark:text-on-surface': toast.type === 'default',
          }
        ]"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-label-md">{{ toast.title }}</span>
            <span v-if="toast.message" class="text-label-sm text-on-surface-variant dark:text-on-surface-variant">{{ toast.message }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            v-if="toast.action"
            @click="handleAction(toast)"
            class="px-2 py-1 text-label-sm font-medium rounded-md hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
          >
            {{ toast.action.label }}
          </button>
          <button
            @click="removeToast(toast.id)"
            class="p-1 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>