import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ProductCategory = 'Agua' | 'Insumos' | 'Cafetería' | 'Accesorios';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number; // in USD
  cost: number; // in USD
  currentStock: number;
  minStock: number;
  waterLiters: number; // Liters of water consumed per unit sold
  icon: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  // Agua & Recargas
  {
    id: 'prod-1',
    sku: 'AQ-20L-BOT',
    name: 'Botellón Completo 20L (Envase + Agua)',
    category: 'Agua',
    price: 18.50,
    cost: 12.00,
    currentStock: 45,
    minStock: 10,
    waterLiters: 20,
    icon: 'water_drop',
  },
  {
    id: 'prod-2',
    sku: 'AQ-20L-REC',
    name: 'Recarga de Botellón 20L (Retornable)',
    category: 'Agua',
    price: 3.50,
    cost: 0.80,
    currentStock: 999,
    minStock: 50,
    waterLiters: 20,
    icon: 'autorenew',
  },
  {
    id: 'prod-3',
    sku: 'AQ-5L-BOT',
    name: 'Botella de Agua Purificada 5L',
    category: 'Agua',
    price: 2.00,
    cost: 0.90,
    currentStock: 80,
    minStock: 20,
    waterLiters: 5,
    icon: 'water_bottle',
  },
  {
    id: 'prod-4',
    sku: 'AQ-1.5L-BOT',
    name: 'Botella Personal 1.5L',
    category: 'Agua',
    price: 1.00,
    cost: 0.40,
    currentStock: 120,
    minStock: 30,
    waterLiters: 1.5,
    icon: 'local_drink',
  },
  // Insumos & Envases
  {
    id: 'prod-5',
    sku: 'INS-TAP-55',
    name: 'Tapa Antiderrame 55mm con Precinto',
    category: 'Insumos',
    price: 0.35,
    cost: 0.12,
    currentStock: 450,
    minStock: 100,
    waterLiters: 0,
    icon: 'radio_button_checked',
  },
  {
    id: 'prod-6',
    sku: 'INS-BOT-20L',
    name: 'Envase Botellón 20L Nuevo (Sin Agua)',
    category: 'Insumos',
    price: 15.00,
    cost: 10.50,
    currentStock: 28,
    minStock: 8,
    waterLiters: 0,
    icon: 'inventory_2',
  },
  {
    id: 'prod-7',
    sku: 'INS-PREC-100',
    name: 'Precinto de Seguridad Termoencogible (Pack 10)',
    category: 'Insumos',
    price: 1.00,
    cost: 0.30,
    currentStock: 200,
    minStock: 40,
    waterLiters: 0,
    icon: 'verified_user',
  },
  // Cafetería & Extras
  {
    id: 'prod-8',
    sku: 'CAF-EXP',
    name: 'Café Expreso Italiano',
    category: 'Cafetería',
    price: 1.50,
    cost: 0.45,
    currentStock: 150,
    minStock: 20,
    waterLiters: 0.2,
    icon: 'coffee',
  },
  {
    id: 'prod-9',
    sku: 'CAF-DUL',
    name: 'Porción de Torta / Dulce Casero',
    category: 'Cafetería',
    price: 2.50,
    cost: 1.10,
    currentStock: 25,
    minStock: 5,
    waterLiters: 0,
    icon: 'cake',
  },
  {
    id: 'prod-10',
    sku: 'CAF-SNK',
    name: 'Snack / Galleta Horneada',
    category: 'Cafetería',
    price: 1.00,
    cost: 0.50,
    currentStock: 60,
    minStock: 15,
    waterLiters: 0,
    icon: 'cookie',
  },
  // Accesorios
  {
    id: 'prod-11',
    sku: 'ACC-DISP-MAN',
    name: 'Dispensador Manual de Botellón',
    category: 'Accesorios',
    price: 6.50,
    cost: 3.50,
    currentStock: 35,
    minStock: 5,
    waterLiters: 0,
    icon: 'sanitizer',
  },
  {
    id: 'prod-12',
    sku: 'ACC-BOMB-USB',
    name: 'Bomba Eléctrica Recargable USB',
    category: 'Accesorios',
    price: 13.00,
    cost: 7.80,
    currentStock: 18,
    minStock: 4,
    waterLiters: 0,
    icon: 'electric_bolt',
  },
];

const STORAGE_KEY = 'aquapure_products_catalog_v2';

export const useInventoryStore = defineStore('inventory', () => {
  const products = ref<Product[]>([...DEFAULT_PRODUCTS]);

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        products.value = JSON.parse(stored);
      } else {
        saveToStorage();
      }
    } catch {
      // ignore
    }
  };

  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products.value));
    } catch {
      // ignore
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.value.find((p) => p.id === id);
  };

  const getProductsByCategory = (cat?: string): Product[] => {
    if (!cat || cat === 'Todos') return products.value;
    return products.value.filter((p) => p.category === cat);
  };

  const deductStock = (items: { productId: string; quantity: number }[]) => {
    items.forEach((item) => {
      const prod = products.value.find((p) => p.id === item.productId);
      if (prod && prod.category !== 'Agua' && prod.sku !== 'AQ-20L-REC') {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
      }
    });
    saveToStorage();
  };

  const restockItems = (items: { productId: string; quantity: number }[]) => {
    items.forEach((item) => {
      const prod = products.value.find((p) => p.id === item.productId);
      if (prod && prod.category !== 'Agua' && prod.sku !== 'AQ-20L-REC') {
        prod.currentStock = prod.currentStock + Math.max(0, item.quantity);
      }
    });
    saveToStorage();
  };

  const addProduct = (prod: Omit<Product, 'id'> & { id?: string }) => {
    const newProd: Product = {
      ...prod,
      id: prod.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    products.value.unshift(newProd);
    saveToStorage();
    return newProd;
  };

  const updateProduct = (idOrSku: string, patch: Partial<Product>) => {
    const idx = products.value.findIndex(p => p.id === idOrSku || p.sku === idOrSku);
    if (idx !== -1) {
      products.value[idx] = { ...products.value[idx], ...patch };
      saveToStorage();
      return products.value[idx];
    }
    return undefined;
  };

  const deleteProduct = (idOrSku: string) => {
    const initialLen = products.value.length;
    products.value = products.value.filter(p => p.id !== idOrSku && p.sku !== idOrSku);
    if (products.value.length !== initialLen) {
      saveToStorage();
      return true;
    }
    return false;
  };

  const clearProducts = () => {
    products.value = [];
    saveToStorage();
  };

  const resetToDefault = () => {
    products.value = [...DEFAULT_PRODUCTS];
    saveToStorage();
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    products,
    getProductById,
    getProductsByCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    clearProducts,
    resetToDefault,
    deductStock,
    restockItems,
    loadFromStorage,
    saveToStorage,
    init,
  };
});
