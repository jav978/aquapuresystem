import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useTanksStore } from './tanks';
import { useInventoryStore } from './inventory';
import { useCustomersStore, type Customer } from './customers';
import { useCurrencyStore } from './currency';

export type PaymentMethodType =
  | 'CASH_USD'
  | 'CASH_VES'
  | 'PAGO_MOVIL'
  | 'TRANSFER'
  | 'POS_CARD';

export interface PaymentDetails {
  method: PaymentMethodType;
  methodLabel: string;
  receivedAmount?: number;
  changeUsd?: number;
  changeVes?: number;
  bankName?: string;
  referenceNumber?: string;
  authCode?: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number; // in USD
  quantity: number;
  waterLiters: number;
  subtotal: number;
}

export interface SaleInvoice {
  id: string; // ej: FAC-2026-001
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  dateTime: string; // ISO
  customer: string;
  customerDoc: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  customerType: 'NATURAL' | 'JURIDICO';
  items: SaleItem[];
  itemsSummary: string;
  waterLiters: number;
  subtotal: number;
  total: number; // in USD
  totalVes: number; // in Bs.
  bcvRate: number;
  status: 'PAID' | 'PENDING';
  payment: PaymentDetails;
  qrPayload: string;
}

const DEFAULT_SALES: SaleInvoice[] = [
  {
    id: 'FAC-2026-001',
    invoiceNo: 'FAC-2026-001',
    date: '2026-02-25',
    dateTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: 'AquaExpress Delivery C.A.',
    customerDoc: 'J-31245678-0',
    customerAddress: 'Av. Las Industrias, Galpón 4, Zona Industrial',
    customerPhone: '+58 414 123 4567',
    customerEmail: 'contacto@aquaexpress.com',
    customerType: 'JURIDICO',
    items: [
      {
        productId: 'prod-2',
        name: 'Recarga de Botellón 20L (Retornable)',
        price: 3.50,
        quantity: 50,
        waterLiters: 20,
        subtotal: 175.00,
      },
      {
        productId: 'prod-5',
        name: 'Tapa Antiderrame 55mm con Precinto',
        price: 0.35,
        quantity: 50,
        waterLiters: 0,
        subtotal: 17.50,
      },
    ],
    itemsSummary: '50x Recarga Botellón 20L + 50x Tapa 55mm',
    waterLiters: 1000,
    subtotal: 192.50,
    total: 192.50,
    totalVes: 12021.63,
    bcvRate: 62.45,
    status: 'PAID',
    payment: {
      method: 'TRANSFER',
      methodLabel: 'Transferencia Bancaria',
      bankName: 'Banesco Banco Universal',
      referenceNumber: '948271',
    },
    qrPayload: 'AQUAPURE|FAC-2026-001|J-31245678-0|192.50|12021.63|2026-02-25',
  },
  {
    id: 'FAC-2026-002',
    invoiceNo: 'FAC-2026-002',
    date: '2026-02-24',
    dateTime: new Date(Date.now() - 3600000 * 20).toISOString(),
    customer: 'Minimarket Los Andes',
    customerDoc: 'J-40123987-1',
    customerAddress: 'Calle Real de San Antonio, Local 12',
    customerPhone: '+58 424 987 6543',
    customerEmail: 'compras@losandesmarket.com',
    customerType: 'JURIDICO',
    items: [
      {
        productId: 'prod-2',
        name: 'Recarga de Botellón 20L (Retornable)',
        price: 3.50,
        quantity: 20,
        waterLiters: 20,
        subtotal: 70.00,
      },
      {
        productId: 'prod-3',
        name: 'Botella de Agua Purificada 5L',
        price: 2.00,
        quantity: 10,
        waterLiters: 5,
        subtotal: 20.00,
      },
    ],
    itemsSummary: '20x Recarga 20L + 10x Botella 5L',
    waterLiters: 450,
    subtotal: 90.00,
    total: 90.00,
    totalVes: 5620.50,
    bcvRate: 62.45,
    status: 'PAID',
    payment: {
      method: 'PAGO_MOVIL',
      methodLabel: 'Pago Móvil Interbancario',
      bankName: 'Banco de Venezuela',
      referenceNumber: '584930',
    },
    qrPayload: 'AQUAPURE|FAC-2026-002|J-40123987-1|90.00|5620.50|2026-02-24',
  },
  {
    id: 'FAC-2026-003',
    invoiceNo: 'FAC-2026-003',
    date: '2026-02-24',
    dateTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    customer: 'Carlos Mendoza',
    customerDoc: 'V-18945120',
    customerAddress: 'Urb. Los Pinos, Vereda 5, Casa #14',
    customerPhone: '+58 412 555 7890',
    customerEmail: 'carlos.mendoza@gmail.com',
    customerType: 'NATURAL',
    items: [
      {
        productId: 'prod-2',
        name: 'Recarga de Botellón 20L (Retornable)',
        price: 3.50,
        quantity: 2,
        waterLiters: 20,
        subtotal: 7.00,
      },
      {
        productId: 'prod-8',
        name: 'Café Expreso Italiano',
        price: 1.50,
        quantity: 1,
        waterLiters: 0.2,
        subtotal: 1.50,
      },
    ],
    itemsSummary: '2x Recarga 20L + 1x Café Expreso',
    waterLiters: 40.2,
    subtotal: 8.50,
    total: 8.50,
    totalVes: 530.83,
    bcvRate: 62.45,
    status: 'PAID',
    payment: {
      method: 'CASH_USD',
      methodLabel: 'Efectivo Dólares ($)',
      receivedAmount: 10.00,
      changeUsd: 1.50,
      changeVes: 93.68,
    },
    qrPayload: 'AQUAPURE|FAC-2026-003|V-18945120|8.50|530.83|2026-02-24',
  },
];

