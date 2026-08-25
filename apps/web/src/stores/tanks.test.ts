import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTanksStore } from './tanks';

describe('Tanks Store - Telemetry & Deductions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should parse water liters from product description accurately', () => {
    const store = useTanksStore();

    expect(store.parseLitersFromItemText('10x Botellón 20L')).toBe(200);
    expect(store.parseLitersFromItemText('5x Botella 5L')).toBe(25);
    expect(store.parseLitersFromItemText('20x Botellón 20L + 2x Botella 5L')).toBe(410);
    expect(store.parseLitersFromItemText('1x Dispensador Frío/Calor')).toBe(0);
  });

  it('should deduct liters from tank on sale and update status', () => {
    const store = useTanksStore();
    const initialLiters = store.tanks[0].currentLiters;

    const result = store.deductLiters(500, store.tanks[0].id, 'Test Sale');

    expect(result.success).toBe(true);
    expect(result.dispensed).toBe(500);
    expect(store.tanks[0].currentLiters).toBe(initialLiters - 500);
    expect(store.movements.length).toBeGreaterThan(0);
    expect(store.movements[0].type).toBe('DISPENSE');
  });

  it('should refill tank to maximum capacity', () => {
    const store = useTanksStore();
    const tankId = store.tanks[1].id;

    const refilled = store.refillTank(tankId);

    expect(refilled).toBe(true);
    const tank = store.tanks.find((t) => t.id === tankId);
    expect(tank?.currentLiters).toBe(tank?.capacity);
    expect(tank?.level).toBe(100);
    expect(tank?.status).toBe('normal');
  });
});
