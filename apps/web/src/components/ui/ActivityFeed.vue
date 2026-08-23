<template>
  <div class="space-y-4">
    <div v-for="activity in activities" :key="activity.id" class="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-highest/50 dark:hover:bg-surface-container-high/50 transition-colors">
      <div :class="activityTypeClasses[activity.type]" class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
        <component :is="activityTypeIcons[activity.type]" class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-label-md font-medium text-on-surface dark:text-on-surface">{{ activity.title }}</p>
        <p class="text-label-sm text-on-surface-variant dark:text-on-surface-variant truncate">{{ activity.description }}</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span class="text-label-sm text-on-surface-variant dark:text-on-surface-variant">{{ activity.timestamp }}</span>
        <span class="text-label-sm text-on-surface-variant/70 dark:text-on-surface-variant/70">{{ activity.user }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  activities: Array<{
    id: string;
    type: 'sale' | 'invoice' | 'payment' | 'return' | 'stock' | 'user';
    title: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

const props = defineProps<Props>();

const activityTypeClasses = {
  sale: 'bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark',
  invoice: 'bg-info/10 dark:bg-info-dark/10 text-info dark:text-info-dark',
  payment: 'bg-success/10 dark:bg-success-dark/10 text-success dark:text-success-dark',
  return: 'bg-warning/10 dark:bg-warning-dark/10 text-warning dark:text-warning-dark',
  stock: 'bg-error/10 dark:bg-error-dark/10 text-error dark:text-error-dark',
  user: 'bg-tertiary/10 dark:bg-tertiary-dark/10 text-tertiary dark:text-tertiary-dark',
};

const activityTypeIcons = {
  sale: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>' },
  invoice: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
  payment: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' },
  return: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>' },
  stock: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
  user: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' },
};
</script>