<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Facturación & Comprobantes</h2>
        <p class="text-sm text-on-surface-variant mt-1">Gestión fiscal digital con deducción automática de reservas de agua.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openEmitModal"
          class="bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">note_add</span>
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

    <!-- Invoices Table -->
    <div class="card-elevated overflow-hidden flex-1">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Nº Factura</th>
              <th class="py-4 px-6">Fecha</th>
              <th class="py-4 px-6">Cliente</th>
              <th class="py-4 px-6">Detalle</th>
              <th class="py-4 px-6 text-right">Monto</th>
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
              <td class="py-4 px-6 text-sm text-on-surface text-right font-extrabold font-mono text-billing-green">${{ formatMoney(inv.amount) }}</td>
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

    <!-- Invoice Details Modal -->
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
            <span class="text-on-surface-variant">Estado de Pago:</span>
            <span :class="selectedInvoice.status === 'PAGADA' ? 'text-billing-green' : 'text-admin-gold'" class="font-bold">
              {{ selectedInvoice.status === 'PAGADA' ? 'Pagada' : 'Pendiente de Cobro' }}
            </span>
          </div>
          <div class="flex justify-between py-2 text-base font-bold">
            <span class="text-on-surface">Monto Total:</span>
            <span class="text-primary font-mono">${{ formatMoney(selectedInvoice.amount) }}</span>
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

    <!-- Emit Invoice Modal with Strict Validation -->
    <div v-if="showEmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showEmitModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Emitir Nueva Factura</h4>
            <p class="text-xs text-on-surface-variant">Generación de comprobante y deducción de telemetría de agua</p>
          </div>
          <button @click="showEmitModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Form Error Banner -->
        <div v-if="formError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
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
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-bold shadow-sm font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Agua Estimada</label>
              <div class="h-10 px-4 py-2 bg-surface-container-high/60 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-cyan-400 shadow-sm">
                <span>{{ tanksStore.parseLitersFromItemText(emitForm.items) }} L</span>
                <span class="material-symbols-outlined text-sm">water_drop</span>
              </div>
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTanksStore } from '~/stores/tanks';
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
const toast = useToast();

const searchQuery = ref('');
const statusFilter = ref('');
const showEmitModal = ref(false);
const selectedInvoice = ref<any>(null);
const formError = ref<string | null>(null);

const emitForm = ref({
  customer: '',
  items: '',
  amount: 0,
  status: 'PAGADA',
  tankId: 'tank-1',
});

const invoices = ref([
  {
    id: 'FAC-00101',
    date: '2026-02-24',
    customer: 'Gimnasio FitLife C.A.',
    items: '15x Botellón 20L',
    amount: 67.50,
    status: 'PAGADA',
  },
  {
    id: 'FAC-00102',
    date: '2026-02-24',
    customer: 'Oficinas Torre Norte',
    items: '8x Botellón 20L + 2x Dispensador',
    amount: 336.00,
    status: 'PENDIENTE',
  },
  {
    id: 'FAC-00103',
    date: '2026-02-23',
    customer: 'Restaurante El Puerto',
    items: '25x Botellón 20L',
    amount: 112.50,
    status: 'PAGADA',
  },
  {
    id: 'FAC-00104',
    date: '2026-02-23',
    customer: 'Residencias Los Pinos',
    items: '10x Botellón 20L',
    amount: 45.00,
    status: 'PAGADA',
  },
  {
    id: 'FAC-00105',
    date: '2026-02-22',
    customer: 'Clínica Santa María',
    items: '30x Botellón 20L',
    amount: 135.00,
    status: 'PENDIENTE',
  },
]);

const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    const matchSearch =
      !searchQuery.value.trim() ||
      inv.id.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
      inv.customer.toLowerCase().includes(searchQuery.value.toLowerCase().trim());
    const matchStatus = !statusFilter.value || inv.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const formatMoney = (val: number): string => {
  return (val || 0).toFixed(2);
};

const openEmitModal = () => {
  formError.value = null;
  emitForm.value = {
    customer: '',
    items: '',
    amount: 0,
    status: 'PAGADA',
    tankId: tanksStore.tanks[0]?.id || 'tank-1',
  };
  showEmitModal.value = true;
};

const viewInvoice = (inv: any) => {
  selectedInvoice.value = inv;
};

const downloadInvoice = (inv: any) => {
  toast.success(`Factura ${inv.id} preparada para descarga.`);
};

const markAsPaid = (inv: any) => {
  inv.status = 'PAGADA';
  toast.updateSuccess('Factura', `Factura ${inv.id} marcada como Pagada.`);
};

const deleteInvoice = (inv: any) => {
  invoices.value = invoices.value.filter(i => i.id !== inv.id);
  toast.deleteSuccess('Factura', `Factura ${inv.id} anulada y eliminada.`);
};

const emitInvoice = () => {
  formError.value = null;
  const cleaned = sanitizeFormData(emitForm.value);

  const custError = validateRequired(cleaned.customer, 'El cliente / razón social');
  if (custError) {
    formError.value = custError;
    return;
  }

  const itemsError = validateRequired(cleaned.items, 'El concepto / productos');
  if (itemsError) {
    formError.value = itemsError;
    return;
  }

  const amountError = validatePositiveNumber(cleaned.amount, 'El monto total');
  if (amountError) {
    formError.value = amountError;
    return;
  }

  const nextId = `FAC-00${invoices.value.length + 106}`;
  const today = new Date().toISOString().split('T')[0];
  const liters = tanksStore.parseLitersFromItemText(cleaned.items);

  // Deduct liters from storage
  const res = tanksStore.deductLiters(liters, cleaned.tankId, `Factura ${nextId} (${cleaned.customer})`);

  invoices.value.unshift({
    id: nextId,
    date: today,
    customer: cleaned.customer,
    items: cleaned.items,
    amount: Number(cleaned.amount),
    status: cleaned.status,
  });

  showEmitModal.value = false;
  toast.createSuccess('Factura', `Factura ${nextId} emitida correctamente. Se descontaron ${res.dispensed}L de agua.`);
};
</script>
