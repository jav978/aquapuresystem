<template>
  <div class="space-y-2.5">
    <div
      v-for="activity in activities"
      :key="activity.id"
      class="flex items-center gap-3.5 p-3 rounded-xl bg-surface-container/70 hover:bg-surface-container-high dark:bg-surface-container/50 dark:hover:bg-surface-container-high/90 transition-all duration-200 shadow-sm cursor-pointer group"
    >
      <!-- Icon -->
      <div
        :class="activityTypeClasses[activity.type]"
        class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm"
      >
        <svg v-if="activity.type === 'sale'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <svg v-else-if="activity.type === 'invoice'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <svg v-else-if="activity.type === 'payment'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="activity.type === 'return'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else-if="activity.type === 'stock'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <svg v-else class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors">{{ activity.title }}</p>
        <p class="text-xs text-on-surface-variant truncate mt-0.5">{{ activity.description }}</p>
      </div>

      <!-- Time + User -->
      <div class="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span class="text-xs font-medium text-on-surface-variant">{{ activity.timestamp }}</span>
        <span class="text-[11px] text-on-surface-variant/70">{{ activity.user }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!activities.length" class="flex flex-col items-center justify-center py-10 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl mb-2 opacity-40">inbox</span>
      <p class="text-sm">Sin actividad reciente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
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

// Distinct filled icon backgrounds
const activityTypeClasses: Record<string, string> = {
  sale:    'bg-primary/15 text-primary',
  invoice: 'bg-primary/12 text-primary',
  payment: 'bg-billing-green/15 text-billing-green',
  return:  'bg-admin-gold/15 text-admin-gold',
  stock:   'bg-error-red/15 text-error-red',
  user:    'bg-surface-container-highest text-on-surface-variant',
};
</script>