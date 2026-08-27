import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTanksStore } from './tanks';

describe('Tanks Store (Master Consolidated Tank & Water Balance)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with master consolidated tank and operational parameters', () => {
    const store = useTanksStore();
    expect(store.masterTank).toBeDefined();
    expect(store.masterTank.capacity).toBe(30000);
    expect(store.washWastePercentage).toBe(15);
  });

  it('should deduct sales liters and automatically calculate wash waste (15%)', () => {
    const store = useTanksStore();
    store.masterTank.currentLiters = 20000;
    store.masterTank.capacity = 30000;
    store.washWastePercentage = 15;

    // Deduct 1000L for sale -> should also deduct 150L for wash waste
    const result = store.deductLiters(1000, undefined, 'Venta Test');

    expect(result.dispensed).toBe(1000);
    expect(result.washWaste).toBe(150);
    expect(store.masterTank.currentLiters).toBe(18850);
  });

  it('should record cistern truck refill and update level and status', () => {
    const store = useTanksStore();
    store.masterTank.currentLiters = 10000;
    store.masterTank.capacity = 30000;

    const res = store.recordCisternRefill({
      liters: 10000,
      supplier: 'Cisterna Test C.A.',
      cost: 100,
    });

    expect(res.refilled).toBe(10000);
    expect(store.masterTank.currentLiters).toBe(20000);
    expect(store.masterTank.level).toBe(67);
  });

  it('should calculate estimated days of autonomy remaining accurately', () => {
    const store = useTanksStore();
    store.masterTank.currentLiters = 18400;
    store.averageDailySalesLiters = 2000;
    store.washWastePercentage = 15; // 2000 * 1.15 = 2300 L/day

    // 18400 / 2300 = 8.0 days
    expect(store.estimatedDaysRemaining).toBe(8.0);
  });

  it('should configure physical tank battery and recalculate consolidated capacity', () => {
    const store = useTanksStore();
    
    // Set 2 tanks of 8,000L = 16,000L total
    store.setTankBattery([
      { id: 'pt-1', name: 'Tanque 1', capacity: 8000 },
      { id: 'pt-2', name: 'Tanque 2', capacity: 8000 },
    ], 12000);

    expect(store.masterTank.capacity).toBe(16000);
    expect(store.masterTank.tankCount).toBe(2);
    expect(store.masterTank.currentLiters).toBe(12000);
    expect(store.masterTank.level).toBe(75);
    expect(store.tankBatteryDescription).toContain('2 Tanques');
  });

  it('should format mixed physical tank capacities in battery description', () => {
    const store = useTanksStore();

    // Set mixed tanks: 10k + 7k = 17k
    store.setTankBattery([
      { id: 'pt-1', name: 'Tanque Principal', capacity: 10000 },
      { id: 'pt-2', name: 'Tanque Auxiliar', capacity: 7000 },
    ], 8500);

    expect(store.masterTank.capacity).toBe(17000);
    expect(store.masterTank.level).toBe(50);
    expect(store.tankBatteryDescription).toContain('Batería de 2 Tanques');
    expect(store.tankBatteryDescription).toContain('T1:');
    expect(store.tankBatteryDescription).toContain('T2:');
  });
});
