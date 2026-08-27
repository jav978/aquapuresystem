<template>
  <!-- Embedded Mode (used directly inside custom dashboard container) -->
  <div v-if="embedded" class="relative flex justify-center items-center py-2 w-full">
    <!-- 3D Liquid Tank Visualization -->
    <div class="relative w-36 sm:w-44 h-48 sm:h-52 rounded-3xl overflow-hidden p-1 flex flex-col justify-end items-center bg-gradient-to-b from-surface-container-highest/40 to-surface-container-lowest/80 shadow-inner">
      <!-- Metallic Top Rim / Lid -->
      <div class="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t-3xl shadow-sm z-20 opacity-90 border-b border-slate-500/20 flex items-center justify-center">
        <div class="w-8 h-1 bg-slate-500/40 rounded-full"></div>
      </div>

      <!-- Glass reflection highlights -->
      <div class="absolute inset-y-0 left-2 w-2.5 bg-gradient-to-r from-white/20 to-transparent rounded-full z-20 pointer-events-none blur-[0.5px]"></div>
      <div class="absolute inset-y-0 right-2 w-1.5 bg-gradient-to-l from-white/10 to-transparent rounded-full z-20 pointer-events-none"></div>

      <!-- Gauge Level Ticks on Side -->
      <div class="absolute inset-y-4 right-2.5 flex flex-col justify-between items-end z-20 text-[9px] font-mono text-on-surface-variant/50 pointer-events-none select-none">
        <span class="pr-1 leading-none">100%</span>
        <span class="pr-1 leading-none">75%</span>
        <span class="pr-1 leading-none">50%</span>
        <span class="pr-1 leading-none">25%</span>
        <span class="pr-1 leading-none">0%</span>
      </div>

      <!-- Liquid Body with Wave Physics -->
      <div
        class="relative w-full transition-all duration-1000 ease-out overflow-hidden rounded-b-2xl"
        :style="{ height: `${Math.max(4, tank.level)}%` }"
      >
        <!-- Animated Liquid Gradient Surface -->
        <div
          class="absolute inset-0 transition-colors duration-700"
          :class="{
            'bg-gradient-to-t from-cyan-600 via-cyan-500 to-sky-400': tank.status === 'normal',
            'bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400': tank.status === 'warning',
            'bg-gradient-to-t from-rose-700 via-red-600 to-rose-400': tank.status === 'critical',
          }"
        >
          <!-- Fluid Wave 1 (Front) -->
          <svg class="absolute -top-3 left-0 w-[200%] h-6 animate-wave-front opacity-80" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-30 1200,40 L1200,120 L0,120 Z" :fill="tank.status === 'critical' ? '#f43f5e' : tank.status === 'warning' ? '#fbbf24' : '#67e8f9'" />
          </svg>
          <!-- Fluid Wave 2 (Back) -->
          <svg class="absolute -top-4 left-0 w-[200%] h-7 animate-wave-back opacity-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C300,-40 450,110 700,10 C950,-90 1050,90 1200,0 L1200,120 L0,120 Z" :fill="tank.status === 'critical' ? '#991b1b' : tank.status === 'warning' ? '#b45309' : '#0891b2'" />
          </svg>
          <div class="bubble bubble-1"></div>
          <div class="bubble bubble-2"></div>
          <div class="bubble bubble-3"></div>
        </div>
      </div>

      <!-- Center percentage floating badge -->
      <div class="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div class="px-3 py-1 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md shadow-lg flex flex-col items-center">
          <span class="text-xl sm:text-2xl font-black tracking-tight" :class="tank.status === 'critical' ? 'text-error-red' : tank.status === 'warning' ? 'text-admin-gold' : 'text-primary'">
            {{ tank.level }}%
          </span>
          <span class="text-[10px] font-semibold text-on-surface-variant -mt-1">
            {{ formatVolume(tank.currentLiters) }} L
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Standalone Card Mode -->
  <div
    v-else
    @click="$emit('select', tank.id)"
    class="relative flex flex-col justify-between rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-card hover:shadow-card-hover group border-0 cursor-pointer"
    :class="selected ? 'bg-surface-container-high/90 ring-2 ring-primary shadow-primary/20 shadow-xl' : 'bg-surface-container-high/40 hover:bg-surface-container-high/70'"
  >
    <!-- Selected Active Indicator Pin -->
    <div v-if="selected" class="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-extrabold shadow-md flex items-center gap-1 z-30">
      <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
      Monitoreando
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" :class="tank.status === 'critical' ? 'bg-error-red animate-ping' : tank.status === 'warning' ? 'bg-admin-gold animate-pulse' : 'bg-billing-green'"></span>
          <h4 class="text-sm font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">{{ tank.name }}</h4>
        </div>
        <p class="text-xs text-on-surface-variant mt-0.5">{{ tank.type }}</p>
      </div>

      <!-- Status badge -->
      <span
        class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider"
        :class="{
          'bg-billing-green/15 text-billing-green': tank.status === 'normal',
          'bg-admin-gold/15 text-admin-gold': tank.status === 'warning',
          'bg-error-red/15 text-error-red animate-pulse': tank.status === 'critical',
        }"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- 3D Liquid Tank Visualization -->
    <div class="relative my-2 flex justify-center items-center py-2">
      <div class="relative w-36 sm:w-40 h-48 sm:h-52 rounded-3xl overflow-hidden p-1 flex flex-col justify-end items-center bg-gradient-to-b from-surface-container-highest/40 to-surface-container-lowest/80 shadow-inner">
        <!-- Metallic Top Rim / Lid -->
        <div class="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t-3xl shadow-sm z-20 opacity-90 border-b border-slate-500/20 flex items-center justify-center">
          <div class="w-8 h-1 bg-slate-500/40 rounded-full"></div>
        </div>

        <!-- Glass reflection highlights -->
        <div class="absolute inset-y-0 left-2 w-2.5 bg-gradient-to-r from-white/20 to-transparent rounded-full z-20 pointer-events-none blur-[0.5px]"></div>
        <div class="absolute inset-y-0 right-2 w-1.5 bg-gradient-to-l from-white/10 to-transparent rounded-full z-20 pointer-events-none"></div>

        <!-- Gauge Level Ticks on Side -->
        <div class="absolute inset-y-4 right-2.5 flex flex-col justify-between items-end z-20 text-[9px] font-mono text-on-surface-variant/50 pointer-events-none select-none">
          <span class="pr-1 leading-none">100%</span>
          <span class="pr-1 leading-none">75%</span>
          <span class="pr-1 leading-none">50%</span>
          <span class="pr-1 leading-none">25%</span>
          <span class="pr-1 leading-none">0%</span>
        </div>

        <!-- Liquid Body with Wave Physics -->
        <div
          class="relative w-full transition-all duration-1000 ease-out overflow-hidden rounded-b-2xl"
          :style="{ height: `${Math.max(4, tank.level)}%` }"
        >
          <!-- Animated Liquid Gradient Surface -->
          <div
            class="absolute inset-0 transition-colors duration-700"
            :class="{
              'bg-gradient-to-t from-cyan-600 via-cyan-500 to-sky-400': tank.status === 'normal',
              'bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400': tank.status === 'warning',
              'bg-gradient-to-t from-rose-700 via-red-600 to-rose-400': tank.status === 'critical',
            }"
          >
            <!-- Fluid Wave 1 (Front) -->
            <svg class="absolute -top-3 left-0 w-[200%] h-6 animate-wave-front opacity-80" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-30 1200,40 L1200,120 L0,120 Z" :fill="tank.status === 'critical' ? '#f43f5e' : tank.status === 'warning' ? '#fbbf24' : '#67e8f9'" />
            </svg>
            <!-- Fluid Wave 2 (Back) -->
            <svg class="absolute -top-4 left-0 w-[200%] h-7 animate-wave-back opacity-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,40 C300,-40 450,110 700,10 C950,-90 1050,90 1200,0 L1200,120 L0,120 Z" :fill="tank.status === 'critical' ? '#991b1b' : tank.status === 'warning' ? '#b45309' : '#0891b2'" />
            </svg>
            <div class="bubble bubble-1"></div>
            <div class="bubble bubble-2"></div>
            <div class="bubble bubble-3"></div>
          </div>
        </div>

        <!-- Center percentage floating badge -->
        <div class="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div class="px-3 py-1 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md shadow-lg flex flex-col items-center">
            <span class="text-xl sm:text-2xl font-black tracking-tight" :class="tank.status === 'critical' ? 'text-error-red' : tank.status === 'warning' ? 'text-admin-gold' : 'text-primary'">
              {{ tank.level }}%
            </span>
            <span class="text-[10px] font-semibold text-on-surface-variant -mt-1">
              {{ formatVolume(tank.currentLiters) }} L
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Metrics Footer & Quick Refill Action -->
    <div class="mt-2 pt-3 border-t border-black/5 dark:border-white/5 space-y-2.5">
      <div class="flex items-center justify-between text-xs">
        <span class="text-on-surface-variant">Capacidad Total:</span>
        <span class="font-bold text-on-surface">{{ formatVolume(tank.capacity) }} L</span>
      </div>

      <div class="flex items-center justify-between text-xs">
        <span class="text-on-surface-variant">Dispensado Total:</span>
        <span class="font-semibold text-primary font-mono">{{ formatVolume(tank.totalDispensedLiters || 0) }} L</span>
      </div>

      <!-- Actions -->
      <div class="pt-1 flex items-center gap-2">
        <button
          @click.stop="$emit('refill', tank.id)"
          type="button"
          class="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-on-primary transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm border-0"
        >
          <span class="material-symbols-outlined text-sm">water_drop</span>
          <span>Recargar</span>
        </button>

        <button
          @click.stop="$emit('calibrate', tank)"
          type="button"
          title="Ajustar / Calibrar"
          class="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer border-0 bg-surface-container/50 shadow-sm"
        >
          <span class="material-symbols-outlined text-sm">tune</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Tank } from '~/stores/tanks';

