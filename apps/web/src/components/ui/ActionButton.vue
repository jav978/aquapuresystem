<template>
  <NuxtLink :to="to" class="block group">
    <div
      class="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200"
      :class="variantClasses"
    >
      <div
        :class="iconClasses"
        class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
      >
        <span v-if="typeof icon === 'string'" class="material-symbols-outlined text-[20px]">{{ icon }}</span>
        <component v-else :is="icon" class="w-5 h-5" />
      </div>
      <span class="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{{ label }}</span>
      <span class="ml-auto material-symbols-outlined text-base text-on-surface-variant/40 group-hover:text-primary/60 transition-colors">chevron_right</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  to: string;
  icon: any;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
});

// No borders — elevation through background color only
const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary:   'bg-primary/8 hover:bg-primary/14',
    secondary: 'bg-surface-container hover:bg-surface-container-high',
    ghost:     'bg-transparent hover:bg-surface-container',
  };
  return variants[props.variant] || variants.primary;
});

const iconClasses = computed(() => {
  const variants: Record<string, string> = {
    primary:   'bg-primary/15 text-primary',
    secondary: 'bg-surface-container-high text-on-surface',
    ghost:     'bg-surface-container text-on-surface-variant',
  };
  return variants[props.variant] || variants.primary;
});
</script>