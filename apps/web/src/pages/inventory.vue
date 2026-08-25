<template>
  <div class="flex flex-col gap-space-lg">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md">
      <div>
        <h2 class="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Listado de Inventario</h2>
        <p class="font-body-md text-sm md:text-base text-on-surface-variant mt-1">Gestión detallada de productos, stock y alertas tempranas.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-primary text-on-primary font-label-md text-sm px-space-lg py-space-sm rounded-lg flex items-center gap-space-sm glow-cyan-hover transition-all font-semibold shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
      >
        <span class="material-symbols-outlined text-[18px]" data-icon="add">add</span>
        Nuevo Producto
      </button>
    </div>

    <!-- KPIs Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      <!-- KPI 1: Valor Total -->
      <div class="card-elevated p-space-lg flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div class="flex justify-between items-start mb-space-md">
          <span class="font-label-md text-sm text-on-surface-variant">Valor Total Inventario</span>
          <span class="p-2 bg-surface-container-highest rounded-lg text-primary flex items-center justify-center">
            <span class="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
          </span>
        </div>
        <div>
          <h3 class="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface tracking-tight">$45,230.50</h3>
          <p class="font-label-sm text-xs text-billing-green mt-2 flex items-center gap-1 font-medium">
            <span class="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
            +2.4% vs mes anterior
          </p>
        </div>
      </div>

      <!-- KPI 2: Total SKUs -->
      <div class="card-elevated p-space-lg flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-space-md">
          <span class="font-label-md text-sm text-on-surface-variant">Total SKUs Activos</span>
          <span class="p-2 bg-surface-container-highest rounded-lg text-primary flex items-center justify-center">
            <span class="material-symbols-outlined" data-icon="category">category</span>
          </span>
        </div>
        <div>
          <h3 class="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface tracking-tight">{{ totalSkusCount }}</h3>
          <p class="font-label-sm text-xs text-on-surface-variant mt-2">Productos en catálogo</p>
        </div>
      </div>

      <!-- KPI 3: Alertas de Stock -->
      <div class="card-elevated p-space-lg flex flex-col justify-between relative overflow-hidden border-error-red/20">
        <div class="absolute top-0 right-0 w-32 h-32 bg-error-red/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div class="flex justify-between items-start mb-space-md">
          <span class="font-label-md text-sm text-on-surface-variant">Alertas de Stock</span>
          <span class="p-2 bg-error-red/20 rounded-lg text-error-red flex items-center justify-center">
            <span class="material-symbols-outlined" data-icon="warning">warning</span>
          </span>
        </div>
        <div>
          <h3 class="font-headline-xl text-3xl md:text-4xl font-bold text-error-red tracking-tight">{{ stockAlertsCount }}</h3>
          <p class="font-label-sm text-xs text-on-surface-variant mt-2">SKUs por debajo del nivel crítico</p>
        </div>
      </div>
    </div>

    <!-- Controls Toolbar -->
    <div class="flex flex-col md:flex-row gap-space-md justify-between items-stretch md:items-center card-inner p-space-md">
      <div class="flex flex-wrap gap-space-md items-center w-full md:w-auto">
        <span class="font-label-md text-sm text-on-surface-variant hidden md:block">Filtrar por:</span>
        <select
          v-model="selectedCategory"
          class="bg-surface-container border border-outline-variant text-on-surface font-label-md text-sm rounded-lg px-space-md py-space-sm focus:ring-1 focus:ring-primary focus:border-primary glow-cyan-focus outline-none pr-8 min-w-[170px]"
        >
          <option value="">Todas las Categorías</option>
          <option value="Agua">Agua Purificada</option>
          <option value="Café">Café e Insumos</option>
          <option value="Snacks">Snacks</option>
          <option value="Accesorios">Accesorios</option>
        </select>

        <select
          v-model="selectedStatus"
          class="bg-surface-container border border-outline-variant text-on-surface font-label-md text-sm rounded-lg px-space-md py-space-sm focus:ring-1 focus:ring-primary focus:border-primary glow-cyan-focus outline-none pr-8 min-w-[170px]"
        >
          <option value="">Cualquier Estado</option>
          <option value="ok">En Stock</option>
          <option value="low">Stock Bajo</option>
          <option value="out">Agotado</option>
        </select>
      </div>

      <div class="flex gap-space-sm w-full md:w-auto">
        <button
          @click="exportData"
          class="flex-1 md:flex-none border border-admin-gold text-admin-gold hover:bg-admin-gold/10 font-label-md text-sm px-space-md py-space-sm rounded-lg flex items-center justify-center gap-space-sm transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]" data-icon="file_download">file_download</span>
          Exportar
        </button>
      </div>
    </div>

    <!-- Data Table (Glassmorphism card) -->
    <div class="card-elevated overflow-hidden flex-1">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/50 border-b border-outline-variant/50">
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold">SKU</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold">Producto</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold">Categoría</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold text-right">Stock Actual</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold text-right hidden lg:table-cell">Nivel Crítico</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold text-right hidden xl:table-cell">Compra / Venta</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold text-center">Estado</th>
              <th class="py-space-md px-space-lg font-label-sm text-xs text-on-surface-variant font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container-lowest">
            <tr
              v-for="item in filteredProducts"
              :key="item.sku"
              class="hover:bg-surface-container-highest/30 transition-colors group"
              :class="{
                'bg-admin-gold/5': item.status === 'low',
                'bg-error-red/5': item.status === 'out',
              }"
            >
              <!-- SKU -->
              <td class="py-3.5 px-space-lg font-label-md text-sm font-semibold text-primary">
                {{ item.sku }}
              </td>

              <!-- Producto -->
              <td class="py-3.5 px-space-lg">
                <p class="font-body-md text-sm text-on-surface" :class="{ 'opacity-60': item.status === 'out' }">
                  {{ item.name }}
                </p>
              </td>

              <!-- Categoría -->
              <td class="py-3.5 px-space-lg">
                <span class="bg-surface-container px-2.5 py-1 rounded text-xs font-medium text-on-surface-variant">
                  {{ item.category }}
                </span>
              </td>

              <!-- Stock Actual -->
              <td class="py-3.5 px-space-lg text-right text-sm">
                <span
                  class="font-medium"
                  :class="{
                    'text-on-surface font-medium': item.status === 'ok',
                    'text-admin-gold font-bold': item.status === 'low',
                    'text-error-red font-bold': item.status === 'out',
                  }"
                >
                  {{ item.currentStock }}
                </span>
              </td>

              <!-- Nivel Crítico -->
              <td class="py-3.5 px-space-lg text-right hidden lg:table-cell text-sm text-on-surface-variant">
                {{ item.minStock }}
              </td>

              <!-- Compra / Venta -->
              <td class="py-3.5 px-space-lg text-right hidden xl:table-cell text-sm text-on-surface" :class="{ 'opacity-60': item.status === 'out' }">
                <span class="text-on-surface-variant mr-2">${{ item.cost.toFixed(2) }}</span> / ${{ item.price.toFixed(2) }}
              </td>

              <!-- Estado -->
              <td class="py-3.5 px-space-lg text-center">
                <span
                  v-if="item.status === 'ok'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/10 text-billing-green px-3 py-1 rounded-full text-xs font-semibold "
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-billing-green"></div> En Stock
                </span>
                <span
                  v-else-if="item.status === 'low'"
                  class="inline-flex items-center gap-1.5 bg-admin-gold/10 text-admin-gold px-3 py-1 rounded-full text-xs font-semibold "
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-admin-gold animate-pulse"></div> Stock Bajo
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-error-red/10 text-error-red px-3 py-1 rounded-full text-xs font-semibold "
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-error-red"></div> Agotado
                </span>
              </td>

              <!-- Acciones -->
              <td class="py-3.5 px-space-lg text-right">
                <button class="p-1.5 text-on-surface-variant hover:text-primary transition-colors opacity-80 group-hover:opacity-100 rounded-md hover:bg-surface-container cursor-pointer">
                  <span class="material-symbols-outlined text-xl" data-icon="more_vert">more_vert</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="border-t border-outline-variant/50 bg-surface-container-highest/20 p-space-sm px-space-lg flex justify-between items-center">
        <span class="font-label-sm text-xs text-on-surface-variant">
          Mostrando 1 - {{ filteredProducts.length }} de {{ totalSkusCount }} items
        </span>
        <div class="flex gap-1">
          <button class="p-1.5 rounded text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-40" disabled>
            <span class="material-symbols-outlined text-lg" data-icon="chevron_left">chevron_left</span>
          </button>
          <button class="p-1.5 rounded text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface">
            <span class="material-symbols-outlined text-lg" data-icon="chevron_right">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Producto -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="glass-card max-w-lg w-full p-6 animate-in">
        <div class="flex justify-between items-center pb-4 border-b border-outline-variant/40 mb-4">
          <h3 class="text-xl font-bold text-on-surface">Crear Nuevo Producto</h3>
          <button @click="showCreateModal = false" class="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="createProduct" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">SKU</label>
            <input
              v-model="newProduct.sku"
              required
              class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              placeholder="e.g. AQ-20L-RET"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre del Producto</label>
            <input
              v-model="newProduct.name"
              required
              class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              placeholder="e.g. Botellón Agua 20L"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
              <select
                v-model="newProduct.category"
                class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="Agua">Agua</option>
                <option value="Café">Café</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Insumos">Insumos</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Stock Inicial</label>
              <input
                v-model.number="newProduct.currentStock"
                type="number"
                required
                class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Costo ($)</label>
              <input
                v-model.number="newProduct.cost"
                type="number"
                step="0.01"
                required
                class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Precio Venta ($)</label>
              <input
                v-model.number="newProduct.price"
                type="number"
                step="0.01"
                required
                class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 text-sm font-semibold bg-primary text-on-primary rounded-lg glow-cyan-hover cursor-pointer"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