interface Props {
  tank: Tank;
  selected?: boolean;
  embedded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  embedded: false,
});

defineEmits<{
  (e: 'select', tankId: string): void;
  (e: 'refill', tankId: string): void;
  (e: 'calibrate', tank: Tank): void;
}>();

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    normal: 'Normal',
    warning: 'Alerta',
    critical: 'Crítico',
  };
  return labels[props.tank.status] || props.tank.status;
});

const formatVolume = (val: number): string => {
  return new Intl.NumberFormat('es-ES').format(Math.round(val || 0));
};
</script>

<style scoped>
@keyframes waveFront {
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(-50%); }
}

@keyframes waveBack {
  0% { transform: translateX(-50%); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0); }
}

.animate-wave-front {
  animation: waveFront 5s infinite linear;
}

.animate-wave-back {
  animation: waveBack 7s infinite linear;
}

/* Bubbles */
.bubble {
  position: absolute;
  bottom: -10px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  pointer-events: none;
  animation: rise 3s infinite ease-in;
}

.bubble-1 {
  width: 6px;
  height: 6px;
  left: 25%;
  animation-duration: 2.8s;
  animation-delay: 0.2s;
}

.bubble-2 {
  width: 9px;
  height: 9px;
  left: 55%;
  animation-duration: 3.5s;
  animation-delay: 1s;
}

.bubble-3 {
  width: 5px;
  height: 5px;
  left: 75%;
  animation-duration: 2.2s;
  animation-delay: 1.8s;
}

@keyframes rise {
  0% {
    bottom: -5px;
    transform: translateX(0);
    opacity: 0.8;
  }
  50% {
    transform: translateX(6px);
  }
  100% {
    bottom: 95%;
    transform: translateX(-4px);
    opacity: 0;
  }
}
</style>
