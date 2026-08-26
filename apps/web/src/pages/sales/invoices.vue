<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
            Módulo Comercial & Facturación
          </span>
          <span class="text-xs text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-billing-green">account_balance</span>
            Tasa BCV: <strong class="text-billing-green font-mono">Bs. {{ currencyStore.formattedRate }}</strong>
          </span>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Facturación & Comprobantes Fiscales</h2>
        <p class="text-sm text-on-surface-variant mt-0.5">Control de facturas comerciales, clientes (Naturales y Jurídicos), conciliación bancaria y códigos QR fiscales.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button
          @click="openEmitModal"
          class="flex-1 md:flex-none bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">add_circle</span>
          Emitir Factura
        </button>
      </div>
    </div>

    <!-- Navigation Sub-Tabs -->
    <div class="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
      <NuxtLink
        to="/sales"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        :class="route.path === '/sales' ? 'bg-primary/15 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
      >
        <span class="material-symbols-outlined text-base">point_of_sale</span>
        Ventas y Pedidos
      </NuxtLink>
      <NuxtLink
        to="/sales/invoices"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        :class="route.path === '/sales/invoices' ? 'bg-primary/15 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
      >
        <span class="material-symbols-outlined text-base">receipt_long</span>
        Facturación ({{ salesStore.invoices.length }})
      </NuxtLink>
    </div>

    <!-- KPIs Dual Currency Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Facturación Total</span>
          <span class="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">receipt_long</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">${{ formatMoney(salesStore.totalSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(salesStore.totalSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ salesStore.invoices.length }} facturas emitidas
          </p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Total Cobrado (Pagado)</span>
          <span class="p-2.5 bg-billing-green/10 text-billing-green rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">check_circle</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-billing-green tracking-tight">${{ formatMoney(salesStore.paidSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(salesStore.paidSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ salesStore.paidSales.length }} comprobantes liquidados
          </p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Por Cobrar (Pendiente)</span>
          <span class="p-2.5 bg-admin-gold/10 text-admin-gold rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">pending</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-admin-gold tracking-tight">${{ formatMoney(salesStore.pendingSalesAmount) }}</h3>
          <p class="text-xs text-admin-gold mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(salesStore.pendingSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ salesStore.pendingSales.length }} facturas por cobrar
          </p>
        </div>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="card-elevated p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por Nº Factura, Cédula/RIF, Cliente o Ref. Bancaria..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="statusFilter"
          class="bg-surface-container border-0 text-on-surface text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
        >
          <option value="">Todos los Estados</option>
          <option value="PAID">Solo Pagadas</option>
          <option value="PENDING">Solo Pendientes</option>
        </select>

        <span class="text-xs px-3 py-1.5 bg-surface-container rounded-xl text-on-surface-variant font-bold shadow-sm">
          {{ filteredInvoices.length }} Facturas
        </span>
      </div>
    </div>

    <!-- Invoices Table with Dual Currency -->
    <div class="card-elevated overflow-hidden flex-1">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Nº Factura</th>
              <th class="py-4 px-6">Fecha</th>
              <th class="py-4 px-6">Cliente / Cédula-RIF</th>
              <th class="py-4 px-6">Detalle de Productos</th>
              <th class="py-4 px-6">Pago & Ref. Bancaria</th>
              <th class="py-4 px-6 text-right">Monto ($ USD)</th>
              <th class="py-4 px-6 text-right">Equivalente (Bs. BCV)</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr v-for="inv in filteredInvoices" :key="inv.id" class="hover:bg-surface-container-high/40 transition-colors">
              <td class="py-4 px-6 text-sm font-bold text-primary font-mono">{{ inv.invoiceNo }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant font-medium">{{ inv.date }}</td>
              <td class="py-4 px-6 text-sm text-on-surface font-semibold">
                {{ inv.customer }}
                <span v-if="inv.customerDoc" class="block text-xs font-mono font-normal text-on-surface-variant">
                  {{ inv.customerDoc }}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ inv.itemsSummary || 'Recarga de Agua' }}</td>
              <td class="py-4 px-6 text-xs text-on-surface-variant">
                <span class="font-bold text-on-surface block">{{ inv.payment?.methodLabel || 'Efectivo' }}</span>
                <span v-if="inv.payment?.referenceNumber" class="font-mono text-primary font-semibold">
                  Ref: {{ inv.payment.referenceNumber }} ({{ inv.payment?.bankName || 'Banco' }})
                </span>
                <span v-else-if="inv.payment?.changeUsd !== undefined && inv.payment.changeUsd > 0" class="text-billing-green font-mono">
                  Vuelto: ${{ inv.payment.changeUsd.toFixed(2) }}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-on-surface text-right font-extrabold font-mono text-billing-green">
                ${{ formatMoney(inv.total) }}
              </td>
              <td class="py-4 px-6 text-sm text-right font-mono font-bold text-on-surface">
                {{ currencyStore.formatVes(inv.totalVes || currencyStore.toVes(inv.total)) }}
              </td>
              <td class="py-4 px-6 text-center">
                <span
                  v-if="inv.status === 'PAID'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/15 text-billing-green px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> Pagada
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-admin-gold/15 text-admin-gold px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-admin-gold animate-pulse"></span> Pendiente
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="inv.status === 'PENDING'"
                    @click="markAsPaid(inv)"
                    class="p-2 text-billing-green hover:bg-surface-container transition-colors rounded-xl cursor-pointer active:scale-95"
                    title="Registrar Cobro / Marcar como Pagada"
                  >
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                  <button
                    @click="viewPrintReceipt(inv)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Ver / Imprimir Comprobante con QR"
                  >
                    <span class="material-symbols-outlined text-lg">receipt_long</span>
                  </button>
                  <button
                    @click="deleteInvoice(inv)"
                    class="p-2 text-on-surface-variant hover:text-error-red transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Eliminar / Anular Factura"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-surface-container-highest/20 text-xs">
        <span class="text-on-surface-variant font-medium">
          Mostrando {{ filteredInvoices.length }} de {{ salesStore.invoices.length }} comprobantes
        </span>
      </div>
    </div>

    <!-- Emit Invoice Modal with Complete Customer & Dual Currency Calculation -->
    <div v-if="showEmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showEmitModal = false"></div>
      <div class="relative glass-card w-full max-w-xl p-6 z-10 animate-in rounded-3xl max-h-[95vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">receipt_long</span>
            <div>
              <h4 class="text-base font-bold text-on-surface">Emitir Nueva Factura Fiscal</h4>
              <p class="text-xs text-on-surface-variant">Registro formal con Cédula/RIF, tasa oficial BCV y QR</p>
            </div>
          </div>
          <button @click="showEmitModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Inline Form Error Alert -->
        <div v-if="emitError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ emitError }}</span>
        </div>

        <form @submit.prevent="emitInvoice" class="space-y-4">
          <!-- Cédula / RIF con Autocompletado -->
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Cédula o RIF del Cliente *</label>
            <div class="flex gap-2">
              <select
                v-model="emitCustomerForm.docType"
                class="bg-surface-container border-0 rounded-xl px-2.5 py-2 text-on-surface text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="V">V-</option>
                <option value="E">E-</option>
                <option value="J">J-</option>
                <option value="G">G-</option>
              </select>
              <input
                v-model="emitCustomerForm.docNumber"
                @input="onInvoiceDocInput"
                type="text"
                required
                placeholder="Número de Cédula o RIF"
                class="flex-1 bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs font-bold font-mono focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre / Razón Social *</label>
            <input
              v-model="emitCustomerForm.name"
              type="text"
              required
              placeholder="Ej: Distribuidora Los Andes C.A."
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Dirección Fiscal / Entrega *</label>
            <input
              v-model="emitCustomerForm.address"
              type="text"
              required
              placeholder="Ej: Av. Las Industrias, Galpón 4"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Concepto / Productos *</label>
            <input
              v-model="emitForm.items"
              type="text"
              required
              placeholder="Ej: 20x Recarga Botellón 20L + 5x Tapa 55mm"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <!-- Currency & Amount inputs -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Monto en $ USD *</label>
              <input
                v-model.number="emitForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-bold shadow-sm font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Estado de Pago *</label>
              <select
                v-model="emitForm.status"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer"
              >
                <option value="PAID">Pagada</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
          </div>

          <!-- Forma de Pago & Conciliación -->
          <div class="p-3 rounded-2xl bg-surface-container/60 space-y-3">
            <label class="block text-xs font-bold text-on-surface">Forma de Pago & Banco Receptor:</label>
            <div class="grid grid-cols-2 gap-3">
              <select
                v-model="emitForm.paymentMethod"
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer"
              >
                <option value="TRANSFER">Transferencia Bancaria</option>
                <option value="PAGO_MOVIL">Pago Móvil</option>
                <option value="CASH_USD">Efectivo Dólares ($)</option>
                <option value="CASH_VES">Efectivo Bolívares (Bs.)</option>
                <option value="POS_CARD">Punto de Venta / Tarjeta</option>
              </select>

              <input
                v-if="emitForm.paymentMethod === 'TRANSFER' || emitForm.paymentMethod === 'PAGO_MOVIL'"
                v-model="emitForm.bankReference"
                type="text"
                placeholder="Nº Referencia Bancaria"
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs font-bold font-mono focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>

          <!-- Live Dynamic Conversion Card -->
          <div class="p-3.5 rounded-2xl bg-surface-container-high/40 flex items-center justify-between text-xs font-mono">
            <div>
              <span class="text-on-surface-variant">Equivalente en Bolívares (BCV):</span>
              <p class="text-base font-extrabold text-billing-green mt-0.5">
                {{ currencyStore.formatVes(currencyStore.toVes(emitForm.amount || 0)) }}
              </p>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-on-surface-variant">Tasa Oficial</span>
              <p class="text-xs font-bold text-on-surface">Bs. {{ currencyStore.formattedRate }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showEmitModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-base">receipt_long</span>
              <span>Emitir & Generar QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Printable Receipt & Fiscal QR Modal -->
    <InvoicePrintModal
      v-if="selectedPrintInvoice"
      v-model="showPrintModal"
      :invoice="selectedPrintInvoice"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCurrencyStore } from '~/stores/currency';
