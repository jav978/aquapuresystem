import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Tank {
  id: string;
  name: string;
  type: string;
  capacity: number; // in liters
  currentLiters: number; // in liters
  level: number; // percentage 0-100
  status: 'normal' | 'warning' | 'critical';
  lastRefillAt: string;
  totalDispensedLiters: number;
}

export interface TankMovement {
  id: string;
  tankId: string;
  tankName: string;
  type: 'DISPENSE' | 'REFILL' | 'ADJUSTMENT';
  liters: number;
  remainingLiters: number;
  reason: string;
  timestamp: string;
}

const DEFAULT_TANKS: Tank[] = [
  {
    id: 'tank-1',
    name: 'Tanque Principal A - Purificada',
    type: 'Ósmosis Inversa + UV',
    capacity: 10000,
    currentLiters: 8500,
    level: 85,
    status: 'normal',
    lastRefillAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    totalDispensedLiters: 15400,
  },
  {
    id: 'tank-2',
    name: 'Tanque B - Mineral / Alcalina',
    type: 'Mineralización Controlada',
    capacity: 8000,
    currentLiters: 2400,
    level: 30,
    status: 'warning',
    lastRefillAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    totalDispensedLiters: 8200,
  },
  {
    id: 'tank-3',
    name: 'Tanque C - Filtrada para Lavado',
    type: 'Microfiltración Carbón',
    capacity: 5000,
    currentLiters: 650,
    level: 13,
    status: 'critical',
    lastRefillAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    totalDispensedLiters: 12100,
  },
];

const STORAGE_KEY = 'aquapure_tanks_state_v1';
const HISTORY_STORAGE_KEY = 'aquapure_tanks_history_v1';

