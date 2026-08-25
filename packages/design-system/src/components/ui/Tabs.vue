<script setup lang="ts">
import { cva } from 'class-variance-authority';
import { computed, ref, watch } from 'vue';

const tabsVariants = cva(
  'border-b border-outline-variant dark:border-outline-variant',
  {
    variants: {
      variant: {
        line: '',
        pills: '',
        enclosed: 'border rounded-lg',
      },
      alignment: {
        start: '',
        center: 'justify-center',
        end: 'justify-end',
      },
    },
    defaultVariants: {
      variant: 'line',
      alignment: 'start',
    },
  }
);

interface Tab {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  badge?: string | number;
}

interface Props {
  modelValue: string;
  tabs: Tab[];
  variant?: 'line' | 'pills' | 'enclosed';
  alignment?: 'start' | 'center' | 'end';
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'line',
  alignment: 'start',
  fullWidth: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const activeTab = ref(props.modelValue);
const tabRefs = ref<HTMLElement[]>([]);
const activeTabRef = ref<HTMLElement>();
const indicatorRef = ref<HTMLElement>();

const classes = computed(() => tabsVariants({ variant: props.variant, alignment: props.alignment }));

const tabClasses = computed(() => {
  const base = 'flex items-center justify-center gap-1.5 font-medium text-label-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    line: 'px-4 py-3 text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-dark border-b-2 border-transparent hover:border-primary/50 dark:hover:border-primary-dark/50',
    pills: 'px-4 py-2 rounded-lg text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high',
    enclosed: 'px-4 py-2 text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-high first:rounded-tl-lg last:rounded-tr-lg',
  };
  return `${base} ${variants[props.variant]}`;
});

const activeClasses = computed(() => {
  const variants: Record<string, string> = {
    line: 'text-primary dark:text-primary-dark border-primary dark:border-primary-dark',
    pills: 'bg-primary text-white dark:bg-primary-dark dark:text-white',
    enclosed: 'bg-primary text-white dark:bg-primary-dark dark:text-white',
  };
  return variants[props.variant];
});

watch(() => props.modelValue, (val) => {
  activeTab.value = val;
});

watch(activeTab, (val) => {
  emit('update:modelValue', val);
  emit('change', val);
});

const selectTab = (tab: Tab) => {
  if (tab.disabled) return;
  activeTab.value = tab.value;
};

const handleKeydown = (event: KeyboardEvent, index: number) => {
  const enabledTabs = props.tabs.filter((t) => !t.disabled);
  const currentIndex = enabledTabs.findIndex((t) => t.value === activeTab.value);
  
  let newIndex = currentIndex;
  if (event.key === 'ArrowRight') newIndex = (currentIndex + 1) % enabledTabs.length;
  if (event.key === 'ArrowLeft') newIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
  if (event.key === 'Home') newIndex = 0;
  if (event.key === 'End') newIndex = enabledTabs.length - 1;
  
  if (newIndex !== currentIndex) {
    activeTab.value = enabledTabs[newIndex].value;
    tabRefs.value[newIndex]?.focus();
  }
};
</script>

<template>
  <div :class="classes" role="tablist" :aria-label="props.variant === 'pills' ? 'Pill tabs' : 'Tabs'">
    <div class="flex" :class="[props.fullWidth ? 'w-full' : '', props.alignment]">
      <template v-for="(tab, index) in props.tabs" :key="tab.value">
        <button
          ref="tabRefs"
          role="tab"
          :id="`tab-${tab.value}`"
          :aria-selected="activeTab === tab.value"
          :aria-controls="`panel-${tab.value}`"
          :tabindex="activeTab === tab.value ? 0 : -1"
          :disabled="tab.disabled"
          :class="[
            tabClasses,
            activeTab === tab.value ? activeClasses : '',
            props.fullWidth && 'flex-1',
          ]"
          @click="selectTab(tab)"
          @keydown="handleKeydown"
        >
          <svg v-if="tab.icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path></svg>
          {{ tab.label }}
          <span v-if="tab.badge" class="badge badge-sm" :variant="tab.badge > 9 ? 'error' : 'primary'">{{ tab.badge > 9 ? '9+' : tab.badge }}</span>
        </button>
      </template>
    </div>
    <div v-if="props.variant === 'line'" class="h-px bg-primary dark:bg-primary-dark mt-[-1px] transition-all duration-200" :style="{
      width: activeTabRef?.offsetWidth ? `${activeTabRef.offsetWidth}px` : 0,
      transform: activeTabRef ? `translateX(${activeTabRef.offsetLeft}px)` : 0,
    }" ref="indicatorRef"></div>
  </div>
</template>