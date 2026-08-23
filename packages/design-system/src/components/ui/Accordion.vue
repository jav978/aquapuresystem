<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed, ref } from 'vue';

const accordionVariants = cva(
  'border border-outline-variant dark:border-outline-variant rounded-lg overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        flush: 'border-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const itemVariants = cva(
  'border-b border-outline-variant dark:border-outline-variant last:border-0',
  {
    variants: {
      variant: {
        default: '',
        flush: 'border-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface AccordionItem {
  value: string;
  title: string;
  content: string;
  disabled?: boolean;
  icon?: string;
}

interface Props {
  modelValue: string | string[];
  items: AccordionItem[];
  multiple?: boolean;
  variant?: 'default' | 'flush';
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  variant: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  change: [value: string | string[]];
}>();

const openItems = ref<Array<string>>(
  props.multiple
    ? (Array.isArray(props.modelValue) ? props.modelValue : [])
    : props.modelValue
      ? [props.modelValue]
      : []
);

const classes = computed(() => accordionVariants({ variant: props.variant }));
const itemClasses = computed(() => itemVariants({ variant: props.variant }));

const isOpen = (value: string) => openItems.value.includes(value);

const toggle = (value: string) => {
  const item = props.items.find((i) => i.value === value);
  if (item?.disabled) return;

  if (props.multiple) {
    const index = openItems.value.indexOf(value);
    if (index > -1) {
      openItems.value.splice(index, 1);
    } else {
      openItems.value.push(value);
    }
    emit('update:modelValue', [...openItems.value]);
  } else {
    if (openItems.value[0] === value) {
      openItems.value = [];
      emit('update:modelValue', '');
    } else {
      openItems.value = [value];
      emit('update:modelValue', value);
    }
  }
  emit('change', props.multiple ? [...openItems.value] : openItems.value[0] || '');
};
</script>

<template>
  <div :class="classes" role="region" :aria-label="props.variant === 'flush' ? 'Flush accordion' : 'Accordion'">
    <div v-for="item in props.items" :key="item.value" :class="itemClasses" class="bg-surface dark:bg-surface-container">
      <button
        type="button"
        @click="toggle(item.value)"
        :disabled="item.disabled"
        :aria-expanded="isOpen(item.value)"
        :aria-controls=`panel-${item.value}`
        class="w-full px-4 py-3 flex items-center justify-between text-left font-medium text-on-surface dark:text-on-surface hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div class="flex items-center gap-3">
          <svg v-if="item.icon" class="w-5 h-5 text-on-surface-variant dark:text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path></svg>
          <span>{{ item.title }}</span>
        </div>
        <svg class="w-5 h-5 text-on-surface-variant dark:text-on-surface-variant transition-transform duration-200" :class="{ 'rotate-180': isOpen(item.value) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        :id="`panel-${item.value}`"
        role="region"
        :aria-labelledby="`heading-${item.value}`"
        class="overflow-hidden transition-all duration-300 ease-out"
        :class="isOpen(item.value) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'"
      >
        <div class="px-4 pb-4 text-on-surface-variant dark:text-on-surface-variant">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>