export const useTanksStore = defineStore('tanks', () => {
  const tanks = ref<Tank[]>([]);
  const movements = ref<TankMovement[]>([]);
  let initialized = false;

  const calculateStatus = (level: number): 'normal' | 'warning' | 'critical' => {
    if (level <= 15) return 'critical';
    if (level <= 30) return 'warning';
    return 'normal';
  };

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') {
      tanks.value = DEFAULT_TANKS;
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        tanks.value = JSON.parse(stored);
      } else {
        tanks.value = JSON.parse(JSON.stringify(DEFAULT_TANKS));
        saveToStorage();
      }

      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        movements.value = JSON.parse(storedHistory);
      }
    } catch {
      tanks.value = JSON.parse(JSON.stringify(DEFAULT_TANKS));
    }
  };

  const saveToStorage = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tanks.value));
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(movements.value.slice(0, 100)));
      } catch {
        // Storage quota full or unavailable
      }
    }
  };

  const init = () => {
    if (initialized) return;
    initialized = true;
    loadFromStorage();
  };

  /**
   * Helper to parse liters from product descriptions like "10x Botellón 20L", "5x Botella 5L", "2x Botella 500ml"
   */
  const parseLitersFromItemText = (itemsText: string): number => {
    let totalLiters = 0;
    let hasEquipmentOnly = false;
    if (!itemsText || !itemsText.trim()) return 0;

    const lines = itemsText.split(/[,+\n]/);
    for (const rawLine of lines) {
      const line = rawLine.trim().toLowerCase();
      if (!line) continue;
      // Match patterns like "10x Botellon 20L", "5 botellones 20 l", "2x 5L"
      const qtyMatch = line.match(/^(\d+)\s*(?:x|\*|\s)?/);
      const qty = qtyMatch && qtyMatch[1] ? parseInt(qtyMatch[1], 10) : 1;

      if (line.includes('20l') || line.includes('20 l') || line.includes('20-l') || line.includes('botellon') || line.includes('botellón')) {
        totalLiters += qty * 20;
      } else if (line.includes('15l') || line.includes('15 l')) {
        totalLiters += qty * 15;
      } else if (line.includes('12l') || line.includes('12 l')) {
        totalLiters += qty * 12;
      } else if (line.includes('10l') || line.includes('10 l')) {
        totalLiters += qty * 10;
      } else if (line.includes('5l') || line.includes('5 l') || line.includes('galon') || line.includes('galón')) {
        totalLiters += qty * 5;
      } else if (line.includes('1.5l') || line.includes('1,5l')) {
        totalLiters += qty * 1.5;
      } else if (line.includes('1l') || line.includes('1 l') || line.includes('litro')) {
        totalLiters += qty * 1;
      } else if (line.includes('500ml') || line.includes('500 ml')) {
        totalLiters += qty * 0.5;
      } else if (line.includes('dispensador') || line.includes('filtro') || line.includes('accesorio') || line.includes('tapa') || line.includes('cafe') || line.includes('café')) {
        // Equipment or dry goods
        hasEquipmentOnly = true;
      } else {
        totalLiters += qty * 20;
      }
    }

    if (totalLiters === 0 && hasEquipmentOnly) return 0;
    return totalLiters;
  };

  /**
   * Deducts water volume from a tank when a sale or invoice is registered
   */
  const deductLiters = (liters: number, tankId?: string, reason = 'Venta / Facturación'): { success: boolean; dispensed: number; tankName: string } => {
    init();
    if (liters <= 0) return { success: true, dispensed: 0, tankName: '' };

    // Select specified tank or default to the tank with highest available volume
    let target = tanks.value.find((t) => t.id === tankId);
    if (!target) {
      target = tanks.value.find((t) => t.id === 'tank-1') || tanks.value[0];
    }

    if (!target) {
      return { success: false, dispensed: 0, tankName: 'Desconocido' };
    }

    const actualDeduction = Math.min(target.currentLiters, liters);
    target.currentLiters = Math.max(0, Math.round(target.currentLiters - actualDeduction));
    target.level = Math.round((target.currentLiters / target.capacity) * 100);
    target.status = calculateStatus(target.level);
    target.totalDispensedLiters += actualDeduction;

    movements.value.unshift({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      tankId: target.id,
      tankName: target.name,
      type: 'DISPENSE',
      liters: actualDeduction,
      remainingLiters: target.currentLiters,
      reason,
      timestamp: new Date().toISOString(),
    });

    saveToStorage();
    return { success: true, dispensed: actualDeduction, tankName: target.name };
  };

  /**
   * Refills a tank to full capacity or adds a specific amount
   */
  const refillTank = (tankId: string, amountLiters?: number, reason = 'Purificación y Llenado'): boolean => {
    init();
    const target = tanks.value.find((t) => t.id === tankId);
    if (!target) return false;

    const previousLiters = target.currentLiters;
    if (amountLiters !== undefined && amountLiters > 0) {
      target.currentLiters = Math.min(target.capacity, Math.round(target.currentLiters + amountLiters));
    } else {
      target.currentLiters = target.capacity;
    }

    const added = target.currentLiters - previousLiters;
    target.level = Math.round((target.currentLiters / target.capacity) * 100);
    target.status = calculateStatus(target.level);
    target.lastRefillAt = new Date().toISOString();

    movements.value.unshift({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      tankId: target.id,
      tankName: target.name,
      type: 'REFILL',
      liters: added,
      remainingLiters: target.currentLiters,
      reason,
      timestamp: new Date().toISOString(),
    });

    saveToStorage();
    return true;
  };

  /**
   * Adjusts tank capacity or settings
   */
  const updateTank = (tankId: string, updates: Partial<Omit<Tank, 'id'>>) => {
    init();
    const target = tanks.value.find((t) => t.id === tankId);
    if (!target) return false;

    Object.assign(target, updates);
    if (updates.capacity || updates.currentLiters !== undefined) {
      target.level = Math.round((target.currentLiters / target.capacity) * 100);
      target.status = calculateStatus(target.level);
    }
    saveToStorage();
    return true;
  };

  // Getters
  const totalCapacity = computed(() => tanks.value.reduce((acc, t) => acc + t.capacity, 0));
  const totalCurrentLiters = computed(() => tanks.value.reduce((acc, t) => acc + t.currentLiters, 0));
  const globalLevel = computed(() => (totalCapacity.value > 0 ? Math.round((totalCurrentLiters.value / totalCapacity.value) * 100) : 0));
  const criticalCount = computed(() => tanks.value.filter((t) => t.status === 'critical').length);
  const warningCount = computed(() => tanks.value.filter((t) => t.status === 'warning').length);

  // Initialize on first import
  init();

  return {
    tanks,
    movements,
    totalCapacity,
    totalCurrentLiters,
    globalLevel,
    criticalCount,
    warningCount,
    init,
    deductLiters,
    refillTank,
    updateTank,
    parseLitersFromItemText,
    saveToStorage,
  };
});