import { useCustomersStore } from '~/stores/customers';
import { useSalesStore, type SaleInvoice, type PaymentMethodType } from '~/stores/sales';
import { useToast } from '~/composables/useToast';
import InvoicePrintModal from '~/components/ui/InvoicePrintModal.vue';
import {
  validateRequired,
  validatePositiveNumber,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const currencyStore = useCurrencyStore();
const customersStore = useCustomersStore();
const salesStore = useSalesStore();
const toast = useToast();

const searchQuery = ref('');
const statusFilter = ref('');
const showEmitModal = ref(false);
const showPrintModal = ref(false);
const selectedPrintInvoice = ref<SaleInvoice | null>(null);
const emitError = ref<string | null>(null);

const emitCustomerForm = reactive({
  type: 'JURIDICO' as 'NATURAL' | 'JURIDICO',
  docType: 'J' as 'V' | 'E' | 'J' | 'G',
  docNumber: '',
  name: '',
  address: '',
  phone: '',
  email: '',
});

const emitForm = reactive({
  items: '20x Recarga Botellón 20L',
  amount: 70.00,
  paymentMethod: 'TRANSFER' as PaymentMethodType,
  bankReference: '',
  status: 'PAID' as 'PAID' | 'PENDING',
});

onMounted(() => {
  customersStore.init();
  salesStore.init();
});

const filteredInvoices = computed(() => {
  return salesStore.invoices.filter((inv) => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) {
      return !statusFilter.value || inv.status === statusFilter.value;
    }
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      (inv.customerDoc && inv.customerDoc.toLowerCase().includes(q)) ||
      (inv.payment?.referenceNumber && inv.payment.referenceNumber.toLowerCase().includes(q)) ||
      (inv.itemsSummary && inv.itemsSummary.toLowerCase().includes(q));

    const matchStatus = !statusFilter.value || inv.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const formatMoney = (val: number): string => {
  return (val || 0).toFixed(2);
};

const openEmitModal = () => {
  emitError.value = null;
  emitCustomerForm.docNumber = '';
  emitCustomerForm.name = '';
  emitCustomerForm.address = '';
  emitForm.items = '20x Recarga Botellón 20L';
  emitForm.amount = 70.00;
  emitForm.paymentMethod = 'TRANSFER';
  emitForm.bankReference = '';
  emitForm.status = 'PAID';
  showEmitModal.value = true;
};

const onInvoiceDocInput = () => {
  if (emitCustomerForm.docNumber.trim().length >= 4) {
    const query = `${emitCustomerForm.docType}-${emitCustomerForm.docNumber.trim()}`;
    const found = customersStore.findCustomer(query);
    if (found) {
      emitCustomerForm.name = found.name;
      emitCustomerForm.address = found.address;
      emitCustomerForm.phone = found.phone || '';
      emitCustomerForm.email = found.email || '';
      emitCustomerForm.type = found.type;
    }
  }
};

const viewPrintReceipt = (inv: SaleInvoice) => {
  selectedPrintInvoice.value = inv;
  showPrintModal.value = true;
};

const markAsPaid = (inv: SaleInvoice) => {
  salesStore.markInvoiceAsPaid(inv.id);
  toast.updateSuccess('Factura', `Factura ${inv.invoiceNo} marcada como Pagada.`);
};

const deleteInvoice = (inv: SaleInvoice) => {
  salesStore.deleteInvoice(inv.id);
  toast.deleteSuccess('Factura', `Factura ${inv.invoiceNo} anulada y eliminada.`);
};

const emitInvoice = () => {
  emitError.value = null;
  const cleanedCustomer = sanitizeFormData(emitCustomerForm);
  const cleanedForm = sanitizeFormData(emitForm);

  const docErr = validateRequired(cleanedCustomer.docNumber, 'La Cédula o RIF');
  if (docErr) {
    emitError.value = docErr;
    return;
  }

  const nameErr = validateRequired(cleanedCustomer.name, 'El Cliente / Razón Social');
  if (nameErr) {
    emitError.value = nameErr;
    return;
  }

  const addrErr = validateRequired(cleanedCustomer.address, 'La Dirección fiscal');
  if (addrErr) {
    emitError.value = addrErr;
    return;
  }

  const itemsErr = validateRequired(cleanedForm.items, 'El concepto / productos');
  if (itemsErr) {
    emitError.value = itemsErr;
    return;
  }

  const amountErr = validatePositiveNumber(cleanedForm.amount, 'El monto total');
  if (amountErr) {
    emitError.value = amountErr;
    return;
  }

  const numAmount = Number(cleanedForm.amount);

  const newInvoice = salesStore.processSale({
    customer: {
      type: cleanedCustomer.type,
      docType: cleanedCustomer.docType,
      docNumber: cleanedCustomer.docNumber,
      name: cleanedCustomer.name,
      address: cleanedCustomer.address,
      phone: cleanedCustomer.phone,
      email: cleanedCustomer.email,
    },
    items: [
      {
        productId: 'custom-prod',
        name: cleanedForm.items,
        price: numAmount,
        quantity: 1,
        waterLiters: 20,
      },
    ],
    payment: {
      method: cleanedForm.paymentMethod,
      methodLabel:
        cleanedForm.paymentMethod === 'TRANSFER'
          ? 'Transferencia Bancaria'
          : cleanedForm.paymentMethod === 'PAGO_MOVIL'
          ? 'Pago Móvil'
          : 'Efectivo',
      bankName: 'Banco de Venezuela',
      referenceNumber: cleanedForm.bankReference.trim(),
    },
    status: cleanedForm.status,
  });

  showEmitModal.value = false;
  const vesAmount = currencyStore.formatVes(newInvoice.totalVes);
  toast.createSuccess(
    'Factura Fiscal',
    `Factura ${newInvoice.invoiceNo} emitida por $${formatMoney(numAmount)} (${vesAmount}).`
  );

  viewPrintReceipt(newInvoice);
};
</script>
