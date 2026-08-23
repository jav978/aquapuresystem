<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  as?: 'div' | 'section' | 'main' | 'article';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  class: '',
});

const classes = computed(() => [
  'w-full',
  'px-4 sm:px-6 lg:px-8 xl:px-12',
  'mx-auto',
  'max-w-screen-2xl',
  props.class,
]);
</script>

<template>
  <component
    :is="props.as"
    :class="classes"
  >
    <slot />
  </component>
</template>