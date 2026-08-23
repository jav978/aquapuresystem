<template>
  <div class="space-y-6 animate-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-headline-lg font-bold text-on-surface dark:text-on-surface">Dashboard</h1>
        <p class="text-on-surface-variant dark:text-on-surface-variant mt-1">Overview of your water purification operations</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" @click="refreshData" :loading="loading">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh
        </Button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Sales"
        :value="kpis.totalSales"
        :change="kpis.salesChange"
        icon="ShoppingCartIcon"
        variant="primary"
      />
      <KpiCard
        title="Revenue"
        :value="kpis.revenue"
        :change="kpis.revenueChange"
        icon="DollarSignIcon"
        variant="success"
        prefix="$"
      />
      <KpiCard
        title="Active Invoices"
        :value="kpis.activeInvoices"
        :change="kpis.invoicesChange"
        icon="FileTextIcon"
        variant="info"
      />
      <KpiCard
        title="Low Stock Items"
        :value="kpis.lowStockItems"
        :change="kpis.stockChange"
        icon="AlertTriangleIcon"
        variant="warning"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-headline-sm font-semibold text-on-surface dark:text-on-surface">Sales Overview</h3>
          <select v-model="salesChartPeriod" class="input w-auto">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        <div class="h-64">
          <SalesChart :data="salesChartData" :period="salesChartPeriod" />
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-headline-sm font-semibold text-on-surface dark:text-on-surface">Inventory Levels</h3>
          <Badge variant="info" class="ml-2">{{ lowStockCount }} items low</Badge>
        </div>
        <div class="h-64">
          <InventoryChart :data="inventoryChartData" />
        </div>
      </Card>
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-headline-sm font-semibold text-on-surface dark:text-on-surface">Recent Activity</h3>
          <NuxtLink to="/activity" class="text-label-md text-primary hover:underline">View all</NuxtLink>
        </div>
        <ActivityFeed :activities="recentActivities" />
      </Card>

      <Card class="p-6">
        <h3 class="text-headline-sm font-semibold text-on-surface dark:text-on-surface mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <NuxtLink to="/sales/invoices/new" class="block">
            <ActionButton icon="PlusIcon" label="Create Invoice" variant="primary" />
          </NuxtLink>
          <NuxtLink to="/inventory/products/new" class="block">
            <ActionButton icon="PackageIcon" label="Add Product" variant="secondary" />
          </NuxtLink>
          <NuxtLink to="/sales/returns/new" class="block">
            <ActionButton icon="RotateCcwIcon" label="New Return" variant="secondary" />
          </NuxtLink>
          <NuxtLink to="/inventory/operations" class="block">
            <ActionButton icon="ArrowUpDownIcon" label="Stock Transfer" variant="secondary" />
          </NuxtLink>
        </div>
      </Card>
    </div>

    <!-- Tank Levels / Critical Alerts -->
    <Card class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-headline-sm font-semibold text-on-surface dark:text-on-surface">Tank Levels</h3>
        <div class="flex items-center gap-2">
          <Badge :variant="criticalTanks > 0 ? 'error' : 'success'">{{ criticalTanks }} critical</Badge>
          <Badge :variant="warningTanks > 0 ? 'warning' : 'success'">{{ warningTanks }} warning</Badge>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TankCard v-for="tank in tankLevels" :key="tank.id" :tank="tank" />
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import Card from '~/components/ui/Card.vue';
import Badge from '~/components/ui/Badge.vue';

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

interface Tank {
  id: string;
  name: string;
  level: number;
  capacity: number;
  status: 'normal' | 'warning' | 'critical';
}

const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
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
const salesChartData = ref([]);
const inventoryChartData = ref([]);
const recentActivities = ref<Activity[]>([]);
const tankLevels = ref<Tank[]>([]);

const lowStockCount = computed(() => kpis.value.lowStockItems);
const criticalTanks = computed(() => tankLevels.value.filter(t => t.status === 'critical').length);
const warningTanks = computed(() => tankLevels.value.filter(t => t.status === 'warning').length);

const refreshData = async () => {
  loading.value = true;
  try {
    await fetchDashboardData();
    toast.success('Data refreshed');
  } catch (err) {
    toast.error('Failed to refresh data');
  } finally {
    loading.value = false;
  }
};

const fetchDashboardData = async () => {
  // In production, would call API endpoints
  // Mock data for now
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
    { date: '2024-01-01', sales: 45, revenue: 3200 },
    { date: '2024-01-02', sales: 52, revenue: 3800 },
    { date: '2024-01-03', sales: 38, revenue: 2900 },
    { date: '2024-01-04', sales: 65, revenue: 4500 },
    { date: '2024-01-05', sales: 72, revenue: 5200 },
    { date: '2024-01-06', sales: 48, revenue: 3400 },
    { date: '2024-01-07', sales: 55, revenue: 3900 },
  ];

  inventoryChartData.value = [
    { category: 'Water Bottles', stock: 1250, min: 500 },
    { category: 'Water Jugs', stock: 320, min: 100 },
    { category: 'Filters', stock: 45, min: 50 },
    { category: 'Dispensers', stock: 18, min: 10 },
    { category: 'Accessories', stock: 890, min: 200 },
  ];

  recentActivities.value = [
    { id: '1', type: 'sale', title: 'New Sale Created', description: 'Sale SALE-20240115-ABC1 for AquaPure Retail Store', timestamp: '2 min ago', user: 'John Smith' },
    { id: '2', type: 'invoice', title: 'Invoice Sent', description: 'Invoice INV-20240115-001 sent to Green Valley Offices', timestamp: '15 min ago', user: 'Sarah Johnson' },
    { id: '3', type: 'payment', title: 'Payment Received', description: 'Payment PAY-20240115-001 received for Invoice INV-20240114-005', timestamp: '1 hour ago', user: 'Mike Wilson' },
    { id: '4', type: 'stock', title: 'Low Stock Alert', description: 'Carbon Filter Cartridge below minimum threshold (45/50)', timestamp: '2 hours ago', user: 'System' },
    { id: '5', type: 'return', title: 'Return Processed', description: 'Return RET-20240115-002 approved for Sunrise Café', timestamp: '3 hours ago', user: 'Emily Davis' },
  ];

  tankLevels.value = [
    { id: '1', name: 'Tank A - Purified Water', level: 85, capacity: 10000, status: 'normal' },
    { id: '2', name: 'Tank B - Spring Water', level: 23, capacity: 8000, status: 'warning' },
    { id: '3', name: 'Tank C - Filtered Water', level: 8, capacity: 12000, status: 'critical' },
    { id: '4', name: 'Tank D - Mineral Water', level: 67, capacity: 5000, status: 'normal' },
  ];
};

onMounted(() => {
  fetchDashboardData();
});
</script>