import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSalesStore } from './sales';
import { useCustomersStore } from './customers';
import { useInventoryStore } from './inventory';
import { useTanksStore } from './tanks';

describe('Sales & Invoicing Store with Banking Reconciliation and QR', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with predefined invoices and compute total amounts', () => {
    const store = useSalesStore();
    expect(store.invoices.length).toBeGreaterThan(0);
    expect(store.totalSalesAmount).toBeGreaterThan(0);
    expect(store.totalWaterDispensed).toBeGreaterThan(0);
  });

  it('should process a complete multiproduct sale with banking reference and generate QR payload', () => {
    const store = useSalesStore();
    const invoice = store.processSale({
      customer: {
        type: 'JURIDICO',
        docType: 'J',
        docNumber: '31245678-0',
        name: 'AquaExpress Delivery C.A.',
        address: 'Zona Industrial II',
      },
      items: [
        {
          productId: 'prod-2',
          name: 'Recarga 20L',
          price: 3.50,
          quantity: 10,
          waterLiters: 20,
        },
        {
          productId: 'prod-5',
          name: 'Tapa 55mm',
          price: 0.35,
          quantity: 10,
          waterLiters: 0,
        },
      ],
      payment: {
        method: 'PAGO_MOVIL',
        methodLabel: 'Pago Móvil',
        bankName: 'Banco de Venezuela',
        referenceNumber: '784123',
      },
      status: 'PAID',
    });

    expect(invoice.invoiceNo).toContain('FAC-2026-');
    expect(invoice.total).toBe(38.50);
    expect(invoice.waterLiters).toBe(200);
    expect(invoice.payment.referenceNumber).toBe('784123');
    expect(invoice.qrPayload).toContain('AQUAPURE|');
    expect(store.invoices[0].id).toBe(invoice.id);
  });

  it('should mark an invoice as paid and record payment details', () => {
    const store = useSalesStore();
    const firstInvoice = store.invoices[0];
    store.markInvoiceAsPaid(firstInvoice.id, {
      method: 'CASH_USD',
      methodLabel: 'Efectivo',
      receivedAmount: 200,
      changeUsd: 7.5,
    });

    expect(firstInvoice.status).toBe('PAID');
    expect(firstInvoice.payment.receivedAmount).toBe(200);
  });

  it('should guarantee idempotency when processing sale with same idempotencyKey', () => {
    const store = useSalesStore();
    const initialCount = store.invoices.length;
    const testKey = 'tx_unique_crash_test_123';

    const saleParams = {
      customer: {
        type: 'NATURAL' as const,
        docType: 'V' as const,
        docNumber: '19876543',
        name: 'Maria Perez',
        address: 'Calle 5 Casa 12',
      },
      items: [
        {
          productId: 'prod-2',
          name: 'Recarga 20L',
          price: 3.50,
          quantity: 2,
          waterLiters: 20,
        },
      ],
      payment: {
        method: 'CASH_USD' as const,
        methodLabel: 'Efectivo',
      },
      status: 'PAID' as const,
      idempotencyKey: testKey,
    };

    // First attempt
    const firstInvoice = store.processSale(saleParams);
    expect(store.invoices.length).toBe(initialCount + 1);
    expect(firstInvoice.idempotencyKey).toBe(testKey);

    // Second attempt (simulating retry after power crash / double click)
    const duplicateAttempt = store.processSale(saleParams);
    expect(store.invoices.length).toBe(initialCount + 1); // Count did not increase
    expect(duplicateAttempt.id).toBe(firstInvoice.id);
  });

  it('should verify supervisor PIN and lock system after 3 failed attempts', () => {
    const store = useSalesStore();
    store.setSupervisorPin('9876');

    // Attempt 1: wrong PIN
    const res1 = store.verifySupervisorPin('0000');
    expect(res1.success).toBe(false);
    expect(res1.attemptsLeft).toBe(2);
    expect(store.supervisorSecurity.isLocked).toBe(false);

    // Attempt 2: wrong PIN
    const res2 = store.verifySupervisorPin('1111');
    expect(res2.success).toBe(false);
    expect(res2.attemptsLeft).toBe(1);
    expect(store.supervisorSecurity.isLocked).toBe(false);

    // Attempt 3: wrong PIN -> Lockout
    const res3 = store.verifySupervisorPin('2222');
    expect(res3.success).toBe(false);
    expect(res3.attemptsLeft).toBe(0);
    expect(res3.isLocked).toBe(true);
    expect(store.supervisorSecurity.isLocked).toBe(true);

    // Attempt 4: Even with correct PIN, system is locked
    const res4 = store.verifySupervisorPin('9876');
    expect(res4.success).toBe(false);
    expect(res4.isLocked).toBe(true);

    // Administrator unlocks
    store.unlockSupervisorPin();
    expect(store.supervisorSecurity.isLocked).toBe(false);
    expect(store.supervisorSecurity.failedAttempts).toBe(0);

    // Now correct PIN succeeds
    const res5 = store.verifySupervisorPin('9876');
    expect(res5.success).toBe(true);
  });

  it('should generate a 24-hour dynamic random PIN and support manual override', () => {
    const store = useSalesStore();
    const generated = store.generateNewDailyPin('AUTO_DAILY');
    expect(generated.length).toBe(4);
    expect(store.supervisorPin).toBe(generated);
    expect(store.isPinExpired).toBe(false);
    expect(store.timeRemainingFormatted).toContain('h');

    // Manual override
    const manualSuccess = store.setSupervisorPin('4567');
    expect(manualSuccess).toBe(true);
    expect(store.supervisorPin).toBe('4567');
    expect(store.supervisorSecurity.mode).toBe('MANUAL');
  });
});
