<template>
  <div class="space-y-6 animate-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
            AquaPure Telemetría
          </span>
          <span class="flex items-center gap-1 text-xs text-billing-green font-semibold">
            <span class="w-2 h-2 rounded-full bg-billing-green animate-pulse"></span>
            Sistema en Línea
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Panel de Control & Monitoreo</h1>
        <p class="text-sm text-on-surface-variant mt-0.5">Visión general de ventas, inventario y niveles de tanques de agua en tiempo real.</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openRefillModal(null)"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all active:scale-95 cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">water_drop</span>
          <span>Recargar Tanques</span>
        </button>

        <button
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm border-0"
        >
          <span class="material-symbols-outlined text-lg text-primary" :class="{ 'animate-spin': loading }">refresh</span>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Telemetry Water Tanks Section (3D Liquid Tanks) -->
    <div class="card-elevated p-5 sm:p-6 relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl">water_ec</span>
            <h3 class="text-lg font-bold text-on-surface">Tanques de Purificación & Almacenamiento</h3>
          </div>
          <p class="text-xs text-on-surface-variant mt-0.5">
            Monitoreo en tiempo real de capacidad. El consumo en litros se descuenta automáticamente con cada venta.
          </p>
        </div>

        <!-- Global Storage Summary Badge -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="px-3.5 py-1.5 rounded-xl bg-surface-container-high/60 flex items-center gap-3 text-xs shadow-sm">
            <span class="text-on-surface-variant">Reserva Global:</span>
            <span class="font-black text-on-surface text-sm">{{ formatVolume(tanksStore.totalCurrentLiters) }} / {{ formatVolume(tanksStore.totalCapacity) }} L</span>
            <span class="px-2 py-0.5 rounded-md font-bold text-xs" :class="tanksStore.globalLevel <= 15 ? 'bg-error-red/20 text-error-red' : tanksStore.globalLevel <= 30 ? 'bg-admin-gold/20 text-admin-gold' : 'bg-primary/20 text-primary'">
              {{ tanksStore.globalLevel }}%
            </span>
          </div>

          <span v-if="tanksStore.criticalCount > 0" class="bg-error-red/15 text-error-red text-xs px-3 py-1 rounded-full font-bold animate-pulse flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">warning</span>
            {{ tanksStore.criticalCount }} Crítico
          </span>
          <span v-else-if="tanksStore.warningCount > 0" class="bg-admin-gold/15 text-admin-gold text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">info</span>
            {{ tanksStore.warningCount }} Alerta
          </span>
          <span v-else class="bg-billing-green/15 text-billing-green text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            Operación Normal
          </span>
        </div>
      </div>

      <!-- Tanks 3D Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        <LiquidTank3D
          v-for="tank in tanksStore.tanks"
          :key="tank.id"
          :tank="tank"
          @refill="handleQuickRefill"
          @calibrate="openCalibrateModal"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Ventas"
        :value="kpis.totalSales"
        :change="kpis.salesChange"
        icon="shopping_cart"
        variant="primary"
      />
      <KpiCard
        title="Ingresos"
        :value="kpis.revenue"
        :change="kpis.revenueChange"
        icon="payments"
        variant="success"
        prefix="$"
      />
      <KpiCard
        title="Facturas Activas"
        :value="kpis.activeInvoices"
        :change="kpis.invoicesChange"
        icon="receipt_long"
        variant="info"
      />
      <KpiCard
        title="Alertas de Stock"
        :value="kpis.lowStockItems"
        :change="kpis.stockChange"
        icon="warning"
        variant="warning"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-elevated p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-on-surface">Resumen de Ventas</h3>
          <select v-model="salesChartPeriod" class="bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer shadow-sm border-0">
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
        <div class="h-64">
          <SalesChart :data="salesChartData" :period="salesChartPeriod" />
        </div>
      </div>

      <div class="card-elevated p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-on-surface">Niveles de Inventario</h3>
          <span class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {{ lowStockCount }} alertas
          </span>
        </div>
        <div class="h-64">
          <InventoryChart :data="inventoryChartData" />
        </div>
      </div>
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card-elevated p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-on-surface">Actividad Reciente & Movimientos</h3>
          <NuxtLink to="/inventory" class="text-xs text-primary hover:underline font-medium">Ver inventario</NuxtLink>
        </div>
        <ActivityFeed :activities="recentActivities" />
      </div>

      <div class="card-elevated p-6">
        <h3 class="text-base font-bold text-on-surface mb-4">Acciones Rápidas</h3>
        <div class="space-y-3">
          <ActionButton to="/sales" icon="add_shopping_cart" label="Nueva Venta" variant="primary" />
          <ActionButton to="/inventory" icon="add_box" label="Nuevo Producto" variant="secondary" />
          <ActionButton to="/sales/invoices" icon="receipt_long" label="Facturación" variant="secondary" />
          <ActionButton to="/settings" icon="settings" label="Configuración" variant="secondary" />
        </div>
      </div>
    </div>

    <!-- Refill Modal -->
    <div v-if="showRefillModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showRefillModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">water_drop</span>
            <div>
              <h4 class="text-lg font-bold text-on-surface">Recarga de Tanque</h4>
              <p class="text-xs text-on-surface-variant">Registrar proceso de llenado o purificación</p>
            </div>
          </div>
          <button @click="showRefillModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="confirmRefill" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Seleccionar Tanque</label>
            <select
              v-model="refillForm.tankId"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            >
              <option v-for="t in tanksStore.tanks" :key="t.id" :value="t.id">
                {{ t.name }} (Actual: {{ formatVolume(t.currentLiters) }} / {{ formatVolume(t.capacity) }} L)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tipo de Llenado</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="refillForm.mode = 'full'"
                class="py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 shadow-sm"
                :class="refillForm.mode === 'full' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'"
              >
                Llenado Total (100%)
              </button>
              <button
                type="button"
                @click="refillForm.mode = 'custom'"
                class="py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 shadow-sm"
                :class="refillForm.mode === 'custom' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'"
              >
                Cantidad Específica
              </button>
            </div>
          </div>

          <div v-if="refillForm.mode === 'custom'">
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Litros a Agregar</label>
            <input
              v-model.number="refillForm.amountLiters"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Ej: 1000"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showRefillModal = false"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary shadow-lg shadow-primary/25 hover:bg-primary-hover"
            >
              Confirmar Recarga
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Calibrate Modal -->
    <div v-if="showCalibrateModal && editingTank" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showCalibrateModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">tune</span>
            <div>
              <h4 class="text-lg font-bold text-on-surface">Calibrar Tanque</h4>
              <p class="text-xs text-on-surface-variant">{{ editingTank.name }}</p>
            </div>
          </div>
          <button @click="showCalibrateModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveCalibration" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre del Tanque</label>
            <input
              v-model="calibrateForm.name"
              type="text"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tipo / Descripción</label>
            <input
              v-model="calibrateForm.type"
              type="text"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Capacidad Total (L)</label>
              <input
                v-model.number="calibrateForm.capacity"
                type="number"
                min="100"
                step="100"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nivel Actual (L)</label>
              <input
                v-model.number="calibrateForm.currentLiters"
                type="number"
                min="0"
                :max="calibrateForm.capacity"
                step="10"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showCalibrateModal = false"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary shadow-lg shadow-primary/25 hover:bg-primary-hover"
            >
              Guardar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useTanksStore, type Tank } from '~/stores/tanks';
