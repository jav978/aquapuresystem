<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
            Módulo Comercial & Despacho
          </span>
          <span class="text-xs text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-billing-green">account_balance</span>
            Tasa BCV: <strong class="text-billing-green font-mono">Bs. {{ currencyStore.formattedRate }}</strong>
          </span>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Gestión de Ventas</h2>
        <p class="text-sm text-on-surface-variant mt-0.5">Control de transacciones, pedidos y deducción automática de agua en tanques.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button
          @click="openNewSaleModal"
          class="flex-1 md:flex-none bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">add_shopping_cart</span>
          Nueva Venta
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

    <!-- KPIs Bento Grid with Dual Currency -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Ventas Totales</span>
          <span class="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">payments</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">${{ formatMoney(totalSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(totalSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
            <span class="material-symbols-outlined text-sm text-billing-green">trending_up</span>
            {{ sales.length }} transacciones registradas
          </p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Volumen Despachado</span>
          <span class="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">water_drop</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-cyan-400 tracking-tight">{{ totalLitersDispensed }} L</h3>
          <p class="text-xs text-on-surface-variant mt-2">Deducidos de tanques IoT</p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Estado de Cobros</span>
          <span class="p-2.5 bg-billing-green/10 text-billing-green rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">receipt</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-billing-green tracking-tight">${{ formatMoney(paidSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(paidSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-billing-green">check_circle</span>
            {{ paidSalesCount }} pagadas / {{ sales.length - paidSalesCount }} pendientes
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
          placeholder="Buscar por Nº de Factura, Cliente o Producto..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="statusFilter"
          class="bg-surface-container border-0 text-on-surface text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
        >
          <option value="">Todos los Estados</option>
          <option value="PAID">Pagados</option>
          <option value="PENDING">Pendientes</option>
        </select>

        <span class="text-xs px-3 py-1.5 bg-surface-container rounded-xl text-on-surface-variant font-bold shadow-sm">
          {{ filteredSales.length }} Ventas
        </span>
      </div>
    </div>

    <!-- Ventas Recientes Table with Dual Currency -->
    <div class="card-elevated overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Nº Factura</th>
              <th class="py-4 px-6">Cliente</th>
              <th class="py-4 px-6">Productos</th>
              <th class="py-4 px-6 text-center">Volumen Agua</th>
              <th class="py-4 px-6 text-right">Total ($ USD)</th>
              <th class="py-4 px-6 text-right">Equivalente (Bs. BCV)</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr v-for="sale in filteredSales" :key="sale.invoiceNo" class="hover:bg-surface-container-high/40 transition-colors">
              <td class="py-4 px-6 text-sm font-bold text-primary font-mono">{{ sale.invoiceNo }}</td>
              <td class="py-4 px-6 text-sm text-on-surface font-semibold">{{ sale.customer }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ sale.items }}</td>
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                  <span class="material-symbols-outlined text-xs">water_drop</span>
                  {{ sale.waterLiters || tanksStore.parseLitersFromItemText(sale.items) }} L
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-on-surface text-right font-extrabold font-mono text-billing-green">${{ formatMoney(sale.total) }}</td>
              <td class="py-4 px-6 text-sm text-right font-mono font-bold text-on-surface">
                {{ currencyStore.formatVes(currencyStore.toVes(sale.total)) }}
              </td>
              <td class="py-4 px-6 text-center">
                <span
                  v-if="sale.status === 'PAID'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/15 text-billing-green px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> Pagado
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
                    @click="openDetails(sale)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Ver Detalle"
                  >
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button
                    @click="deleteSale(sale)"
                    class="p-2 text-on-surface-variant hover:text-error-red transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Eliminar Venta"
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
          Mostrando {{ filteredSales.length }} de {{ sales.length }} transacciones
        </span>
      </div>
    </div>

    <!-- Sale Details Modal with Dual Currency -->
    <div v-if="selectedSale" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="selectedSale = null"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Detalle de Transacción</h4>
            <p class="text-xs text-primary font-mono">{{ selectedSale.invoiceNo }}</p>
          </div>
          <button @click="selectedSale = null" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Cliente:</span>
            <span class="text-on-surface font-semibold">{{ selectedSale.customer }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Productos:</span>
            <span class="text-on-surface font-semibold">{{ selectedSale.items }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Agua Deducida:</span>
            <span class="text-cyan-400 font-mono font-bold">{{ selectedSale.waterLiters || tanksStore.parseLitersFromItemText(selectedSale.items) }} L</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Tasa Oficial BCV:</span>
            <span class="text-billing-green font-mono font-bold">Bs. {{ currencyStore.formattedRate }} / USD</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Estado de Pago:</span>
            <span :class="selectedSale.status === 'PAID' ? 'text-billing-green' : 'text-admin-gold'" class="font-bold">
              {{ selectedSale.status === 'PAID' ? 'Pagado' : 'Pendiente' }}
            </span>
          </div>

          <!-- Dual Currency Total -->
          <div class="p-3.5 rounded-2xl bg-surface-container/60 space-y-1">
            <div class="flex justify-between text-base font-bold">
              <span class="text-on-surface">Total en Dólares:</span>
              <span class="text-primary font-mono">${{ formatMoney(selectedSale.total) }} USD</span>
            </div>
            <div class="flex justify-between text-sm font-bold">
              <span class="text-on-surface-variant">Total en Bolívares:</span>
              <span class="text-billing-green font-mono">{{ currencyStore.formatVes(currencyStore.toVes(selectedSale.total)) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
          <button
            @click="selectedSale = null"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            Cerrar
          </button>
          <button
            @click="printInvoice"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary flex items-center gap-2 glow-cyan-hover cursor-pointer active:scale-95"
          >
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>

    <!-- New Sale Modal with Strict Validation & BCV Dual Currency Conversion -->
    <div v-if="showSaleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showSaleModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Registrar Nueva Venta</h4>
            <p class="text-xs text-on-surface-variant">El volumen de agua se deducirá automáticamente del tanque seleccionado</p>
          </div>
          <button @click="showSaleModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Validation Error Alert -->
        <div v-if="formError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ formError }}</span>
        </div>

        <form @submit.prevent="createSale" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Cliente *</label>
            <input
              v-model="newSaleForm.customer"
              type="text"
              required
              placeholder="Nombre del cliente o razón social"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Detalle de Productos / Pedido *</label>
            <input
              v-model="newSaleForm.items"
              type="text"
              required
              placeholder="Ej: 10x Botellón 20L"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
            <!-- Quick Presets -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="preset in productPresets"
                :key="preset.label"
                type="button"
                @click="applyPreset(preset)"
                class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-container-high hover:bg-primary/20 text-on-surface hover:text-primary transition-colors cursor-pointer shadow-sm"
              >
                + {{ preset.label }} (${{ preset.price }})
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tanque de Suministro *</label>
              <select
                v-model="newSaleForm.tankId"
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
                v-model="newSaleForm.status"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="PAID">Pagado</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Monto Total ($ USD) *</label>
              <input
                v-model.number="newSaleForm.total"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-bold shadow-sm font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Agua Deducida</label>
              <div class="h-10 px-4 py-2 bg-surface-container-high/60 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-cyan-400 shadow-sm">
                <span>{{ tanksStore.parseLitersFromItemText(newSaleForm.items) }} L</span>
                <span class="material-symbols-outlined text-sm">water_drop</span>
              </div>
            </div>
          </div>

          <!-- Live Conversion to Bolívares -->
          <div class="p-3.5 rounded-2xl bg-surface-container-high/40 flex items-center justify-between text-xs font-mono">
            <div>
              <span class="text-on-surface-variant">Equivalente en Bolívares (BCV):</span>
              <p class="text-base font-extrabold text-billing-green mt-0.5">
                {{ currencyStore.formatVes(currencyStore.toVes(newSaleForm.total || 0)) }}
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
              @click="showSaleModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              Completar Venta
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
const showSaleModal = ref(false);
const selectedSale = ref<any>(null);
const formError = ref<string | null>(null);

const productPresets = [
  { label: 'Botellón 20L', price: 4.50, text: '1x Botellón 20L' },
  { label: '5x Botellón 20L', price: 22.50, text: '5x Botellón 20L' },
  { label: '10x Botellón 20L', price: 45.00, text: '10x Botellón 20L' },
  { label: 'Botella 5L', price: 2.00, text: '1x Botella 5L' },
];

const newSaleForm = reactive({
  customer: '',
  items: '10x Botellón 20L',
  total: 45.00,
  status: 'PAID' as 'PAID' | 'PENDING',
  tankId: 'tank-1',
});

const sales = ref([
  {
    invoiceNo: 'INV-2026-001',
    customer: 'AquaExpress Delivery',
    items: '50x Botellón 20L',
    waterLiters: 1000,
    total: 225.00,
    status: 'PAID',
  },
  {
    invoiceNo: 'INV-2026-002',
    customer: 'Minimarket Los Andes',
    items: '20x Botellón 20L + 10x Botella 5L',
    waterLiters: 450,
    total: 110.00,
    status: 'PAID',
  },
  {
    invoiceNo: 'INV-2026-003',
    customer: 'Gimnasio PowerFit',
    items: '15x Botellón 20L',
    waterLiters: 300,
    total: 67.50,
    status: 'PENDING',
  },
  {
    invoiceNo: 'INV-2026-004',
    customer: 'Hotel Bella Vista',
    items: '100x Botellón 20L',
    waterLiters: 2000,
    total: 450.00,
    status: 'PAID',
  },
]);

const totalSalesAmount = computed(() => {
  return sales.value.reduce((acc, sale) => acc + sale.total, 0);
});

const totalLitersDispensed = computed(() => {
  return sales.value.reduce((acc, sale) => acc + (sale.waterLiters || tanksStore.parseLitersFromItemText(sale.items)), 0);
});

const paidSalesCount = computed(() => {
  return sales.value.filter(s => s.status === 'PAID').length;
});

const paidSalesAmount = computed(() => {
  return sales.value.filter(s => s.status === 'PAID').reduce((acc, s) => acc + s.total, 0);
});

const filteredSales = computed(() => {
  return sales.value.filter(sale => {
    const matchSearch =
      !searchQuery.value.trim() ||
      sale.invoiceNo.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
      sale.customer.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
      sale.items.toLowerCase().includes(searchQuery.value.toLowerCase().trim());
    const matchStatus = !statusFilter.value || sale.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const formatMoney = (val: number): string => {
  return (val || 0).toFixed(2);
};

const openNewSaleModal = () => {
  formError.value = null;
  newSaleForm.customer = '';
  newSaleForm.items = '10x Botellón 20L';
  newSaleForm.total = 45.00;
  newSaleForm.status = 'PAID';
  newSaleForm.tankId = tanksStore.tanks[0]?.id || 'tank-1';
  showSaleModal.value = true;
};

const applyPreset = (preset: typeof productPresets[0]) => {
  newSaleForm.items = preset.text;
  newSaleForm.total = preset.price;
};

const openDetails = (sale: any) => {
  selectedSale.value = sale;
};

const printInvoice = () => {
  const vesAmount = currencyStore.formatVes(currencyStore.toVes(selectedSale.value?.total || 0));
  toast.success(
    'Comprobante Listo',
    `Comprobante para ${selectedSale.value?.invoiceNo} listo para imprimir ($${formatMoney(selectedSale.value?.total)} / ${vesAmount}).`
  );
  selectedSale.value = null;
};

const deleteSale = (sale: any) => {
  sales.value = sales.value.filter(s => s.invoiceNo !== sale.invoiceNo);
  toast.deleteSuccess('Venta', `Venta ${sale.invoiceNo} eliminada.`);
};

const createSale = () => {
  formError.value = null;
  const cleaned = sanitizeFormData(newSaleForm);

  const custError = validateRequired(cleaned.customer, 'El cliente');
  if (custError) {
    formError.value = custError;
    return;
  }

  const itemsError = validateRequired(cleaned.items, 'Los productos / pedido');
  if (itemsError) {
    formError.value = itemsError;
    return;
  }

  const totalError = validatePositiveNumber(cleaned.total, 'El monto total');
  if (totalError) {
    formError.value = totalError;
    return;
  }

  const nextNumber = sales.value.length + 1;
  const invoiceNo = `INV-2026-00${nextNumber}`;
  const litersToDeduct = tanksStore.parseLitersFromItemText(cleaned.items);

  // Deduct water liters from Tank Store
  const deductionResult = tanksStore.deductLiters(litersToDeduct, cleaned.tankId, `Venta ${invoiceNo} (${cleaned.customer})`);

  const numTotal = Number(cleaned.total);
  const vesTotal = currencyStore.formatVes(currencyStore.toVes(numTotal));

  sales.value.unshift({
    invoiceNo,
    customer: cleaned.customer,
    items: cleaned.items,
    waterLiters: litersToDeduct,
    total: numTotal,
    status: cleaned.status,
  });

  showSaleModal.value = false;
  toast.createSuccess(
    'Venta',
    `Venta ${invoiceNo} registrada por $${formatMoney(numTotal)} (${vesTotal}). Se descontaron ${deductionResult.dispensed}L de ${deductionResult.tankName}.`
  );
};
</script>
