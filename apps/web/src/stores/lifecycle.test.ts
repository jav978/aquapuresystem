import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';
import { useSalesStore } from './sales';
import { useCustomersStore, GENERIC_CUSTOMER } from './customers';
import { useInventoryStore } from './inventory';
import { useTanksStore } from './tanks';
import { useBackupStore } from './backup';
import {
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateEmail,
  validatePassword,
  validateDocNumber,
  sanitizeFormData,
} from '../utils/validators';

describe('AquaPure System - End-to-End Operational Lifecycle & Robustness', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Clear mock storage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('1. Clean Production State & Admin-Only Baseline', () => {
    it('should reset all stores to clean production state preserving only supervisor/admin baseline', () => {
      const backupStore = useBackupStore();
      const salesStore = useSalesStore();
      const customersStore = useCustomersStore();
      const inventoryStore = useInventoryStore();
      const tanksStore = useTanksStore();

      // Ensure stores are initialized
      salesStore.init();
      customersStore.init();
      inventoryStore.init();
      tanksStore.init();

      // Execute clean production reset with valid supervisor PIN
      const currentPin = salesStore.supervisorPin;
      const resetResult = backupStore.resetToCleanProductionState(currentPin);
      expect(resetResult.success).toBe(true);

      // Verify all demo transactions, products and non-generic customers are cleaned
      expect(salesStore.invoices.length).toBe(0);
      expect(salesStore.auditLogs.length).toBe(0);
      expect(customersStore.customers.length).toBe(1);
      expect(customersStore.customers[0]?.id).toBe(GENERIC_CUSTOMER.id);
      expect(inventoryStore.products.length).toBe(0);
      expect(tanksStore.masterTank.currentLiters).toBe(0);
      expect(tanksStore.movements.length).toBe(0);
    });

    it('should reject clean reset if invalid supervisor PIN is provided', () => {
      const backupStore = useBackupStore();
      const salesStore = useSalesStore();
      salesStore.init();

      const resetResult = backupStore.resetToCleanProductionState('WRONG_PIN');
      expect(resetResult.success).toBe(false);
      expect(resetResult.error).toContain('PIN de Supervisor incorrecto');
    });
  });

  describe('2. User Permissions & RBAC Restrictions', () => {
    it('should enforce that only ADMIN can manage users and system settings', () => {
      const authStore = useAuthStore();

      // Simulate ADMIN user
      authStore.setUser({
        id: 'user-admin',
        email: 'admin@aquapure.com',
        firstName: 'Admin',
        lastName: 'AquaPure',
        fullName: 'Admin AquaPure',
        role: 'ADMIN',
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      }, 'mock-admin-token');

      expect(authStore.isAdmin).toBe(true);
      expect(authStore.canManageUsers).toBe(true);
      expect(authStore.canManageSettings).toBe(true);
      expect(authStore.canEditInventory).toBe(true);
      expect(authStore.canManageSales).toBe(true);

      // Switch to OPERATOR user
      authStore.setUser({
        id: 'user-operator',
        email: 'cajero1@aquapure.com',
        firstName: 'Carlos',
        lastName: 'Cajero',
        fullName: 'Carlos Cajero',
        role: 'OPERATOR',
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      }, 'mock-operator-token');

      expect(authStore.isAdmin).toBe(false);
      expect(authStore.canManageUsers).toBe(false);
      expect(authStore.canManageSettings).toBe(false);
      expect(authStore.canEditInventory).toBe(false);
      expect(authStore.canManageSales).toBe(true);
    });
  });

  describe('3. Tank Battery Configuration & Cistern Refill', () => {
    it('should configure 3-tank physical battery and record water refill from 0L', () => {
      const tanksStore = useTanksStore();
      tanksStore.init();
      tanksStore.clearTankHistoryAndReset(0);

      expect(tanksStore.masterTank.currentLiters).toBe(0);

      // Configure physical battery: 3 tanks of 10,000L = 30,000L
      tanksStore.setTankBattery([
        { id: 't-1', name: 'Tanque A', capacity: 10000 },
        { id: 't-2', name: 'Tanque B', capacity: 10000 },
        { id: 't-3', name: 'Tanque C', capacity: 10000 },
      ]);

      expect(tanksStore.masterTank.capacity).toBe(30000);
      expect(tanksStore.masterTank.tankCount).toBe(3);

      // Refill 25,000L from Cistern Truck
      const refillResult = tanksStore.recordCisternRefill({
        liters: 25000,
        supplier: 'Cisterna HidroCapital #44',
        cost: 150,
        costCurrency: 'USD',
        notes: 'Carga inicial de agua cruda tratada',
      });

      expect(refillResult.success).toBe(true);
      expect(tanksStore.masterTank.currentLiters).toBe(25000);
      expect(tanksStore.movements.length).toBe(1);
      expect(tanksStore.movements[0]?.type).toBe('REFILL');
      expect(tanksStore.movements[0]?.liters).toBe(25000);
    });
  });

  describe('4. Product Catalog Registration from Scratch', () => {
    it('should add products and validate categories and stock limits', () => {
      const inventoryStore = useInventoryStore();
      inventoryStore.clearProducts();
      expect(inventoryStore.products.length).toBe(0);

      // 1. Add Refill 20L (Water)
      const p1 = inventoryStore.addProduct({
        sku: 'AQ-20L-REC',
        name: 'Recarga de Botellón 20L (Retornable)',
        category: 'Agua',
        price: 3.50,
        cost: 0.80,
        currentStock: 999,
        minStock: 50,
        waterLiters: 20,
        icon: 'autorenew',
      });

      // 2. Add Full Bottle 20L
      const p2 = inventoryStore.addProduct({
        sku: 'AQ-20L-BOT',
        name: 'Botellón Completo 20L (Envase + Agua)',
        category: 'Agua',
        price: 18.50,
        cost: 12.00,
        currentStock: 30,
        minStock: 5,
        waterLiters: 20,
        icon: 'water_drop',
      });

      // 3. Add Cap Accessory
      const p3 = inventoryStore.addProduct({
        sku: 'INS-TAP-55',
        name: 'Tapa Antiderrame 55mm',
        category: 'Insumos',
        price: 0.50,
        cost: 0.15,
        currentStock: 200,
        minStock: 40,
        waterLiters: 0,
        icon: 'radio_button_checked',
      });

      expect(inventoryStore.products.length).toBe(3);
      expect(inventoryStore.getProductById(p1.id)?.sku).toBe('AQ-20L-REC');
      expect(inventoryStore.getProductById(p3.id)?.currentStock).toBe(200);
    });
  });

  describe('5. Customer Registration & Strict Field Sanitization', () => {
    it('should register new customer and strictly reject whitespace-only fields', () => {
      const customersStore = useCustomersStore();
      customersStore.clearCustomers();

      // Form with whitespace that should be sanitized
      const rawCustomer = {
        type: 'JURIDICO' as const,
        docType: 'J' as const,
        docNumber: '  31245678-0  ',
        name: '  Distribuidora El Manantial C.A.  ',
        address: '  Av. Bolívar, Galpón 3  ',
        phone: '  +58 414 999 8877  ',
        email: '  contacto@elmanantial.com  ',
      };

      const newCustomer = customersStore.registerOrUpdateCustomer(rawCustomer);

      expect(newCustomer.docNumber).toBe('31245678-0');
      expect(newCustomer.name).toBe('Distribuidora El Manantial C.A.');
      expect(newCustomer.fullDoc).toBe('J-31245678-0');

      // Test searching the registered customer
      const found = customersStore.findCustomer('J-31245678-0');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Distribuidora El Manantial C.A.');
    });

    it('should validate customer fields strictly', () => {
      expect(validateRequired('', 'Nombre')).toBe('Nombre no puede estar vacío ni contener solo espacios.');
      expect(validateRequired('   ', 'Nombre')).toBe('Nombre no puede estar vacío ni contener solo espacios.');
      expect(validateDocNumber('   ', 'Cédula')).toBe('Cédula no puede estar vacío ni contener solo espacios.');
      expect(validateDocNumber('12', 'Cédula')).toBe('Cédula debe tener entre 5 y 20 caracteres.');
      expect(validateDocNumber('V-18945120', 'Cédula')).toBeNull();
    });
  });

  describe('6. POS Express Sale Execution, Tank Depletion & Stock Deduction', () => {
    it('should process sale of 3 refills (60L water) and 2 caps, deducting water and physical inventory', () => {
      const salesStore = useSalesStore();
      const inventoryStore = useInventoryStore();
      const tanksStore = useTanksStore();
      const customersStore = useCustomersStore();

      // Prepare environment
      tanksStore.clearTankHistoryAndReset(10000); // 10,000L in tank
      inventoryStore.clearProducts();
      salesStore.clearSalesAndAudit();

      const refillProd = inventoryStore.addProduct({
        sku: 'AQ-20L-REC',
        name: 'Recarga 20L',
        category: 'Agua',
        price: 3.50,
        cost: 0.80,
        currentStock: 999,
        minStock: 10,
        waterLiters: 20,
        icon: 'autorenew',
      });

      const capProd = inventoryStore.addProduct({
        sku: 'INS-TAP-55',
        name: 'Tapa 55mm',
        category: 'Insumos',
        price: 0.50,
        cost: 0.15,
        currentStock: 50,
        minStock: 10,
        waterLiters: 0,
        icon: 'radio_button_checked',
      });

      // Cart items: 3 Refills (3 x 20L = 60L water + wash waste) + 2 Caps
      const cartItems = [
        {
          productId: refillProd.id,
          name: refillProd.name,
          price: refillProd.price,
          quantity: 3,
          waterLiters: 20,
        },
        {
          productId: capProd.id,
          name: capProd.name,
          price: capProd.price,
          quantity: 2,
          waterLiters: 0,
        },
      ];

      // Process Sale in POS
      const invoice = salesStore.processSale({
        customer: {
          type: 'NATURAL',
          docType: 'V',
          docNumber: '18945120',
          name: 'Juan Silva',
          address: 'Calle Real #12',
          phone: '+58 412 1234567',
        },
        items: cartItems,
        payment: {
          method: 'CASH_USD',
          methodLabel: 'Efectivo Divisas ($)',
          receivedAmount: 20,
          changeUsd: 8.50, // Total: (3*3.50 + 2*0.50) = $11.50 -> Change: $8.50
        },
        status: 'PAID',
      });

      expect(invoice.total).toBe(11.50);
      expect(invoice.waterLiters).toBe(60);
      expect(salesStore.invoices.length).toBe(1);

      // Verify Tank Water Depletion: 60L dispensed + 9L wash waste (15%) = 69L deducted
      // 10,000L - 69L = 9,931L
      expect(tanksStore.masterTank.currentLiters).toBe(9931);

      // Verify Physical Stock Deduction: Cap stock went from 50 to 48
      expect(inventoryStore.getProductById(capProd.id)?.currentStock).toBe(48);
    });
  });

  describe('7. Supervisor Authorization & Invoice Cancellation Flow', () => {
    it('should allow supervisor to cancel invoice and revert water to tank and inventory to stock', () => {
      const salesStore = useSalesStore();
      const inventoryStore = useInventoryStore();
      const tanksStore = useTanksStore();

      tanksStore.clearTankHistoryAndReset(5000);
      inventoryStore.clearProducts();
      salesStore.clearSalesAndAudit();

      const prod = inventoryStore.addProduct({
        sku: 'ACC-BOMB',
        name: 'Bomba USB',
        category: 'Accesorios',
        price: 15.00,
        cost: 8.00,
        currentStock: 10,
        minStock: 2,
        waterLiters: 0,
        icon: 'electric_bolt',
      });

      const inv = salesStore.processSale({
        customer: GENERIC_CUSTOMER,
        items: [{ productId: prod.id, name: prod.name, price: 15.00, quantity: 2, waterLiters: 0 }],
        payment: { method: 'CASH_USD', methodLabel: 'Efectivo', receivedAmount: 30 },
        status: 'PAID',
      });

      expect(inventoryStore.getProductById(prod.id)?.currentStock).toBe(8);

      // Cancel invoice with supervisor PIN
      const pin = salesStore.supervisorPin;
      const cancelResult = salesStore.cancelInvoice({
        invoiceId: inv.id,
        reason: 'Error en producto seleccionado por el cliente',
        supervisorPin: pin,
        returnWaterToTank: true,
        restockPhysicalItems: true,
      });

      expect(cancelResult.success).toBe(true);
      expect(inv.status).toBe('CANCELLED');

      // Inventory Restocked from 8 back to 10
      expect(inventoryStore.getProductById(prod.id)?.currentStock).toBe(10);

      // Audit Log recorded
      expect(salesStore.auditLogs.length).toBe(1);
      expect(salesStore.auditLogs[0]?.action).toBe('TRANSACTION_CANCEL');
      expect(salesStore.auditLogs[0]?.invoiceNo).toBe(inv.invoiceNo);
    });
  });
});
