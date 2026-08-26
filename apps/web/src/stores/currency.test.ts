import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCurrencyStore } from './currency';

describe('Currency Store (BCV USD/VES)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default BCV rate and calculate conversions accurately', () => {
    const store = useCurrencyStore();
    store.usdRate = 60.00;

    expect(store.toVes(10)).toBe(600.00);
    expect(store.toUsd(300)).toBe(5.00);
    expect(store.formatUsd(15.5)).toBe('$15,50');
    expect(store.formatVes(600)).toContain('600,00');
  });

  it('should allow setting a manual rate override', () => {
    const store = useCurrencyStore();
    store.setManualRate(75.50);

    expect(store.usdRate).toBe(75.50);
    expect(store.isCustomRate).toBe(true);
    expect(store.toVes(2)).toBe(151.00);
  });
});
