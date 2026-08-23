<template>
  <Card class="p-4">
    <div class="flex items-start justify-between mb-3">
      <div>
        <p class="text-label-sm font-medium text-on-surface-variant dark:text-on-surface-variant">{{ tank.name }}</p>
        <p class="text-label-sm text-on-surface-variant/70 dark:text-on-surface-variant/70">{{ formatNumber(tank.capacity) }} L capacity</p>
      </div>
      <Badge :variant="statusVariant" :class="statusDot">{{ tank.status }}</Badge>
    </div>

    <div class="relative h-24">
      <ProgressRing
        :value="tank.level"
        :max="100"
        size="md"
        :strokeWidth="'normal'"
        :showValue="true"
        :label="tank.level + '%'"
        :trackColor="trackColor"
        :fillColor="fillColor"
      />
    </div>

    <div class="mt-3 pt-3 border-t border-outline-variant dark:border-outline-variant flex items-center justify-between text-label-sm">
      <span class="text-on-surface-variant dark:text-on-surface-variant">Current</span>
      <span class="font-medium text-on-surface dark:text-on-surface">{{ formatNumber(Math.round(tank.capacity * tank.level / 100)) }} L</span>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from '~/components/ui/Card.vue';
import Badge from '~/components/ui/Badge.vue';
import ProgressRing from '~/components/ui/ProgressRing.vue';
import { formatNumber } from '@aquasystem/design-system';

interface Props {
  tank: {
    id: string;
    name: string;
    level: number;
    capacity: number;
    status: 'normal' | 'warning' | 'critical';
  };
}

const props = defineProps<Props>();

const statusVariant = computed(() => {
  switch (props.tank.status) {
    case 'critical': return 'error';
    case 'warning': return 'warning';
    default: return 'success';
  }
});

const statusDot = computed(() => {
  return props.tank.status === 'critical' ? 'animate-pulse' : '';
});

const trackColor = computed(() => {
  switch (props.tank.status) {
    case 'critical': return '#ba1a1a';
    case 'warning': return '#8c5a00';
    default: return 'var(--color-tertiary-container)';
  }
});

const fillColor = computed(() => {
  switch (props.tank.status) {
    case 'critical': return '#ba1a1a';
    case 'warning': return '#8c5a00';
    default: return 'var(--color-primary)';
  }
});
</script>