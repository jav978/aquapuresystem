<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface DropdownItem {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

interface Props {
  modelValue: any;
  items: DropdownItem[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  label?: string;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  multiple: false,
  searchable: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
  change: [value: any];
}>();

const open = ref(false);
const searchQuery = ref('');
const dropdownRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLButtonElement>();

const filteredItems = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.items;
  const query = searchQuery.value.toLowerCase();
  return props.items.filter((item) => item.label.toLowerCase().includes(query));
});

const selectedItems = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return props.modelValue != null ? [props.modelValue] : [];
});

const selectedLabels = computed(() => {
  const values = new Set(selectedItems.value);
  return props.items.filter((item) => values.has(item.value)).map((item) => item.label);
});

const displayText = computed(() => {
  if (selectedLabels.value.length === 0) return props.placeholder || 'Select...';
  if (props.multiple) {
    return selectedLabels.value.length === 1
      ? selectedLabels.value[0]
      : `${selectedLabels.value.length} selected`;
  }
  return selectedLabels.value[0] || props.placeholder || 'Select...';
});

const toggleOpen = () => {
  if (!props.disabled) open.value = !open.value;
};

const close = () => {
  open.value = false;
};

const selectItem = (item: DropdownItem) => {
  if (item.disabled || item.divider) return;

  if (props.multiple) {
    const values = new Set(selectedItems.value);
    if (values.has(item.value)) {
      values.delete(item.value);
    } else {
      values.add(item.value);
    }
    const newValue = Array.from(values);
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', item.value);
    emit('change', item.value);
    close();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!open.value) return;
  if (event.key === 'Escape') close();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
});

watch(() => props.disabled, (disabled) => {
  if (disabled) close();
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block w-full">
    <label v-if="props.label" class="block text-label-sm font-medium text-on-surface dark:text-on-surface mb-1.5">
      {{ props.label }}
    </label>
    <button
      ref="triggerRef"
      type="button"
      @click="toggleOpen"
      :disabled="props.disabled"
      :aria-expanded="open"
      :aria-haspopup="true"
      class="w-full px-4 py-2 text-label-md bg-white dark:bg-surface-container border border-outline dark:border-outline-variant rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div class="flex items-center justify-between">
        <span :class="selectedItems.value.length > 0 ? 'text-on-surface dark:text-on-surface' : 'text-on-surface-variant dark:text-on-surface-variant'">
          {{ displayText }}
        </span>
        <svg class="w-5 h-5 text-on-surface-variant dark:text-on-surface-variant transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute top-full left-0 right-0 z-50 mt-1 bg-surface dark:bg-surface-container rounded-lg shadow-level2 border border-outline-variant dark:border-outline-variant overflow-hidden max-h-60"
      >
        <div v-if="props.searchable" class="p-2 border-b border-outline-variant dark:border-outline-variant">
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="props.placeholder || 'Search...'"
            class="w-full px-3 py-2 text-label-md bg-white dark:bg-surface-container-low border border-outline-variant dark:border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search options"
          />
        </div>
        <div class="max-h-48 overflow-y-auto">
          <div v-for="item in filteredItems" :key="item.value">
            <hr v-if="item.divider" class="my-1 border-outline-variant dark:border-outline-variant" />
            <button
              v-else
              type="button"
              @click="selectItem(item)"
              :disabled="item.disabled"
              :class="[
                'w-full px-4 py-2 text-label-md text-left transition-colors flex items-center gap-3',
                selectedItems.value.includes(item.value)
                  ? 'bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark'
                  : 'text-on-surface dark:text-on-surface hover:bg-surface-container-highest dark:hover:bg-surface-container-high',
                item.disabled && 'opacity-50 cursor-not-allowed',
                item.danger && 'text-error dark:text-error-dark',
              ]"
            >
              <svg v-if="item.icon" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path></svg>
              <span class="flex-1">{{ item.label }}</span>
              <svg v-if="props.multiple && selectedItems.value.includes(item.value)" class="w-5 h-5 text-primary dark:text-primary-dark flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="props.error" class="mt-1.5 text-label-sm text-error" role="alert">{{ props.error }}</div>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>