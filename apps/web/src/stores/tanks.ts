import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Tank {
  id: string;
  name: string;
  type: string;
  capacity: number; // Litros totales
  currentLiters: number; // Litros disponibles
  level: number; // Porcentaje 0-100%
  status: 'normal' | 'warning' | 'critical';
  lastRefillAt: string;
  totalDispensedLiters: number;
  totalWashWasteLiters: number;
}

export interface TankMovement {
  id: string;
  type: 'DISPENSE' | 'REFILL' | 'WASH_WASTE' | 'ADJUSTMENT';
  liters: number;
  remainingLiters: number;
  reason: string;
  supplier?: string;
  cost?: number;
  costCurrency?: string;
  timestamp: string;
}

const DEFAULT_MASTER_TANK: Tank = {
  id: 'master-tank',
  name: 'Tanque Consolidado de Planta',
  type: 'Almacenamiento Maestro (Ósmosis + UV)',
  capacity: 30000,
  currentLiters: 24500,
  level: 82,
  status: 'normal',
  lastRefillAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  totalDispensedLiters: 38400,
  totalWashWasteLiters: 5760,
};

const DEFAULT_MOVEMENTS: TankMovement[] = [
  {
    id: 'mov-1',
    type: 'REFILL',
    liters: 10000,
    remainingLiters: 28000,
    reason: 'Recarga programada por camión cisterna',
    supplier: 'Cisternas HidroOriente C.A.',
    cost: 120.00,
    costCurrency: 'USD',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'mov-2',
    type: 'DISPENSE',
    liters: 2000,
    remainingLiters: 26000,
    reason: 'Despacho Comercial - 100x Botellón 20L',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'mov-3',
    type: 'WASH_WASTE',
    liters: 300,
    remainingLiters: 25700,
    reason: 'Lavado, desinfección y purga de botellones (15% est.)',
    timestamp: new Date(Date.now() - 3600000 * 19).toISOString(),
  },
  {
    id: 'mov-4',
    type: 'DISPENSE',
    liters: 1000,
    remainingLiters: 24700,
    reason: 'Despacho Comercial - 50x Botellón 20L',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'mov-5',
    type: 'WASH_WASTE',
    liters: 150,
    remainingLiters: 24550,
    reason: 'Lavado y enjuague de línea de llenado (15% est.)',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const STORAGE_KEY = 'aquapure_master_tank_v2';
const HISTORY_STORAGE_KEY = 'aquapure_tanks_history_v2';
const SETTINGS_STORAGE_KEY = 'aquapure_tanks_settings_v2';

export const useTanksStore = defineStore('tanks', () => {
  const masterTank = ref<Tank>({ ...DEFAULT_MASTER_TANK });
  const movements = ref<TankMovement[]>([...DEFAULT_MOVEMENTS]);

  // Operational parameters
  const washWastePercentage = ref<number>(15); // Default 15% (Range: 10% - 20%)
  const alertThresholdPercent = ref<number>(25); // Trigger alert when level <= 25%
  const averageDailySalesLiters = ref<number>(3200); // 3,200 L/day estimated sales

  // Compatibility array with single master tank for existing dropdowns
  const tanks = computed<Tank[]>(() => [masterTank.value]);

  const calculateStatus = (level: number): 'normal' | 'warning' | 'critical' => {
    if (level <= alertThresholdPercent.value) return 'critical';
    if (level <= 50) return 'warning';
    return 'normal';
  };

  const isRefillNeeded = computed(() => {
    return masterTank.value.level <= alertThresholdPercent.value;
  });

  // Calculate estimated days of water autonomy remaining
  const estimatedDaysRemaining = computed(() => {
    const dailyLossWithWash = averageDailySalesLiters.value * (1 + washWastePercentage.value / 100);
    if (dailyLossWithWash <= 0) return 99;
    const days = masterTank.value.currentLiters / dailyLossWithWash;
    return Math.max(0, Math.round(days * 10) / 10);
  });

  // Accumulated metrics
  const totalWaterPurchased = computed(() => {
    return movements.value
      .filter((m) => m.type === 'REFILL')
      .reduce((sum, m) => sum + m.liters, 0);
  });

  const totalWaterSold = computed(() => {
    return movements.value
      .filter((m) => m.type === 'DISPENSE')
      .reduce((sum, m) => sum + m.liters, 0);
  });

  const totalWaterWasted = computed(() => {
    return movements.value
      .filter((m) => m.type === 'WASH_WASTE')
      .reduce((sum, m) => sum + m.liters, 0);
  });

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const storedTank = localStorage.getItem(STORAGE_KEY);
      if (storedTank) {
        masterTank.value = JSON.parse(storedTank);
      }

      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        movements.value = JSON.parse(storedHistory);
      }

      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.washWastePercentage) washWastePercentage.value = parsed.washWastePercentage;
        if (parsed.alertThresholdPercent) alertThresholdPercent.value = parsed.alertThresholdPercent;
        if (parsed.averageDailySalesLiters) averageDailySalesLiters.value = parsed.averageDailySalesLiters;
      }
    } catch {
      // ignore
    }
  };

  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(masterTank.value));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(movements.value));
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          washWastePercentage: washWastePercentage.value,
          alertThresholdPercent: alertThresholdPercent.value,
          averageDailySalesLiters: averageDailySalesLiters.value,
        })
      );
    } catch {
      // ignore
    }
  };

  /**
   * Helper to parse liters from product text descriptions
   */
  const parseLitersFromItemText = (itemsText: string): number => {
    if (!itemsText) return 20;
    let totalLiters = 0;

    // Look for 20L bottles
    const m20 = itemsText.match(/(\d+)\s*x?\s*Botell[oó]n\s*20L/i);
    if (m20 && m20[1]) {
      totalLiters += parseInt(m20[1], 10) * 20;
    }

    // Look for 5L bottles
    const m5 = itemsText.match(/(\d+)\s*x?\s*Botella\s*5L/i);
    if (m5 && m5[1]) {
      totalLiters += parseInt(m5[1], 10) * 5;
    }

    if (totalLiters === 0) {
      const generic = itemsText.match(/(\d+)\s*L/i);
      if (generic && generic[1]) {
        totalLiters += parseInt(generic[1], 10);
      }
    }

    return totalLiters > 0 ? totalLiters : 20;
  };

  /**
   * Deduct liters from sale + automatically calculate and deduct wash waste
   */
  const deductLiters = (litersToDeduct: number, _tankId?: string, reason = 'Venta / Despacho comercial') => {
    const liters = Math.max(0, litersToDeduct);
    const newLiters = Math.max(0, masterTank.value.currentLiters - liters);

    masterTank.value.currentLiters = newLiters;
    masterTank.value.level = Math.round((newLiters / masterTank.value.capacity) * 100);
    masterTank.value.status = calculateStatus(masterTank.value.level);
    masterTank.value.totalDispensedLiters += liters;

    // Movement for sale
    movements.value.unshift({
      id: `mov-${Date.now()}-disp`,
      type: 'DISPENSE',
      liters,
      remainingLiters: newLiters,
      reason,
      timestamp: new Date().toISOString(),
    });

    // Automatic wash waste deduction (10% - 20% configurable)
    const washWasteLiters = Math.round(liters * (washWastePercentage.value / 100));
    if (washWasteLiters > 0) {
      const afterWashLiters = Math.max(0, masterTank.value.currentLiters - washWasteLiters);
      masterTank.value.currentLiters = afterWashLiters;
      masterTank.value.level = Math.round((afterWashLiters / masterTank.value.capacity) * 100);
      masterTank.value.status = calculateStatus(masterTank.value.level);
      masterTank.value.totalWashWasteLiters += washWasteLiters;

      movements.value.unshift({
        id: `mov-${Date.now()}-waste`,
        type: 'WASH_WASTE',
        liters: washWasteLiters,
        remainingLiters: afterWashLiters,
        reason: `Merma de lavado y desinfección (${washWastePercentage.value}% de ${liters}L)`,
        timestamp: new Date().toISOString(),
      });
    }

    saveToStorage();

    return {
      dispensed: liters,
      washWaste: washWasteLiters,
      tankName: masterTank.value.name,
      remaining: masterTank.value.currentLiters,
      level: masterTank.value.level,
    };
  };

  /**
   * Record water refill by cistern truck
   */
  const recordCisternRefill = (params: {
    liters: number;
    supplier: string;
    cost?: number;
    costCurrency?: string;
    notes?: string;
  }) => {
    const refillLiters = Math.max(0, params.liters);
    const newLiters = Math.min(masterTank.value.capacity, masterTank.value.currentLiters + refillLiters);

    masterTank.value.currentLiters = newLiters;
    masterTank.value.level = Math.round((newLiters / masterTank.value.capacity) * 100);
    masterTank.value.status = calculateStatus(masterTank.value.level);
    masterTank.value.lastRefillAt = new Date().toISOString();

    movements.value.unshift({
      id: `mov-${Date.now()}-refill`,
      type: 'REFILL',
      liters: refillLiters,
      remainingLiters: newLiters,
      reason: params.notes || `Recarga de agua por Cisterna (${params.supplier})`,
      supplier: params.supplier,
      cost: params.cost || 0,
      costCurrency: params.costCurrency || 'USD',
      timestamp: new Date().toISOString(),
    });

    saveToStorage();

    return {
      refilled: refillLiters,
      tankName: masterTank.value.name,
      currentLiters: masterTank.value.currentLiters,
      level: masterTank.value.level,
    };
  };

  /**
   * Record manual wash waste or plant cleaning
   */
  const recordWashWaste = (params: { liters: number; reason?: string }) => {
    const wasteLiters = Math.max(0, params.liters);
    const newLiters = Math.max(0, masterTank.value.currentLiters - wasteLiters);

    masterTank.value.currentLiters = newLiters;
    masterTank.value.level = Math.round((newLiters / masterTank.value.capacity) * 100);
    masterTank.value.status = calculateStatus(masterTank.value.level);
    masterTank.value.totalWashWasteLiters += wasteLiters;

    movements.value.unshift({
      id: `mov-${Date.now()}-waste-manual`,
      type: 'WASH_WASTE',
      liters: wasteLiters,
      remainingLiters: newLiters,
      reason: params.reason || 'Limpieza y mantenimiento general de planta / botellones',
      timestamp: new Date().toISOString(),
    });

    saveToStorage();

    return {
      wasted: wasteLiters,
      remaining: masterTank.value.currentLiters,
      level: masterTank.value.level,
    };
  };

  const setWashWastePercentage = (percentage: number) => {
    if (percentage >= 0 && percentage <= 50) {
      washWastePercentage.value = percentage;
      saveToStorage();
    }
  };

  const setMasterCapacity = (capacity: number) => {
    if (capacity > 0) {
      masterTank.value.capacity = capacity;
      masterTank.value.level = Math.round((masterTank.value.currentLiters / capacity) * 100);
      masterTank.value.status = calculateStatus(masterTank.value.level);
      saveToStorage();
    }
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    masterTank,
    tanks,
    movements,
    washWastePercentage,
    alertThresholdPercent,
    averageDailySalesLiters,
    isRefillNeeded,
    estimatedDaysRemaining,
    totalWaterPurchased,
    totalWaterSold,
    totalWaterWasted,
    init,
    deductLiters,
    recordCisternRefill,
    recordWashWaste,
    setWashWastePercentage,
    setMasterCapacity,
    parseLitersFromItemText,
  };
});