import { useToast } from '~/composables/useToast';
import KpiCard from '~/components/ui/KpiCard.vue';
import SalesChart from '~/components/ui/SalesChart.vue';
import InventoryChart from '~/components/ui/InventoryChart.vue';
import ActivityFeed from '~/components/ui/ActivityFeed.vue';
import ActionButton from '~/components/ui/ActionButton.vue';
import LiquidTank3D from '~/components/ui/LiquidTank3D.vue';

definePageMeta({
  middleware: ['auth'],
});

const authStore = useAuthStore();
const tanksStore = useTanksStore();
const toast = useToast();

const loading = ref(false);
const showRefillModal = ref(false);
const showCalibrateModal = ref(false);
const editingTank = ref<Tank | null>(null);

const refillForm = reactive({
  tankId: '',
  mode: 'full' as 'full' | 'custom',
  amountLiters: 1000,
});

const calibrateForm = reactive({
  name: '',
  type: '',
  capacity: 10000,
  currentLiters: 8000,
});

interface KpiData {
  totalSales: number;
  salesChange: number;
  revenue: number;
  revenueChange: number;
  activeInvoices: number;
  invoicesChange: number;
  lowStockItems: number;
  stockChange: number;
}

interface Activity {
  id: string;
  type: 'sale' | 'invoice' | 'payment' | 'return' | 'stock' | 'user';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

const kpis = ref<KpiData>({
  totalSales: 0,
  salesChange: 0,
  revenue: 0,
  revenueChange: 0,
  activeInvoices: 0,
  invoicesChange: 0,
  lowStockItems: 0,
  stockChange: 0,
});

const salesChartPeriod = ref('30d');
const salesChartData = ref<any[]>([]);
const inventoryChartData = ref<any[]>([]);
const recentActivities = ref<Activity[]>([]);

const lowStockCount = computed(() => kpis.value.lowStockItems);

const formatVolume = (val: number): string => {
  return new Intl.NumberFormat('es-ES').format(Math.round(val || 0));
};

const handleQuickRefill = (tankId: string) => {
  try {
    const success = tanksStore.refillTank(tankId);
    if (success) {
      toast.success('Tanque recargado exitosamente al 100% de su capacidad.');
    } else {
      toast.error('No se pudo recargar el tanque seleccionado.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Error inesperado durante la recarga.');
  }
};

const openRefillModal = (tankId: string | null) => {
  refillForm.tankId = tankId || (tanksStore.tanks[0]?.id || '');
  refillForm.mode = 'full';
  refillForm.amountLiters = 1000;
  showRefillModal.value = true;
};

const confirmRefill = () => {
  try {
    const amount = refillForm.mode === 'custom' ? refillForm.amountLiters : undefined;
    const success = tanksStore.refillTank(refillForm.tankId, amount);
    if (success) {
      toast.success('Recarga registrada correctamente.');
      showRefillModal.value = false;
    } else {
      toast.error('Error al procesar la recarga.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Error al confirmar recarga.');
  }
};

const openCalibrateModal = (tank: Tank) => {
  editingTank.value = tank;
  calibrateForm.name = tank.name;
  calibrateForm.type = tank.type;
  calibrateForm.capacity = tank.capacity;
  calibrateForm.currentLiters = tank.currentLiters;
  showCalibrateModal.value = true;
};

const saveCalibration = () => {
  if (!editingTank.value) return;
  try {
    tanksStore.updateTank(editingTank.value.id, {
      name: calibrateForm.name,
      type: calibrateForm.type,
      capacity: calibrateForm.capacity,
      currentLiters: calibrateForm.currentLiters,
    });
    toast.success('Parámetros de tanque actualizados correctamente.');
    showCalibrateModal.value = false;
  } catch (err: any) {
    toast.error(err?.message || 'Error al calibrar el tanque.');
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    await fetchDashboardData();
    tanksStore.init();
    toast.success('Datos del panel actualizados');
  } catch (err: any) {
    toast.error(err?.message || 'No se pudieron actualizar los datos');
  } finally {
    loading.value = false;
  }
};

const fetchDashboardData = async () => {
  try {
    kpis.value = {
      totalSales: 1247,
      salesChange: 12.5,
      revenue: 89450,
      revenueChange: 8.3,
      activeInvoices: 23,
      invoicesChange: -2.1,
      lowStockItems: 5,
      stockChange: 1,
    };

    salesChartData.value = [
      { date: '2026-02-18', sales: 45, revenue: 3200 },
      { date: '2026-02-19', sales: 52, revenue: 3800 },
      { date: '2026-02-20', sales: 38, revenue: 2900 },
      { date: '2026-02-21', sales: 65, revenue: 4500 },
      { date: '2026-02-22', sales: 72, revenue: 5200 },
      { date: '2026-02-23', sales: 48, revenue: 3400 },
      { date: '2026-02-24', sales: 55, revenue: 3900 },
    ];

    inventoryChartData.value = [
      { category: 'Botellones 20L', stock: 1250, min: 500 },
      { category: 'Botellones 15L', stock: 320, min: 100 },
      { category: 'Filtros Carbón', stock: 45, min: 50 },
      { category: 'Dispensadores', stock: 18, min: 10 },
      { category: 'Tapas & Sellos', stock: 890, min: 200 },
    ];

    recentActivities.value = [
      { id: '1', type: 'sale', title: 'Nueva Venta Registrada', description: 'Venta INV-2026-005 para Restaurante El Puerto (10x Botellón 20L)', timestamp: 'Hace 2 min', user: 'Operador Caja' },
      { id: '2', type: 'invoice', title: 'Factura Emitida', description: 'Factura INV-2026-004 enviada a Oficinas Central Tech', timestamp: 'Hace 15 min', user: 'Administrador' },
      { id: '3', type: 'payment', title: 'Cobro Recibido', description: 'Pago de $134.00 registrado para Factura INV-2026-002', timestamp: 'Hace 1 hora', user: 'Cajero' },
      { id: '4', type: 'stock', title: 'Alerta de Nivel de Tanque', description: 'Tanque C en nivel crítico (13%). Sugerida purificación y recarga.', timestamp: 'Hace 2 horas', user: 'Sistema Sensor' },
    ];
  } catch (e) {
    // Graceful error handling
    console.error('Error fetching dashboard data:', e);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>