definePageMeta({
  middleware: ['auth'],
});
import { useToast } from '~/composables/useToast';

interface ProductItem {
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  cost: number;
  price: number;
  status: 'ok' | 'low' | 'out';
}

const toast = useToast();

const selectedCategory = ref('');
const selectedStatus = ref('');
const showCreateModal = ref(false);
const totalSkusCount = ref(142);

const newProduct = ref({
  sku: '',
  name: '',
  category: 'Agua',
  currentStock: 50,
  minStock: 20,
  cost: 2.5,
  price: 5.0,
});

const products = ref<ProductItem[]>([
  {
    sku: 'AQ-20L-RET',
    name: 'Botellón Agua 20L (Retornable)',
    category: 'Agua',
    currentStock: 450,
    minStock: 50,
    cost: 2.50,
    price: 4.50,
    status: 'ok',
  },
  {
    sku: 'AQ-15L-DES',
    name: 'Botellón Agua 15L (Descartable)',
    category: 'Agua',
    currentStock: 25,
    minStock: 30,
    cost: 3.00,
    price: 5.50,
    status: 'low',
  },
  {
    sku: 'CF-ESP-1KG',
    name: 'Café Espresso Grano 1KG',
    category: 'Café',
    currentStock: 0,
    minStock: 10,
    cost: 12.00,
    price: 22.00,
    status: 'out',
  },
  {
    sku: 'AC-DISP-FRIO',
    name: 'Dispensador Agua Fría/Caliente',
    category: 'Accesorios',
    currentStock: 12,
    minStock: 5,
    cost: 85.00,
    price: 150.00,
    status: 'ok',
  },
]);

