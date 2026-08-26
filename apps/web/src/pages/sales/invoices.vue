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
        <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Facturación & Comprobantes</h2>
        <p class="text-sm text-on-surface-variant mt-0.5">Control de facturas comerciales, cobros en divisas ($ USD) y bolívares (Bs. VES) según tasa oficial BCV.</p>
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
        Facturación
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
          <h3 class="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">${{ formatMoney(totalAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(totalAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ invoices.length }} facturas emitidas
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
          <h3 class="text-3xl md:text-4xl font-extrabold text-billing-green tracking-tight">${{ formatMoney(paidAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(paidAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ paidCount }} comprobantes liquidados
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
          <h3 class="text-3xl md:text-4xl font-extrabold text-admin-gold tracking-tight">${{ formatMoney(pendingAmount) }}</h3>
          <p class="text-xs text-admin-gold mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(pendingAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2">
            {{ pendingCount }} facturas por cobrar
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
          placeholder="Buscar por Nº de Factura o Cliente..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="statusFilter"
          class="bg-surface-container border-0 text-on-surface text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
        >
          <option value="">Todos los Estados</option>
          <option value="PAGADA">Solo Pagadas</option>
          <option value="PENDIENTE">Solo Pendientes</option>
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
              <th class="py-4 px-6">Cliente</th>
              <th class="py-4 px-6">Detalle</th>
              <th class="py-4 px-6 text-right">Monto ($ USD)</th>
              <th class="py-4 px-6 text-right">Equivalente (Bs. BCV)</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr v-for="inv in filteredInvoices" :key="inv.id" class="hover:bg-surface-container-high/40 transition-colors">
              <td class="py-4 px-6 text-sm font-bold text-primary font-mono">{{ inv.id }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant font-medium">{{ inv.date }}</td>
              <td class="py-4 px-6 text-sm text-on-surface font-semibold">{{ inv.customer }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ inv.items || 'Recarga de Agua Purificada' }}</td>
              <td class="py-4 px-6 text-sm text-on-surface text-right font-extrabold font-mono text-billing-green">
                ${{ formatMoney(inv.amount) }}
              </td>
              <td class="py-4 px-6 text-sm text-right font-mono font-bold text-on-surface">
                {{ currencyStore.formatVes(currencyStore.toVes(inv.amount)) }}
              </td>
              <td class="py-4 px-6 text-center">
                <span
                  v-if="inv.status === 'PAGADA'"
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
                    v-if="inv.status === 'PENDIENTE'"
                    @click="markAsPaid(inv)"
                    class="p-2 text-billing-green hover:bg-surface-container transition-colors rounded-xl cursor-pointer active:scale-95"
                    title="Registrar Cobro / Marcar como Pagada"
                  >
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                  <button
                    @click="viewInvoice(inv)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Ver Detalle"
                  >
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button
                    @click="downloadInvoice(inv)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Descargar PDF"
                  >
                    <span class="material-symbols-outlined text-lg">download</span>
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
          Mostrando {{ filteredInvoices.length }} de {{ invoices.length }} comprobantes
        </span>
      </div>
    </div>

    <!-- Invoice Details Modal with Dual Currency Fiscal Breakdown -->
    <div v-if="selectedInvoice" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="selectedInvoice = null"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Comprobante Fiscal Digital</h4>
            <p class="text-xs text-primary font-mono">{{ selectedInvoice.id }}</p>
          </div>
          <button @click="selectedInvoice = null" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Fecha de Emisión:</span>
            <span class="text-on-surface font-semibold">{{ selectedInvoice.date }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Cliente / Empresa:</span>
            <span class="text-on-surface font-semibold">{{ selectedInvoice.customer }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Detalle:</span>
            <span class="text-on-surface font-semibold">{{ selectedInvoice.items || 'Recarga de Agua Purificada' }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Tasa Oficial BCV Aplicada:</span>
            <span class="text-billing-green font-mono font-bold">Bs. {{ currencyStore.formattedRate }} / USD</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Estado de Pago:</span>
            <span :class="selectedInvoice.status === 'PAGADA' ? 'text-billing-green' : 'text-admin-gold'" class="font-bold">
              {{ selectedInvoice.status === 'PAGADA' ? 'Pagada' : 'Pendiente' }}
            </span>
          </div>

          <!-- Dual Currency Total -->
          <div class="p-3.5 rounded-2xl bg-surface-container/60 space-y-1">
            <div class="flex justify-between text-base font-bold">
              <span class="text-on-surface">Total en Dólares:</span>
              <span class="text-primary font-mono">${{ formatMoney(selectedInvoice.amount) }} USD</span>
            </div>
            <div class="flex justify-between text-sm font-bold">
              <span class="text-on-surface-variant">Total en Bolívares:</span>
              <span class="text-billing-green font-mono">{{ currencyStore.formatVes(currencyStore.toVes(selectedInvoice.amount)) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
          <button
            @click="selectedInvoice = null"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            Cerrar
          </button>
          <button
            @click="downloadInvoice(selectedInvoice)"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary flex items-center gap-2 glow-cyan-hover cursor-pointer active:scale-95"
          >
            <span class="material-symbols-outlined text-base">download</span>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Emit Invoice Modal with Dual Currency Calculation -->
    <div v-if="showEmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showEmitModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">receipt_long</span>
            <div>
              <h4 class="text-base font-bold text-on-surface">Emitir Nueva Factura Fiscal</h4>
              <p class="text-xs text-on-surface-variant">Conversión automática en $ USD y Bs. según BCV</p>
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
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Cliente / Razón Social *</label>
            <input
              v-model="emitForm.customer"
              type="text"
              required
              placeholder="Ej: Distribuidora Los Andes C.A."
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Concepto / Productos *</label>
            <input
              v-model="emitForm.items"
              type="text"
              required
              placeholder="Ej: 20x Botellón 20L + 5x Botella 5L"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tanque Suministrador *</label>
              <select
                v-model="emitForm.tankId"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option v-for="t in tanksStore.tanks" :key="t.id" :value="t.id">
                  {{ t.name }} ({{ t.level }}%)
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Estado de Pago *</label>
              <select
                v-model="emitForm.status"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="PAGADA">Pagada</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
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
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Moneda de Pago</label>
              <select
                v-model="emitForm.paymentCurrency"
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="USD">Dólares ($ USD)</option>
                <option value="VES">Bolívares (Pago Móvil / Transf.)</option>
              </select>
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
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              Emitir Comprobante
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useTanksStore } from '~/stores/tanks';
import { useCurrencyStore } from '~/stores/currency';
import { useToast } from '~/composables/useToast';
import {
  validateRequired,
  validatePositiveNumber,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const tanksStore = useTanksStore();
const currencyStore = useCurrencyStore();
const toast = useToast();

const searchQuery = ref('');
const statusFilter = ref('');
const showEmitModal = ref(false);
const selectedInvoice = ref<any>(null);
const emitError = ref<string | null>(null);

const emitForm = reactive({
  customer: '',
  items: '20x Botellón 20L',
  amount: 90.00,
  paymentCurrency: 'USD',
  tankId: 'tank-1',
  status: 'PAGADA' as 'PAGADA' | 'PENDIENTE',
});

const invoices = ref([
  {
    id: 'FAC-2026-001',
    date: '2026-02-25',
    customer: 'AquaExpress Delivery',
    items: '50x Botellón 20L',
    amount: 225.00,
    status: 'PAGADA',
  },
  {
    id: 'FAC-2026-002',
    date: '2026-02-24',
    customer: 'Minimarket Los Andes',
    items: '20x Botellón 20L + 10x Botella 5L',
    amount: 110.00,
    status: 'PAGADA',
  },
  {
    id: 'FAC-2026-003',
    date: '2026-02-24',
    customer: 'Gimnasio PowerFit',
    items: '15x Botellón 20L',
    amount: 67.50,
    status: 'PENDIENTE',
  },
  {
    id: 'FAC-2026-004',
    date: '2026-02-23',
    customer: 'Hotel Bella Vista',
    items: '100x Botellón 20L',
    amount: 450.00,
    status: 'PAGADA',
  },
]);

const totalAmount = computed(() => {
  return invoices.value.reduce((acc, inv) => acc + inv.amount, 0);
});

const paidCount = computed(() => {
  return invoices.value.filter((inv) => inv.status === 'PAGADA').length;
});

const paidAmount = computed(() => {
  return invoices.value
    .filter((inv) => inv.status === 'PAGADA')
    .reduce((acc, inv) => acc + inv.amount, 0);
});

const pendingCount = computed(() => {
  return invoices.value.filter((inv) => inv.status === 'PENDIENTE').length;
});

const pendingAmount = computed(() => {
  return invoices.value
    .filter((inv) => inv.status === 'PENDIENTE')
    .reduce((acc, inv) => acc + inv.amount, 0);
});

const filteredInvoices = computed(() => {
  return invoices.value.filter((inv) => {
    const matchSearch =
      !searchQuery.value.trim() ||
      inv.id.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
      inv.customer.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
      (inv.items && inv.items.toLowerCase().includes(searchQuery.value.toLowerCase().trim()));

    const matchStatus = !statusFilter.value || inv.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const formatMoney = (val: number): string => {
  return (val || 0).toFixed(2);
};

const openEmitModal = () => {
  emitError.value = null;
  emitForm.customer = '';
  emitForm.items = '20x Botellón 20L';
  emitForm.amount = 90.00;
  emitForm.paymentCurrency = 'USD';
  emitForm.tankId = tanksStore.tanks[0]?.id || 'tank-1';
  emitForm.status = 'PAGADA';
  showEmitModal.value = true;
};

const viewInvoice = (inv: any) => {
  selectedInvoice.value = inv;
};

const downloadInvoice = (inv: any) => {
  const vesEquivalent = currencyStore.formatVes(currencyStore.toVes(inv.amount));
  toast.success(
    'Comprobante Generado',
    `Factura ${inv.id} lista para descarga ($${formatMoney(inv.amount)} / ${vesEquivalent}).`
  );
};

const markAsPaid = (inv: any) => {
  inv.status = 'PAGADA';
  toast.updateSuccess('Factura', `Factura ${inv.id} marcada como Pagada.`);
};

const deleteInvoice = (inv: any) => {
  invoices.value = invoices.value.filter((i) => i.id !== inv.id);
  toast.deleteSuccess('Factura', `Factura ${inv.id} anulada y eliminada.`);
};

const emitInvoice = () => {
  emitError.value = null;
  const cleaned = sanitizeFormData(emitForm);

  const customerErr = validateRequired(cleaned.customer, 'El cliente / razón social');
  if (customerErr) {
    emitError.value = customerErr;
    return;
  }

  const itemsErr = validateRequired(cleaned.items, 'El concepto / productos');
  if (itemsErr) {
    emitError.value = itemsErr;
    return;
  }

  const amountErr = validatePositiveNumber(cleaned.amount, 'El monto total');
  if (amountErr) {
    emitError.value = amountErr;
    return;
  }

  const nextNum = invoices.value.length + 1;
  const newId = `FAC-2026-00${nextNum}`;
  const litersToDeduct = tanksStore.parseLitersFromItemText(cleaned.items);

  // Deduct water liters from supply tank
  const deductionResult = tanksStore.deductLiters(
    litersToDeduct,
    cleaned.tankId,
    `Factura ${newId} (${cleaned.customer})`
  );

  const numAmount = Number(cleaned.amount);
  const vesAmount = currencyStore.formatVes(currencyStore.toVes(numAmount));

  invoices.value.unshift({
    id: newId,
    date: new Date().toISOString().split('T')[0],
    customer: cleaned.customer,
    items: cleaned.items,
    amount: numAmount,
    status: cleaned.status,
  });

  showEmitModal.value = false;
  toast.createSuccess(
    'Factura',
    `Factura ${newId} emitida por $${formatMoney(numAmount)} (${vesAmount}). Descontados ${deductionResult.dispensed}L de ${deductionResult.tankName}.`
  );
};
</script>
