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
});
