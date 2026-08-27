<template>
  <div>
    <!-- Trigger Pill in Header -->
    <button
      @click="showModal = true"
      class="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border-0 bg-surface-container-high hover:bg-surface-container-highest text-on-surface group"
      title="Tasa Oficial BCV - Banco Central de Venezuela"
    >
      <span class="p-0.5 sm:p-1 rounded-md bg-billing-green/15 text-billing-green flex items-center justify-center">
        <span class="material-symbols-outlined text-xs sm:text-sm font-bold">currency_exchange</span>
      </span>
      <span class="hidden sm:inline text-on-surface-variant group-hover:text-on-surface transition-colors">BCV:</span>
      <span class="text-billing-green font-mono font-extrabold text-[11px] sm:text-xs">Bs. {{ currencyStore.formattedRate }}</span>
    </button>

    <!-- BCV Exchange Rate Modal & Converter -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-billing-green/15 text-billing-green flex items-center justify-center">
                <span class="material-symbols-outlined text-xl">account_balance</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-bold text-on-surface">Tipo de Cambio Oficial</h4>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-billing-green/15 text-billing-green">
                    BCV
                  </span>
                </div>
                <p class="text-xs text-on-surface-variant">Banco Central de Venezuela</p>
              </div>
            </div>
            <button @click="showModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Official Rates Grid -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <!-- USD Rate Card -->
            <div class="p-3.5 rounded-2xl bg-surface-container/70 shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span class="font-bold flex items-center gap-1">
                  <span>🇺🇸</span> USD / VES
                </span>
                <span class="material-symbols-outlined text-billing-green text-sm">trending_up</span>
              </div>
              <div>
                <span class="text-xl font-extrabold font-mono text-billing-green">
                  Bs. {{ currencyStore.formattedRate }}
                </span>
                <p class="text-[10px] text-on-surface-variant mt-0.5">Tasa Oficial 1 USD</p>
              </div>
            </div>

            <!-- EUR Rate Card -->
            <div class="p-3.5 rounded-2xl bg-surface-container/70 shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span class="font-bold flex items-center gap-1">
                  <span>🇪🇺</span> EUR / VES
                </span>
                <span class="material-symbols-outlined text-primary text-sm">trending_up</span>
              </div>
              <div>
                <span class="text-xl font-extrabold font-mono text-primary">
                  Bs. {{ currencyStore.formattedEurRate }}
                </span>
                <p class="text-[10px] text-on-surface-variant mt-0.5">Tasa Oficial 1 EUR</p>
              </div>
            </div>
          </div>

          <!-- Interactive Currency Calculator ($ <-> Bs.) -->
          <div class="p-4 rounded-2xl bg-surface-container-high/40 shadow-inner mb-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-sm">calculate</span>
                Calculadora de Conversión
              </span>
              <span class="text-[10px] text-on-surface-variant">Tasa: Bs. {{ currencyStore.formattedRate }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Dólares ($ USD)</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-xs">$</span>
                  <input
                    v-model.number="calcUsd"
                    @input="onUsdInput"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="1.00"
                    class="w-full bg-surface-container border-0 rounded-xl pl-7 pr-3 py-2 text-on-surface text-sm font-bold font-mono focus:ring-2 focus:ring-primary outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Bolívares (Bs. VES)</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-xs">Bs.</span>
                  <input
                    v-model.number="calcVes"
                    @input="onVesInput"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="62.45"
                    class="w-full bg-surface-container border-0 rounded-xl pl-9 pr-3 py-2 text-billing-green text-sm font-bold font-mono focus:ring-2 focus:ring-primary outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Manual Rate Override Toggle -->
          <div class="mb-4">
            <button
              type="button"
              @click="showManualOverride = !showManualOverride"
              class="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">tune</span>
              <span>{{ showManualOverride ? 'Ocultar ajuste manual' : '¿Deseas fijar una tasa personalizada?' }}</span>
            </button>

            <div v-if="showManualOverride" class="mt-2.5 p-3 rounded-xl bg-surface-container/60 space-y-2">
              <label class="block text-[11px] font-semibold text-on-surface-variant">Nueva Tasa BCV (Bs. / USD):</label>
              <div class="flex gap-2">
                <input
                  v-model.number="manualRateInput"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Ej: 63.50"
                  class="flex-1 bg-surface-container-high border-0 rounded-xl px-3 py-1.5 text-on-surface text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
                <button
                  type="button"
                  @click="applyManualRate"
                  class="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer active:scale-95"
                >
                  Fijar Tasa
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Actions & Timestamp -->
          <div class="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5 text-xs">
            <span class="text-on-surface-variant text-[11px]">
              Actualizado: {{ formattedDate }}
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="refreshBcv"
                :disabled="currencyStore.loading"
                class="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <span class="material-symbols-outlined text-sm text-primary" :class="{ 'animate-spin': currencyStore.loading }">refresh</span>
                <span>Actualizar API</span>
              </button>
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCurrencyStore } from '~/stores/currency';
import { useToast } from '~/composables/useToast';

const currencyStore = useCurrencyStore();
const toast = useToast();

const showModal = ref(false);
const showManualOverride = ref(false);
const manualRateInput = ref<number>(currencyStore.usdRate);

const calcUsd = ref<number>(10);
const calcVes = ref<number>(currencyStore.toVes(10));

const formattedDate = computed(() => {
  try {
    return new Date(currencyStore.lastUpdated).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Hoy';
  }
});

const onUsdInput = () => {
  calcVes.value = currencyStore.toVes(calcUsd.value || 0);
};

const onVesInput = () => {
  calcUsd.value = currencyStore.toUsd(calcVes.value || 0);
};

const refreshBcv = async () => {
  const ok = await currencyStore.fetchBcvRate();
  calcVes.value = currencyStore.toVes(calcUsd.value || 0);
  if (ok) {
    toast.success('Tasa BCV actualizada', `Tasa oficial: Bs. ${currencyStore.formattedRate} por 1 USD.`);
  } else {
    toast.info('Tasa oficial BCV', `Usando tasa registrada: Bs. ${currencyStore.formattedRate} por 1 USD.`);
  }
};

const applyManualRate = () => {
  if (manualRateInput.value && manualRateInput.value > 0) {
    currencyStore.setManualRate(manualRateInput.value);
    calcVes.value = currencyStore.toVes(calcUsd.value || 0);
    toast.success('Tasa personalizada fijada', `Nueva tasa de cambio: Bs. ${currencyStore.formattedRate}.`);
    showManualOverride.value = false;
  }
};
</script>
