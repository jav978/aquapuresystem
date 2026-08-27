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

export type InvoiceStatus = 'PAID' | 'PENDING' | 'CANCELLED' | 'REFUNDED';

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

export interface AuditLogEntry {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  action: 'TRANSACTION_EDIT' | 'TRANSACTION_CANCEL' | 'ITEM_RETURN';
  actionLabel: string;
  authorizedBy: string;
  operator: string;
  timestamp: string;
  reason: string;
  previousState: {
    total: number;
    totalVes: number;
    paymentMethod: string;
    receivedAmount?: number;
    referenceNumber?: string;
    itemsSummary?: string;
    status?: InvoiceStatus;
    waterLiters?: number;
  };
  newState: {
    total: number;
    totalVes: number;
    paymentMethod: string;
    receivedAmount?: number;
    referenceNumber?: string;
    itemsSummary?: string;
    status?: InvoiceStatus;
    waterLiters?: number;
  };
  details?: string;
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
  status: InvoiceStatus;
  payment: PaymentDetails;
  qrPayload: string;
  hasAuditLogs?: boolean;
  idempotencyKey?: string;
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
const AUDIT_STORAGE_KEY = 'aquapure_sales_audit_logs_v1';
const SUPERVISOR_PIN_KEY = 'aquapure_supervisor_pin_v1';

export const useSalesStore = defineStore('sales', () => {
  const invoices = ref<SaleInvoice[]>([...DEFAULT_SALES]);
  const auditLogs = ref<AuditLogEntry[]>([]);
  const supervisorPin = ref<string>('1234'); // Default supervisor PIN

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        invoices.value = JSON.parse(stored);
      } else {
        saveToStorage();
      }

      const storedAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (storedAudit) {
        auditLogs.value = JSON.parse(storedAudit);
      }

      const storedPin = localStorage.getItem(SUPERVISOR_PIN_KEY);
      if (storedPin) {
        supervisorPin.value = storedPin;
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

  const saveAuditToStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLogs.value));
    } catch {
      // ignore
    }
  };

  const savePinToStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SUPERVISOR_PIN_KEY, supervisorPin.value);
    } catch {
      // ignore
    }
  };

  const verifySupervisorPin = (pin: string): boolean => {
    return pin.trim() === supervisorPin.value.trim();
  };

  const setSupervisorPin = (newPin: string): boolean => {
    if (newPin && newPin.trim().length >= 4) {
      supervisorPin.value = newPin.trim();
      savePinToStorage();
      return true;
    }
    return false;
  };

  const totalSalesAmount = computed(() => {
    return invoices.value
      .filter((inv) => inv.status !== 'CANCELLED' && inv.status !== 'REFUNDED')
      .reduce((acc, inv) => acc + inv.total, 0);
  });

  const totalWaterDispensed = computed(() => {
    return invoices.value
      .filter((inv) => inv.status !== 'CANCELLED')
      .reduce((acc, inv) => acc + (inv.waterLiters || 0), 0);
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

  const cancelledSales = computed(() => {
    return invoices.value.filter((i) => i.status === 'CANCELLED' || i.status === 'REFUNDED');
  });

  const cancelledSalesAmount = computed(() => {
    return cancelledSales.value.reduce((acc, i) => acc + i.total, 0);
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
    status: InvoiceStatus;
    idempotencyKey?: string;
  }): SaleInvoice => {
    // 0. Idempotency Check: if this exact transaction was already committed, return existing
    if (params.idempotencyKey) {
      const existing = invoices.value.find((inv) => inv.idempotencyKey === params.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

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
      hasAuditLogs: false,
      idempotencyKey: params.idempotencyKey,
    };

    invoices.value.unshift(newInvoice);
    saveToStorage();

    return newInvoice;
  };

  /**
   * Edit/Correct an existing invoice (requires supervisor PIN)
   */
  const editInvoice = (params: {
    invoiceId: string;
    supervisorPin: string;
    reason: string;
    operator?: string;
    updatedCustomer?: {
      name?: string;
      docNumber?: string;
      address?: string;
      phone?: string;
      email?: string;
    };
    updatedPayment?: {
      method?: PaymentMethodType;
      methodLabel?: string;
      receivedAmount?: number;
      bankName?: string;
      referenceNumber?: string;
      authCode?: string;
    };
    updatedItems?: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      waterLiters: number;
    }[];
    newStatus?: InvoiceStatus;
  }): { success: boolean; error?: string; invoice?: SaleInvoice; audit?: AuditLogEntry } => {
    if (!verifySupervisorPin(params.supervisorPin)) {
      return { success: false, error: 'Clave / PIN de Supervisor inválido' };
    }

    const inv = invoices.value.find((i) => i.id === params.invoiceId || i.invoiceNo === params.invoiceId);
    if (!inv) {
      return { success: false, error: 'Factura no encontrada' };
    }

    const currencyStore = useCurrencyStore();
    const tanksStore = useTanksStore();
    const inventoryStore = useInventoryStore();

    const previousState = {
      total: inv.total,
      totalVes: inv.totalVes,
      paymentMethod: inv.payment.methodLabel || inv.payment.method,
      receivedAmount: inv.payment.receivedAmount,
      referenceNumber: inv.payment.referenceNumber,
      itemsSummary: inv.itemsSummary,
      status: inv.status,
      waterLiters: inv.waterLiters,
    };

    // 1. Update customer if provided
    if (params.updatedCustomer) {
      if (params.updatedCustomer.name) inv.customer = params.updatedCustomer.name;
      if (params.updatedCustomer.docNumber) inv.customerDoc = params.updatedCustomer.docNumber;
      if (params.updatedCustomer.address) inv.customerAddress = params.updatedCustomer.address;
      if (params.updatedCustomer.phone !== undefined) inv.customerPhone = params.updatedCustomer.phone;
      if (params.updatedCustomer.email !== undefined) inv.customerEmail = params.updatedCustomer.email;
    }

    // 2. Update items and inventory/tanks if items provided
    if (params.updatedItems && params.updatedItems.length > 0) {
      // Revert previous items stock/water
      if (inv.items && inv.items.length > 0) {
        inventoryStore.restockItems(inv.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      }
      const previousWater = inv.waterLiters || 0;

      // Apply new items
      const formattedItems: SaleItem[] = params.updatedItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        waterLiters: i.waterLiters || 0,
        subtotal: Math.round(i.price * i.quantity * 100) / 100,
      }));

      const newSubtotal = formattedItems.reduce((acc, item) => acc + item.subtotal, 0);
      const newTotalWater = formattedItems.reduce((acc, item) => acc + item.waterLiters * item.quantity, 0);
      const newTotalVes = currencyStore.toVes(newSubtotal);

      // Apply new stock deductions
      inventoryStore.deductStock(formattedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })));

      // Water difference
      const waterDiff = newTotalWater - previousWater;
      if (waterDiff > 0) {
        tanksStore.deductLiters(waterDiff, undefined, `Ajuste en Factura ${inv.invoiceNo}`);
      } else if (waterDiff < 0) {
        tanksStore.revertLiters(Math.abs(waterDiff), true, `Ajuste en Factura ${inv.invoiceNo}`);
      }

      inv.items = formattedItems;
      inv.itemsSummary = formattedItems.map((i) => `${i.quantity}x ${i.name}`).join(' + ');
      inv.subtotal = newSubtotal;
      inv.total = newSubtotal;
      inv.totalVes = newTotalVes;
      inv.waterLiters = newTotalWater;
    }

    // 3. Update payment if provided
    if (params.updatedPayment) {
      if (params.updatedPayment.method) inv.payment.method = params.updatedPayment.method;
      if (params.updatedPayment.methodLabel) inv.payment.methodLabel = params.updatedPayment.methodLabel;
      if (params.updatedPayment.receivedAmount !== undefined) inv.payment.receivedAmount = params.updatedPayment.receivedAmount;
      if (params.updatedPayment.bankName !== undefined) inv.payment.bankName = params.updatedPayment.bankName;
      if (params.updatedPayment.referenceNumber !== undefined) inv.payment.referenceNumber = params.updatedPayment.referenceNumber;
      if (params.updatedPayment.authCode !== undefined) inv.payment.authCode = params.updatedPayment.authCode;

      // Recalculate change if cash
      if (inv.payment.method === 'CASH_USD' && inv.payment.receivedAmount !== undefined) {
        inv.payment.changeUsd = Math.max(0, inv.payment.receivedAmount - inv.total);
        inv.payment.changeVes = currencyStore.toVes(inv.payment.changeUsd);
      } else if (inv.payment.method === 'CASH_VES' && inv.payment.receivedAmount !== undefined) {
        const diffVes = Math.max(0, inv.payment.receivedAmount - inv.totalVes);
        inv.payment.changeVes = diffVes;
        inv.payment.changeUsd = currencyStore.toUsd(diffVes);
      }
    }

    // 4. Update status if provided
    if (params.newStatus) {
      inv.status = params.newStatus;
    }

    inv.hasAuditLogs = true;

    const newState = {
      total: inv.total,
      totalVes: inv.totalVes,
      paymentMethod: inv.payment.methodLabel || inv.payment.method,
      receivedAmount: inv.payment.receivedAmount,
      referenceNumber: inv.payment.referenceNumber,
      itemsSummary: inv.itemsSummary,
      status: inv.status,
      waterLiters: inv.waterLiters,
    };

    // 5. Create Audit Entry
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      action: 'TRANSACTION_EDIT',
      actionLabel: 'Corrección / Modificación de Transacción',
      authorizedBy: 'Supervisor / Administrador',
      operator: params.operator || 'Operador en Caja',
      timestamp: new Date().toISOString(),
      reason: params.reason,
      previousState,
      newState,
      details: `Factura ${inv.invoiceNo} corregida con éxito. Motivo: ${params.reason}`,
    };

    auditLogs.value.unshift(auditEntry);
    saveAuditToStorage();
    saveToStorage();

    return { success: true, invoice: inv, audit: auditEntry };
  };

  /**
   * Cancel an invoice / Process return (requires supervisor PIN)
   */
  const cancelInvoice = (params: {
    invoiceId: string;
    supervisorPin: string;
    reason: string;
    operator?: string;
    returnWaterToTank?: boolean;
    restockPhysicalItems?: boolean;
  }): { success: boolean; error?: string; invoice?: SaleInvoice; audit?: AuditLogEntry } => {
    if (!verifySupervisorPin(params.supervisorPin)) {
      return { success: false, error: 'Clave / PIN de Supervisor inválido' };
    }

    const inv = invoices.value.find((i) => i.id === params.invoiceId || i.invoiceNo === params.invoiceId);
    if (!inv) {
      return { success: false, error: 'Factura no encontrada' };
    }

    if (inv.status === 'CANCELLED') {
      return { success: false, error: 'Esta factura ya se encuentra anulada' };
    }

    const previousState = {
      total: inv.total,
      totalVes: inv.totalVes,
      paymentMethod: inv.payment.methodLabel || inv.payment.method,
      receivedAmount: inv.payment.receivedAmount,
      referenceNumber: inv.payment.referenceNumber,
      itemsSummary: inv.itemsSummary,
      status: inv.status,
      waterLiters: inv.waterLiters,
    };

    const tanksStore = useTanksStore();
    const inventoryStore = useInventoryStore();

    // 1. Revert Water
    if (inv.waterLiters > 0) {
      tanksStore.revertLiters(
        inv.waterLiters,
        params.returnWaterToTank ?? false,
        `Anulación Factura ${inv.invoiceNo}: ${params.reason}`
      );
    }

    // 2. Restock physical items
    if (params.restockPhysicalItems !== false && inv.items && inv.items.length > 0) {
      inventoryStore.restockItems(
        inv.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
    }

    // 3. Mark invoice as cancelled
    inv.status = 'CANCELLED';
    inv.hasAuditLogs = true;

    const newState = {
      total: 0,
      totalVes: 0,
      paymentMethod: inv.payment.methodLabel || inv.payment.method,
      receivedAmount: inv.payment.receivedAmount,
      referenceNumber: inv.payment.referenceNumber,
      itemsSummary: inv.itemsSummary,
      status: 'CANCELLED' as InvoiceStatus,
      waterLiters: inv.waterLiters,
    };

    // 4. Create Audit Log
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      action: 'TRANSACTION_CANCEL',
      actionLabel: 'Anulación de Factura / Venta',
      authorizedBy: 'Supervisor / Administrador',
      operator: params.operator || 'Operador en Caja',
      timestamp: new Date().toISOString(),
      reason: params.reason,
      previousState,
      newState,
      details: `Factura ${inv.invoiceNo} anulada. ${
        params.returnWaterToTank ? 'Agua reintegrada al tanque.' : 'Agua declarada como merma/desecho.'
      } ${params.restockPhysicalItems !== false ? 'Inventario restituido.' : ''}`,
    };

    auditLogs.value.unshift(auditEntry);
    saveAuditToStorage();
    saveToStorage();

    return { success: true, invoice: inv, audit: auditEntry };
  };

  const getInvoiceAuditLogs = (invoiceId: string): AuditLogEntry[] => {
    return auditLogs.value.filter(
      (log) => log.invoiceId === invoiceId || log.invoiceNo === invoiceId
    );
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
    auditLogs,
    supervisorPin,
    verifySupervisorPin,
    setSupervisorPin,
    totalSalesAmount,
    totalWaterDispensed,
    paidSales,
    paidSalesAmount,
    pendingSales,
    pendingSalesAmount,
    cancelledSales,
    cancelledSalesAmount,
    processSale,
    editInvoice,
    cancelInvoice,
    getInvoiceAuditLogs,
    markInvoiceAsPaid,
    deleteInvoice,
    loadFromStorage,
    saveToStorage,
    init,
  };
});