const stockAlertsCount = computed(() => {
  return products.value.filter(p => p.status === 'low' || p.status === 'out').length + 6;
});

const filteredProducts = computed(() => {
  return products.value.filter(item => {
    const matchCategory = !selectedCategory.value || item.category === selectedCategory.value;
    const matchStatus = !selectedStatus.value || item.status === selectedStatus.value;
    return matchCategory && matchStatus;
  });
});

const exportData = () => {
  toast.info('Exportando inventario a archivo CSV...');
};

const createProduct = () => {
  const status: 'ok' | 'low' | 'out' =
    newProduct.value.currentStock === 0
      ? 'out'
      : newProduct.value.currentStock <= newProduct.value.minStock
      ? 'low'
      : 'ok';

  products.value.unshift({
    sku: newProduct.value.sku,
    name: newProduct.value.name,
    category: newProduct.value.category,
    currentStock: newProduct.value.currentStock,
    minStock: newProduct.value.minStock,
    cost: newProduct.value.cost,
    price: newProduct.value.price,
    status,
  });

  totalSkusCount.value += 1;
  showCreateModal.value = false;
  toast.success(`Producto ${newProduct.value.name} agregado exitosamente`);

  newProduct.value = {
    sku: '',
    name: '',
    category: 'Agua',
    currentStock: 50,
    minStock: 20,
    cost: 2.5,
    price: 5.0,
  };
};
</script>
