<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useBreakpoints } from '@vueuse/core';

const modalVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-4',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full mx-4 my-8',
      },
      fullScreen: {
        true: 'inset-0 max-w-full p-0',
      },
    },
    defaultVariants: {
      size: 'md',
      fullScreen: false,
    },
  }
);

interface Props extends VariantProps<typeof modalVariants> {
  modelValue: boolean;
  title?: string;
  description?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullScreen: false,
  closeOnOverlayClick: true,
  closeOnEscape: true,
  showCloseButton: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const { lessThan: isMobile } = useBreakpoints({ tablet: 768 });
const isOpen = ref(props.modelValue);
const overlayRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();

const classes = computed(() => modalVariants({ size: props.size, fullScreen: props.fullScreen }));

const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
    emit('update:modelValue', false);
    emit('close');
  }
};

const handleOverlayClick = (event: MouseEvent) => {
  if (props.closeOnOverlayClick && event.target === overlayRef.value) {
    close();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.closeOnEscape && event.key === 'Escape') {
    close();
  }
};

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
});

watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeydown);
  }
});

onMounted(() => {
  isOpen.value = props.modelValue;
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Transition name="modal" appear>
    <div
      v-if="isOpen"
      ref="overlayRef"
      :class="classes"
      @click="handleOverlayClick"
      role="dialog"
      :aria-modal="true"
      :aria-labelledby="props.title ? 'modal-title' : undefined"
      :aria-describedby="props.description ? 'modal-description' : undefined"
    >
      <div class="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity" aria-hidden="true"></div>
      <div
        ref="contentRef"
        class="relative w-full bg-surface dark:bg-surface-container rounded-xl shadow-level2 dark:shadow-level2 overflow-hidden transform transition-all duration-200"
        :class="props.fullScreen ? 'max-h-full flex flex-col' : ''"
      >
        <div v-if="props.title || props.showCloseButton" class="flex items-start justify-between p-4 border-b border-outline-variant dark:border-outline-variant">
          <div>
            <h2 v-if="props.title" id="modal-title" class="text-headline-md font-semibold text-on-surface dark:text-on-surface">{{ props.title }}</h2>
            <p v-if="props.description" id="modal-description" class="mt-1 text-label-md text-on-surface-variant dark:text-on-surface-variant">{{ props.description }}</p>
          </div>
          <button
            v-if="props.showCloseButton"
            @click="close"
            class="p-1 rounded-lg text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors"
            aria-label="Close modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-4" :class="props.fullScreen ? 'flex-1 overflow-auto' : ''">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}
</style>