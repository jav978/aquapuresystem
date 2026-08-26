<template>
  <Teleport to="body">
    <div
      class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      <TransitionGroup
        name="toast-slide"
        tag="div"
        class="flex flex-col-reverse gap-2.5 w-full items-end"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto w-full relative rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 p-4 flex items-start gap-3.5 border-0"
          :class="getToastBgClasses(toast.type)"
          role="alert"
        >
          <!-- Status Icon -->
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
            :class="getIconContainerClasses(toast.type)"
          >
            <span class="material-symbols-outlined text-xl font-bold">
              {{ toast.icon }}
            </span>
          </div>

          <!-- Message Content -->
          <div class="flex-1 min-w-0 pt-0.5">
            <h4 class="text-sm font-extrabold text-on-surface leading-tight tracking-tight">
              {{ toast.title }}
            </h4>
            <p v-if="toast.message" class="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            type="button"
            @click="removeToast(toast.id)"
            class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
            title="Cerrar notificación"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>

          <!-- Progress Bar -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-black/10 dark:bg-white/10"
          >
            <div
              class="h-full transition-all linear"
              :class="getProgressBarClasses(toast.type)"
              :style="{ animation: `toast-progress ${toast.duration}ms linear forwards` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type Toast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();

const getToastBgClasses = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'bg-surface-container-high/95 text-on-surface ring-1 ring-billing-green/30 dark:ring-billing-green/40 shadow-billing-green/10';
    case 'error':
      return 'bg-surface-container-high/95 text-on-surface ring-1 ring-error-red/30 dark:ring-error-red/40 shadow-error-red/10';
    case 'warning':
      return 'bg-surface-container-high/95 text-on-surface ring-1 ring-admin-gold/30 dark:ring-admin-gold/40 shadow-admin-gold/10';
    case 'info':
    default:
      return 'bg-surface-container-high/95 text-on-surface ring-1 ring-primary/30 dark:ring-primary/40 shadow-primary/10';
  }
};

const getIconContainerClasses = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'bg-billing-green/15 text-billing-green';
    case 'error':
      return 'bg-error-red/15 text-error-red';
    case 'warning':
      return 'bg-admin-gold/15 text-admin-gold';
    case 'info':
    default:
      return 'bg-primary/15 text-primary';
  }
};

const getProgressBarClasses = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'bg-billing-green';
    case 'error':
      return 'bg-error-red';
    case 'warning':
      return 'bg-admin-gold';
    case 'info':
    default:
      return 'bg-primary';
  }
};
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.92);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.85);
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
