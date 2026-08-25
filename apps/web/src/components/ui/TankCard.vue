<template>
  <div class="bg-surface-container/40 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-surface-container/70">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <p class="text-sm font-semibold text-on-surface">{{ tank.name }}</p>
        <p class="text-xs text-on-surface-variant mt-0.5">{{ formatNumber(tank.capacity) }} L capacidad</p>
      </div>
      <!-- Status badge — no border, background only -->
      <span
        class="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
        :class="{
          'bg-billing-green/10 text-billing-green': tank.status === 'normal',
          'bg-admin-gold/10 text-admin-gold': tank.status === 'warning',
          'bg-error-red/10 text-error-red animate-pulse': tank.status === 'critical',
        }"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Level Progress -->
    <div class="space-y-1.5 my-2">
      <div class="flex justify-between text-xs font-semibold">
        <span class="text-on-surface-variant">Nivel</span>
        <span :class="tank.status === 'critical' ? 'text-error-red' : tank.status === 'warning' ? 'text-admin-gold' : 'text-primary'">
          {{ tank.level }}%
        </span>
      </div>
      <!-- Progress bar track — no border -->
      <div class="w-full h-2 bg-surface-container-highest/60 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          :class="{
            'bg-primary': tank.status === 'normal',
            'bg-admin-gold': tank.status === 'warning',
            'bg-error-red': tank.status === 'critical',
          }"
          :style="{ width: `${tank.level}%` }"
        />
      </div>
    </div>

    <!-- Footer info — subtle separator, no harsh border -->
    <div class="mt-2 pt-2.5 flex items-center justify-between text-xs">
      <span class="text-on-surface-variant/70">Volumen Actual</span>
      <span class="font-bold text-on-surface">{{ formatNumber(Math.round(tank.capacity * tank.level / 100)) }} L</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    normal:   'Normal',
    warning:  'Alerta',
    critical: 'Crítico',
  };
  return labels[props.tank.status] || props.tank.status;
});
</script>