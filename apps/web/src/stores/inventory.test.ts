import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInventoryStore } from './inventory';

describe('Inventory Store (Multiproduct Catalog & Stock)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with multiproduct catalog across categories', () => {
    const store = useInventoryStore();
    expect(store.products.length).toBeGreaterThan(0);
    const waterProducts = store.getProductsByCategory('Agua');
    expect(waterProducts.length).toBeGreaterThan(0);
  });

  it('should filter products by category correctly', () => {
    const store = useInventoryStore();
    const supplies = store.getProductsByCategory('Insumos');
    expect(supplies.every((p) => p.category === 'Insumos')).toBe(true);

    const cafe = store.getProductsByCategory('Cafetería');
    expect(cafe.length).toBeGreaterThan(0);
  });

  it('should deduct stock when items are sold', () => {
    const store = useInventoryStore();
    const tapProduct = store.products.find((p) => p.sku === 'INS-TAP-55');
    if (tapProduct) {
      const initialStock = tapProduct.currentStock;
      store.deductStock([{ productId: tapProduct.id, quantity: 5 }]);
      expect(tapProduct.currentStock).toBe(initialStock - 5);
    }
  });
});
