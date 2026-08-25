<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
            Módulo Comercial & Facturación
          </span>
          <span class="text-xs text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-primary">water_drop</span>
            Telemetría Activa
          </span>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Gestión de Ventas</h2>
        <p class="text-sm md:text-base text-on-surface-variant mt-0.5">Control de transacciones, pedidos y deducción automática de agua en tanques.</p>
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
    <div class="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
      <NuxtLink
        to="/sales"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        :class="route.path === '/sales' ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
      >
        <span class="material-symbols-outlined text-base">point_of_sale</span>
        Ventas y Pedidos
      </NuxtLink>
      <NuxtLink
        to="/sales/invoices"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        :class="route.path === '/sales/invoices' ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
      >
        <span class="material-symbols-outlined text-base">receipt_long</span>
        Facturación
      </NuxtLink>
    </div>

    <!-- KPIs Bento Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 stagger-children animate-in">
      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-medium text-on-surface-variant">Ventas Totales</span>
          <span class="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">payments</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">${{ formatMoney(totalSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-2 flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            {{ sales.length }} transacciones registradas
          </p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-billing-green/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-medium text-on-surface-variant">Agua Dispensada en Ventas</span>
          <span class="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">water_drop</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">{{ formatMoney(totalDispensedLitersSales) }} L</h3>
          <p class="text-xs text-on-surface-variant mt-2">Deducido de tanques de reserva</p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden sm:col-span-2 lg:col-span-1">
        <div class="absolute top-0 right-0 w-32 h-32 bg-admin-gold/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-medium text-on-surface-variant">Ticket Promedio</span>
          <span class="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">point_of_sale</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">${{ formatMoney(averageTicket) }}</h3>
          <p class="text-xs text-billing-green mt-2 flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            {{ paidSalesCount }} pagadas / {{ sales.length - paidSalesCount }} pendientes
          </p>
        </div>
      </div>
    </div>

    <!-- Ventas Recientes Table -->
    <div class="card-elevated overflow-hidden">
      <div class="p-5 border-b border-outline-variant/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-highest/30">
        <div>
          <h3 class="text-base font-bold text-on-surface">Ventas y Facturas Recientes</h3>
          <p class="text-xs text-on-surface-variant mt-0.5">Listado detallado de transacciones comerciales</p>
        </div>
        <span class="text-xs px-3 py-1 bg-surface-container rounded-full text-on-surface-variant font-medium border border-outline-variant/20">
          Mostrando {{ sales.length }} transacciones
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-outline-variant/40 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Nº Factura</th>
              <th class="py-4 px-6">Cliente</th>
              <th class="py-4 px-6">Productos</th>
              <th class="py-4 px-6 text-center">Volumen Agua</th>
              <th class="py-4 px-6 text-right">Total</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            <tr v-for="sale in sales" :key="sale.invoiceNo" class="hover:bg-surface-container-highest/30 transition-colors">
              <td class="py-4 px-6 text-sm font-semibold text-primary font-mono">{{ sale.invoiceNo }}</td>
              <td class="py-4 px-6 text-sm text-on-surface font-medium">{{ sale.customer }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ sale.items }}</td>
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  <span class="material-symbols-outlined text-xs">water_drop</span>
                  {{ sale.waterLiters || tanksStore.parseLitersFromItemText(sale.items) }} L
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-on-surface text-right font-bold">${{ formatMoney(sale.total) }}</td>
              <td class="py-4 px-6 text-center">
                <span
                  v-if="sale.status === 'PAID'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/15 text-billing-green border border-billing-green/20 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> Pagado
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-admin-gold/15 text-admin-gold border border-admin-gold/20 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-admin-gold animate-pulse"></span> Pendiente
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  @click="openDetails(sale)"
                  class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container cursor-pointer active:scale-95"
                  title="Ver Detalle"
                >
                  <span class="material-symbols-outlined text-xl">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sale Details Modal -->
    <div v-if="selectedSale" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="selectedSale = null"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Detalle de Transacción</h4>
            <p class="text-xs text-primary font-mono">{{ selectedSale.invoiceNo }}</p>
          </div>
          <button @click="selectedSale = null" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Cliente:</span>
            <span class="text-on-surface font-semibold">{{ selectedSale.customer }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Productos:</span>
            <span class="text-on-surface font-semibold">{{ selectedSale.items }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Consumo de Agua:</span>
            <span class="text-cyan-400 font-bold font-mono">{{ selectedSale.waterLiters || tanksStore.parseLitersFromItemText(selectedSale.items) }} Litros</span>
          </div>
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Estado de Pago:</span>
            <span :class="selectedSale.status === 'PAID' ? 'text-billing-green' : 'text-admin-gold'" class="font-bold">
              {{ selectedSale.status === 'PAID' ? 'Pagado' : 'Pendiente' }}
            </span>
          </div>
          <div class="flex justify-between py-2 text-base font-bold">
            <span class="text-on-surface">Monto Total:</span>
            <span class="text-primary">${{ formatMoney(selectedSale.total) }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/40">
          <button
            @click="selectedSale = null"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            Cerrar
          </button>
          <button
            @click="printInvoice"
            class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary flex items-center gap-2 glow-cyan-hover"
          >
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>

    <!-- New Sale Modal with Strict Validation & Tank Selection -->
    <div v-if="showSaleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showSaleModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Registrar Nueva Venta</h4>
            <p class="text-xs text-on-surface-variant">El volumen de agua se deducirá automáticamente del tanque seleccionado</p>
          </div>
          <button @click="showSaleModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Validation Error Alert -->
        <div v-if="formError" class="mb-4 p-3 rounded-xl bg-error-red/10 border border-error-red/30 text-error-red text-xs font-semibold flex items-center gap-2 animate-in">
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
              class="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Detalle de Productos / Pedido *</label>
            <input
              v-model="newSaleForm.items"
              type="text"
              required
              placeholder="Ej: 10x Botellón 20L"
              class="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
            <!-- Quick Presets -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="preset in productPresets"
                :key="preset.label"
                type="button"
                @click="applyPreset(preset)"
                class="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-container-high hover:bg-primary/20 text-on-surface hover:text-primary transition-colors border border-outline-variant/30"
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
                class="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
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
                class="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="PAID">Pagado</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Monto Total ($) *</label>
              <input
                v-model.number="newSaleForm.total"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                class="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none font-bold"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Agua Estimada a Descontar</label>
              <div class="h-10 px-4 py-2 bg-surface-container-high/60 border border-outline-variant/30 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span>{{ estimatedLiters }} Litros</span>
                <span class="material-symbols-outlined text-sm">water_drop</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/40">
            <button
              type="button"
              @click="showSaleModal = false"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary glow-cyan-hover shadow-lg shadow-primary/25 cursor-pointer"
            >
              Confirmar y Descontar Agua
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from '~/composables/useToast';
import { useTanksStore } from '~/stores/tanks';
import { z } from 'zod';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const toast = useToast();
const tanksStore = useTanksStore();

const showSaleModal = ref(false);
const selectedSale = ref<any | null>(null);
const formError = ref<string | null>(null);

// Validation Schema with Zod
const SaleSchema = z.object({
  customer: z.string().trim().min(2, 'El nombre del cliente debe tener al menos 2 caracteres.'),
  items: z.string().trim().min(2, 'Debe especificar el detalle de los productos.'),
  total: z.number().positive('El monto total debe ser un número mayor a cero.'),
  status: z.enum(['PAID', 'PENDING']),
  tankId: z.string().min(1, 'Debe seleccionar un tanque de suministro.'),
});

const productPresets = [
  { label: '10x Botellón 20L', price: 45.00, text: '10x Botellón 20L' },
  { label: '5x Botellón 20L', price: 22.50, text: '5x Botellón 20L' },
  { label: '10x Botella 5L', price: 25.00, text: '10x Botella 5L' },
  { label: '20x Botella 1L', price: 20.00, text: '20x Botella 1L' },
];

const sales = ref([
  { invoiceNo: 'INV-2026-001', customer: 'Restaurante El Puerto', items: '10x Botellón 20L', waterLiters: 200, total: 45.00, status: 'PAID' },
  { invoiceNo: 'INV-2026-002', customer: 'Oficinas Central Tech', items: '20x Botellón 20L + 2x Café', waterLiters: 400, total: 134.00, status: 'PAID' },
  { invoiceNo: 'INV-2026-003', customer: 'Gimnasio AquaFit', items: '15x Botellón 15L', waterLiters: 225, total: 82.50, status: 'PENDING' },
  { invoiceNo: 'INV-2026-004', customer: 'Clínica San Lucas', items: '1x Dispensador Frío/Calor', waterLiters: 0, total: 150.00, status: 'PAID' },
]);

const newSaleForm = reactive({
  customer: '',
  items: '',
  total: 45.00,
  status: 'PAID' as 'PAID' | 'PENDING',
  tankId: 'tank-1',
});

const estimatedLiters = computed(() => {
  return tanksStore.parseLitersFromItemText(newSaleForm.items);
});

const totalSalesAmount = computed(() => {
  return sales.value.reduce((sum, s) => sum + (s.total || 0), 0);
});

const totalDispensedLitersSales = computed(() => {
  return sales.value.reduce((sum, s) => sum + (s.waterLiters || tanksStore.parseLitersFromItemText(s.items)), 0);
});

const paidSalesCount = computed(() => {
  return sales.value.filter((s) => s.status === 'PAID').length;
});

const averageTicket = computed(() => {
  return sales.value.length > 0 ? totalSalesAmount.value / sales.value.length : 0;
});

const formatMoney = (val: number): string => {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
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
  try {
    toast.success(`Comprobante para ${selectedSale.value?.invoiceNo} listo para imprimir.`);
    selectedSale.value = null;
  } catch (err: any) {
    toast.error('No se pudo generar el comprobante.');
  }
};

const createSale = () => {
  formError.value = null;

  try {
    // 1. Zod Validation
    const validated = SaleSchema.parse({
      customer: newSaleForm.customer,
      items: newSaleForm.items,
      total: Number(newSaleForm.total),
      status: newSaleForm.status,
      tankId: newSaleForm.tankId,
    });

    const nextNumber = sales.value.length + 1;
    const invoiceNo = `INV-2026-00${nextNumber}`;
    const litersToDeduct = tanksStore.parseLitersFromItemText(validated.items);

    // 2. Deduct water liters from Tank Store
    const deductionResult = tanksStore.deductLiters(litersToDeduct, validated.tankId, `Venta ${invoiceNo} (${validated.customer})`);

    // 3. Save Sale record
    sales.value.unshift({
      invoiceNo,
      customer: validated.customer,
      items: validated.items,
      waterLiters: litersToDeduct,
      total: validated.total,
      status: validated.status,
    });

    showSaleModal.value = false;
    toast.success(
      `Venta ${invoiceNo} registrada ($${formatMoney(validated.total)}). Se descontaron ${deductionResult.dispensed}L de ${deductionResult.tankName}.`
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = err.errors.map((e) => e.message).join(' | ');
      formError.value = msg;
      toast.error(msg);
    } else {
      const msg = err?.message || 'Ocurrió un error inesperado al procesar la venta.';
      formError.value = msg;
      toast.error(msg);
    }
  }
};
</script>
