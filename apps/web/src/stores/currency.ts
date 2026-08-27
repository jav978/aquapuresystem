import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CurrencyRate {
  pair: string;
  rate: number;
  symbol: string;
  source: string;
  lastUpdated: string;
}

export const useCurrencyStore = defineStore('currency', () => {
  // Official BCV USD/VES exchange rate (default fallback if offline)
  const usdRate = ref<number>(62.45);
  const eurRate = ref<number>(66.10);
  const lastUpdated = ref<string>(new Date().toISOString());
  const sourceName = ref<string>('Banco Central de Venezuela (BCV)');
  const loading = ref<boolean>(false);
  const isCustomRate = ref<boolean>(false);
  const error = ref<string | null>(null);

  const storageKey = 'aquapure_bcv_rate';

  const formattedRate = computed(() => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdRate.value);
  });

  const formattedEurRate = computed(() => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(eurRate.value);
  });

  // Conversion helpers
  const toVes = (usdAmount: number): number => {
    return Math.round((usdAmount || 0) * usdRate.value * 100) / 100;
  };

  const toUsd = (vesAmount: number): number => {
    if (usdRate.value <= 0) return 0;
    return Math.round(((vesAmount || 0) / usdRate.value) * 100) / 100;
  };

  const formatVes = (amount: number): string => {
    return `Bs. ${new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)}`;
  };

  const formatUsd = (amount: number): string => {
    return `$${new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)}`;
  };

  /**
   * Fetches the official BCV dollar rate from live exchange rate services
   */
  const fetchBcvRate = async (silent = false): Promise<boolean> => {
    if (!silent) loading.value = true;
    error.value = null;

    try {
      // Try primary BCV API provider (DolarApi Venezuela)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.promedio && typeof data.promedio === 'number' && data.promedio > 0) {
          usdRate.value = data.promedio;
          lastUpdated.value = data.fechaActualizacion || new Date().toISOString();
          isCustomRate.value = false;
          saveToStorage();
          loading.value = false;
          return true;
        }
      }
    } catch {
      // Primary API timed out or blocked by CORS, try secondary fallback
    }

    try {
      const fallbackResp = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv');
      if (fallbackResp.ok) {
        const data = await fallbackResp.json();
        const bcvPrice = data?.monitors?.usd?.price;
        if (bcvPrice && typeof bcvPrice === 'number' && bcvPrice > 0) {
          usdRate.value = bcvPrice;
          lastUpdated.value = data?.datetime?.date || new Date().toISOString();
          isCustomRate.value = false;
          saveToStorage();
          loading.value = false;
          return true;
        }
      }
    } catch {
      // Retain stored or fallback rate
    }

    loading.value = false;
    // If online fetch fails, load previous saved cache
    loadFromStorage();
    return false;
  };

  const setManualRate = (newRate: number) => {
    if (newRate > 0) {
      usdRate.value = Math.round(newRate * 100) / 100;
      isCustomRate.value = true;
      lastUpdated.value = new Date().toISOString();
      saveToStorage();
    }
  };

  const saveToStorage = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            usdRate: usdRate.value,
            eurRate: eurRate.value,
            lastUpdated: lastUpdated.value,
            isCustomRate: isCustomRate.value,
          })
        );
      } catch {
        // storage ignored
      }
    }
  };

  const loadFromStorage = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.usdRate) usdRate.value = parsed.usdRate;
          if (parsed.eurRate) eurRate.value = parsed.eurRate;
          if (parsed.lastUpdated) lastUpdated.value = parsed.lastUpdated;
          if (parsed.isCustomRate !== undefined) isCustomRate.value = parsed.isCustomRate;
        }
      } catch {
        // ignore
      }
    }
  };

  const init = () => {
    loadFromStorage();
    fetchBcvRate(true);
  };

  return {
    usdRate,
    eurRate,
    lastUpdated,
    sourceName,
    loading,
    error,
    isCustomRate,
    formattedRate,
    formattedEurRate,
    toVes,
    toUsd,
    formatVes,
    formatUsd,
    fetchBcvRate,
    setManualRate,
    loadFromStorage,
    init,
  };
});
