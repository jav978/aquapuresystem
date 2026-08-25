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
            <span class="material-symbols-outlined text-sm text-primary">receipt_long</span>
            Control Fiscal
          </span>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Facturación Electrónica</h2>
        <p class="text-sm md:text-base text-on-surface-variant mt-0.5">Historial, emisión y control de cobros con deducción de agua.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <button
          @click="openEmitModal"
          class="bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">note_add</span>
          Emitir Factura
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

    <!-- Table -->
    <div class="card-elevated overflow-hidden flex-1">
      <div class="p-5 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-highest/30">
        <div>
          <h3 class="text-base font-bold text-on-surface">Comprobantes y Facturas Emitidas</h3>
          <p class="text-xs text-on-surface-variant mt-0.5">Control fiscal y recaudación de fondos</p>
        </div>
        <span class="text-xs px-3 py-1 bg-surface-container rounded-full text-on-surface-variant border border-outline-variant/20">
          {{ invoices.length }} Facturas
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-outline-variant/40 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Nº Factura</th>
              <th class="py-4 px-6">Fecha</th>
              <th class="py-4 px-6">Cliente</th>
              <th class="py-4 px-6">Detalle</th>
              <th class="py-4 px-6 text-right">Monto</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-surface-container-highest/30 transition-colors">
              <td class="py-4 px-6 text-sm font-semibold text-primary font-mono">{{ inv.id }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ inv.date }}</td>
              <td class="py-4 px-6 text-sm text-on-surface font-medium">{{ inv.customer }}</td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ inv.items || 'Recarga de Agua Purificada' }}</td>
              <td class="py-4 px-6 text-sm text-on-surface text-right font-bold">${{ formatMoney(inv.amount) }}</td>
              <td class="py-4 px-6 text-center">
                <span
                  v-if="inv.status === 'PAGADA'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/15 text-billing-green border border-billing-green/20 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> Pagada
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-admin-gold/15 text-admin-gold border border-admin-gold/20 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-admin-gold animate-pulse"></span> Pendiente
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="inv.status === 'PENDIENTE'"
                    @click="markAsPaid(inv)"
                    class="p-2 text-billing-green hover:bg-billing-green/10 transition-colors rounded-lg cursor-pointer active:scale-95"
                    title="Registrar Cobro / Marcar como Pagada"
                  >
                    <span class="material-symbols-outlined text-xl">check_circle</span>
                  </button>
                  <button
                    @click="viewInvoice(inv)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Ver Detalle"
                  >
                    <span class="material-symbols-outlined text-xl">visibility</span>
                  </button>
                  <button
                    @click="downloadInvoice(inv)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Descargar PDF"
                  >
                    <span class="material-symbols-outlined text-xl">download</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div v-if="selectedInvoice" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="selectedInvoice = null"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Comprobante Fiscal Digital</h4>
            <p class="text-xs text-primary font-mono">{{ selectedInvoice.id }}</p>
          </div>
          <button @click="selectedInvoice = null" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Fecha de Emisión:</span>
            <span class="text-on-surface font-semibold">{{ selectedInvoice.date }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Cliente / Empresa:</span>
            <span class="text-on-surface font-semibold">{{ selectedInvoice.customer }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Detalle:</span>
            <span class="text-on-surface font-semibold">{{ selectedInvoice.items || 'Recarga de Agua Purificada' }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-outline-variant/20">
            <span class="text-on-surface-variant">Estado de Pago:</span>
            <span :class="selectedInvoice.status === 'PAGADA' ? 'text-billing-green' : 'text-admin-gold'" class="font-bold">
              {{ selectedInvoice.status === 'PAGADA' ? 'Pagada' : 'Pendiente de Cobro' }}
            </span>
          </div>
          <div class="flex justify-between py-2 text-base font-bold">
            <span class="text-on-surface">Monto Total:</span>
            <span class="text-primary">${{ formatMoney(selectedInvoice.amount) }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/40">
          <button
            @click="selectedInvoice = null"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            Cerrar
          </button>
          <button
            @click="downloadInvoice(selectedInvoice)"
            class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary flex items-center gap-2 glow-cyan-hover"
          >
            <span class="material-symbols-outlined text-base">download</span>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Emit Invoice Modal with Zod Validation -->
    <div v-if="showEmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showEmitModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Emitir Nueva Factura</h4>
            <p class="text-xs text-on-surface-variant">Generación de comprobante y deducción de telemetría de agua</p>
          </div>
          <button @click="showEmitModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Form Error Banner -->
        <div v-if="formError" class="mb-4 p-3 rounded-xl bg-error-red/10 border border-error-red/30 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ formError }}</span>
        </div>

        <form @submit.prevent="emitInvoice" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Cliente / Razón Social *</label>
            <input
              v-model="emitForm.customer"
              type="text"
              required
              placeholder="Ej: Distribuidora Los Andes C.A."
              class="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Concepto / Productos *</label>
            <input
              v-model="emitForm.items"
              type="text"
              required
              placeholder="Ej: 20x Botellón 20L + 5x Botella 5L"
              class="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tanque Suministrador *</label>
              <select
                v-model="emitForm.tankId"
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
                v-model="emitForm.status"
                class="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="PAGADA">Pagada</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Monto Total ($) *</label>
              <input
                v-model.number="emitForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                class="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none font-bold"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Agua Estimada</label>
              <div class="h-10 px-4 py-2 bg-surface-container-high/60 border border-outline-variant/30 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span>{{ tanksStore.parseLitersFromItemText(emitForm.items) }} L</span>
                <span class="material-symbols-outlined text-sm">water_drop</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/40">
            <button
              type="button"
              @click="showEmitModal = false"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary glow-cyan-hover shadow-lg shadow-primary/25"
            >
              Emitir Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
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

const showEmitModal = ref(false);
const selectedInvoice = ref<any | null>(null);
const formError = ref<string | null>(null);

const InvoiceSchema = z.object({
  customer: z.string().trim().min(2, 'El nombre o razón social del cliente es obligatorio.'),
  items: z.string().trim().min(2, 'Debe especificar el concepto de la factura.'),
  amount: z.number().positive('El monto de la factura debe ser mayor a cero.'),
  status: z.enum(['PAGADA', 'PENDIENTE']),
  tankId: z.string().min(1, 'Debe seleccionar un tanque.'),
});

const invoices = ref([
  { id: 'FAC-00102', date: '2026-08-23', customer: 'Restaurante El Puerto', items: '10x Botellón 20L', amount: 45.00, status: 'PAGADA' },
  { id: 'FAC-00103', date: '2026-08-23', customer: 'Oficinas Central Tech', items: '20x Botellón 20L', amount: 134.00, status: 'PAGADA' },
  { id: 'FAC-00104', date: '2026-08-22', customer: 'Gimnasio AquaFit', items: '15x Botellón 15L', amount: 82.50, status: 'PENDIENTE' },
  { id: 'FAC-00105', date: '2026-08-21', customer: 'Clínica San Lucas', items: '1x Dispensador + 2x Botellón', amount: 150.00, status: 'PAGADA' },
]);

const emitForm = reactive({
  customer: '',
  items: '15x Botellón 20L',
  amount: 67.50,
  status: 'PAGADA' as 'PAGADA' | 'PENDIENTE',
  tankId: 'tank-1',
});

const formatMoney = (val: number): string => {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
};

const openEmitModal = () => {
  formError.value = null;
  emitForm.customer = '';
  emitForm.items = '15x Botellón 20L';
  emitForm.amount = 67.50;
  emitForm.status = 'PAGADA';
  emitForm.tankId = tanksStore.tanks[0]?.id || 'tank-1';
  showEmitModal.value = true;
};

const viewInvoice = (inv: any) => {
  selectedInvoice.value = inv;
};

const downloadInvoice = (inv: any) => {
  try {
    toast.success(`Factura ${inv.id} preparada para descarga.`);
  } catch (err: any) {
    toast.error('Error al generar archivo de descarga.');
  }
};

const markAsPaid = (inv: any) => {
  try {
    inv.status = 'PAGADA';
    toast.success(`Factura ${inv.id} marcada como Pagada.`);
  } catch (err: any) {
    toast.error(err?.message || 'Error al actualizar estado de la factura.');
  }
};

const emitInvoice = () => {
  formError.value = null;
  try {
    const validated = InvoiceSchema.parse({
      customer: emitForm.customer,
      items: emitForm.items,
      amount: Number(emitForm.amount),
      status: emitForm.status,
      tankId: emitForm.tankId,
    });

    const nextId = `FAC-00${invoices.value.length + 106}`;
    const today = new Date().toISOString().split('T')[0];
    const liters = tanksStore.parseLitersFromItemText(validated.items);

    // Deduct liters
    const res = tanksStore.deductLiters(liters, validated.tankId, `Factura ${nextId} (${validated.customer})`);

    invoices.value.unshift({
      id: nextId,
      date: today,
      customer: validated.customer,
      items: validated.items,
      amount: validated.amount,
      status: validated.status,
    });

    showEmitModal.value = false;
    toast.success(`Factura ${nextId} emitida correctamente. Se descontaron ${res.dispensed}L de agua.`);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = err.errors.map((e) => e.message).join(' | ');
      formError.value = msg;
      toast.error(msg);
    } else {
      const msg = err?.message || 'Error inesperado al emitir la factura.';
      formError.value = msg;
      toast.error(msg);
    }
  }
};
</script>
