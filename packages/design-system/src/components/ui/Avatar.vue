<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed } from 'vue';

const avatarVariants = cva(
  'inline-flex items-center justify-center font-medium bg-tertiary-container text-tertiary dark:bg-tertiary-container-dark dark:text-tertiary-dark overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-label-sm',
        sm: 'w-8 h-8 text-label-md',
        md: 'w-10 h-10 text-body-md',
        lg: 'w-12 h-12 text-body-lg',
        xl: 'w-16 h-16 text-headline-md',
        '2xl': 'w-24 h-24 text-headline-lg',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  src?: string;
  alt?: string;
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
});

const classes = computed(() => avatarVariants({ size: props.size, shape: props.shape }));

const initials = computed(() => {
  if (!props.name) return '?';
  return props.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});
</script>

<template>
  <div :class="classes" :aria-label="props.name || 'Avatar'">
    <img
      v-if="props.src"
      :src="props.src"
      :alt="props.alt || props.name || 'Avatar'"
      class="w-full h-full object-cover"
      loading="lazy"
    />
    <span v-else class="w-full h-full flex items-center justify-center">
      {{ initials }}
    </span>
    <span
      v-if="props.status"
      class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface dark:border-surface-container"
      :class="{
        'bg-success': props.status === 'online',
        'bg-on-surface-variant/50': props.status === 'offline',
        'bg-warning': props.status === 'busy',
        'bg-info': props.status === 'away',
      }"
      :aria-label="props.status"
    ></span>
  </div>
</template>