<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { computed, ref, watch } from 'vue';

const inputVariants = cva(
  'w-full bg-white dark:bg-surface-container border border-outline dark:border-outline-variant text-on-surface dark:text-on-surface placeholder-on-surface-variant dark:placeholder-on-surface-variant rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'px-3 py-1.5 text-label-sm',
        md: 'px-4 py-2 text-label-md',
        lg: 'px-4 py-3 text-body-md',
      },
      state: {
        default: '',
        error: 'border-error focus:ring-error',
        success: 'border-success focus:ring-success',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

interface Props extends VariantProps<typeof inputVariants> {
  modelValue?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  autocomplete?: string;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  readonly: false,
  size: 'md',
  state: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  input: [event: InputEvent];
}>();

const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
const inputRef = ref<HTMLInputElement>();
const focused = ref(false);

const classes = computed(() => inputVariants({ size: props.size, state: props.error ? 'error' : props.state }));

const handleInput = (event: InputEvent) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('input', event);
};

const handleBlur = (event: FocusEvent) => {
  focused.value = false;
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  focused.value = true;
  emit('focus', event);
};

watch(() => props.modelValue, (newVal) => {
  if (inputRef.value && inputRef.value.value !== newVal) {
    inputRef.value.value = newVal || '';
  }
});
</script>

<template>
  <div class="w-full">
    <label v-if="props.label" :for="inputId" class="block text-label-sm font-medium text-on-surface dark:text-on-surface mb-1.5">
      {{ props.label }}
      <span v-if="props.required" class="text-error ml-1" aria-hidden="true">*</span>
    </label>
    <input
      ref="inputRef"
      :id="inputId"
      :name="props.name"
      :type="props.type"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :required="props.required"
      :readonly="props.readonly"
      :autocomplete="props.autocomplete"
      :aria-invalid="!!props.error"
      :aria-describedby="props.error ? `${inputId}-error` : props.hint ? `${inputId}-hint` : undefined"
      :class="classes"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <div v-if="props.error || props.hint" class="mt-1.5 flex items-center gap-1.5" role="alert">
      <svg v-if="props.error" class="h-4 w-4 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      <svg v-else-if="props.hint" class="h-4 w-4 text-on-surface-variant dark:text-on-surface-variant flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p :id="props.error ? `${inputId}-error` : `${inputId}-hint`" class="text-label-sm">
        {{ props.error || props.hint }}
      </p>
    </div>
  </div>
</template>