const STORAGE_KEY = 'aquapure_sales_invoices_v3';

export const useSalesStore = defineStore('sales', () => {
  const invoices = ref<SaleInvoice[]>([...DEFAULT_SALES]);

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        invoices.value = JSON.parse(stored);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices.value));
    } catch {
      // ignore
    }
  };

  const totalSalesAmount = computed(() => {
    return invoices.value.reduce((acc, inv) => acc + inv.total, 0);
  });

  const totalWaterDispensed = computed(() => {
    return invoices.value.reduce((acc, inv) => acc + (inv.waterLiters || 0), 0);
  });

  const paidSales = computed(() => {
    return invoices.value.filter((i) => i.status === 'PAID');
  });

  const paidSalesAmount = computed(() => {
    return paidSales.value.reduce((acc, i) => acc + i.total, 0);
  });

  const pendingSales = computed(() => {
    return invoices.value.filter((i) => i.status === 'PENDIENTE' || i.status === 'PENDING');
  });

  const pendingSalesAmount = computed(() => {
    return pendingSales.value.reduce((acc, i) => acc + i.total, 0);
  });

  /**
   * Process a complete sale from the POS or Invoicing module
   */
  const processSale = (params: {
    customer: {
      type: 'NATURAL' | 'JURIDICO';
      docType: 'V' | 'E' | 'J' | 'G';
      docNumber: string;
      name: string;
      address: string;
      phone?: string;
      email?: string;
    };
    items: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      waterLiters: number;
    }[];
    payment: PaymentDetails;
    status: 'PAID' | 'PENDING';
  }): SaleInvoice => {
    const tanksStore = useTanksStore();
    const inventoryStore = useInventoryStore();
    const customersStore = useCustomersStore();
    const currencyStore = useCurrencyStore();

    // 1. Register / Update Customer
    const cust = customersStore.registerOrUpdateCustomer({
      type: params.customer.type,
      docType: params.customer.docType,
      docNumber: params.customer.docNumber,
      name: params.customer.name,
      address: params.customer.address,
      phone: params.customer.phone,
      email: params.customer.email,
    });

    // 2. Format Items and Totals
    const formattedItems: SaleItem[] = params.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      waterLiters: i.waterLiters || 0,
      subtotal: Math.round(i.price * i.quantity * 100) / 100,
    }));

    const subtotal = formattedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const totalWater = formattedItems.reduce((acc, item) => acc + item.waterLiters * item.quantity, 0);
    const bcvRate = currencyStore.usdRate;
    const totalVes = currencyStore.toVes(subtotal);

    const nextNumber = invoices.value.length + 1;
    const invoiceNo = `FAC-2026-00${nextNumber}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const itemsSummary = formattedItems
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(' + ');

    // 3. Deduct Water from Master Consolidated Tank (+ calculate wash waste)
    if (totalWater > 0) {
      tanksStore.deductLiters(
        totalWater,
        undefined,
        `Venta/Factura ${invoiceNo} (${cust.name})`
      );
    }

    // 4. Deduct Stock from Inventory
    inventoryStore.deductStock(
      formattedItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );

    // 5. QR Validation Payload
    const qrPayload = `AQUAPURE|${invoiceNo}|${cust.fullDoc}|${subtotal.toFixed(
      2
    )}|${totalVes.toFixed(2)}|${dateStr}|${bcvRate.toFixed(2)}`;

    // 6. Create Record
    const newInvoice: SaleInvoice = {
      id: invoiceNo,
      invoiceNo,
      date: dateStr,
      dateTime: new Date().toISOString(),
      customer: cust.name,
      customerDoc: cust.fullDoc,
      customerAddress: cust.address,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      customerType: cust.type,
      items: formattedItems,
      itemsSummary,
      waterLiters: totalWater,
      subtotal,
      total: subtotal,
      totalVes,
      bcvRate,
      status: params.status,
      payment: params.payment,
      qrPayload,
    };

    invoices.value.unshift(newInvoice);
    saveToStorage();

    return newInvoice;
  };

  const markInvoiceAsPaid = (invoiceId: string, paymentDetails?: PaymentDetails) => {
    const inv = invoices.value.find((i) => i.id === invoiceId || i.invoiceNo === invoiceId);
    if (inv) {
      inv.status = 'PAID';
      if (paymentDetails) {
        inv.payment = paymentDetails;
      }
      saveToStorage();
    }
  };

  const deleteInvoice = (invoiceId: string) => {
    invoices.value = invoices.value.filter((i) => i.id !== invoiceId && i.invoiceNo !== invoiceId);
    saveToStorage();
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    invoices,
    totalSalesAmount,
    totalWaterDispensed,
    paidSales,
    paidSalesAmount,
    pendingSales,
    pendingSalesAmount,
    processSale,
    markInvoiceAsPaid,
    deleteInvoice,
    init,
  };
});
