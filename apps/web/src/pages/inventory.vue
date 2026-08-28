<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">Control de Inventario & Stock</h2>
        <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Gestión en tiempo real de existencias, insumos y catálogo de purificación.</p>
      </div>

      <div class="flex items-center gap-2.5 flex-shrink-0">
        <div v-if="!authStore.canEditInventory" class="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 border border-primary/20">
          <span class="material-symbols-outlined text-sm">visibility</span>
          Consulta de Existencias (Ventas)
        </div>
        <button
          v-if="authStore.canEditInventory"
          @click="openCreateModal"
          class="bg-primary text-on-primary font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <span class="material-symbols-outlined text-base sm:text-lg">add_box</span>
          <span>Nuevo Producto</span>
        </button>
      </div>
    </div>

    <!-- Inventory KPIs (3 Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      <!-- KPI 1: Valor Total -->
      <div class="card-elevated p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs sm:text-sm font-semibold text-on-surface-variant">Valor Total Inventario</span>
          <span class="p-2 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
          </span>
        </div>
        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">${{ totalInventoryValue.toLocaleString('es-LA', { minimumFractionDigits: 2 }) }}</h3>
          <p class="text-xs text-billing-green mt-2 flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            Catálogo activo y valorizado
          </p>
        </div>
      </div>

      <!-- KPI 2: Total SKUs -->
      <div class="card-elevated p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs sm:text-sm font-semibold text-on-surface-variant">Total SKUs en Catálogo</span>
          <span class="p-2 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">category</span>
          </span>
        </div>
        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">{{ products.length }}</h3>
          <p class="text-xs text-on-surface-variant mt-2">Productos registrados</p>
        </div>
      </div>

      <!-- KPI 3: Alertas de Stock -->
      <div class="card-elevated p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs sm:text-sm font-semibold text-on-surface-variant">Alertas de Stock</span>
          <span class="p-2 bg-error-red/10 rounded-xl text-error-red flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">warning</span>
          </span>
        </div>
        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-error-red tracking-tight">{{ stockAlertsCount }}</h3>
          <p class="text-xs text-on-surface-variant mt-2">SKUs por debajo del nivel crítico</p>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls Toolbar -->
    <div class="card-elevated p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- High-Contrast Search Input -->
      <div class="relative flex-1 max-w-md">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por SKU o nombre de producto..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <select
          v-model="selectedCategory"
          class="bg-surface-container border-0 text-on-surface text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
        >
          <option value="">Todas las Categorías</option>
          <option value="Agua">Agua Purificada</option>
          <option value="Café">Café e Insumos</option>
          <option value="Snacks">Snacks</option>
          <option value="Accesorios">Accesorios</option>
        </select>

        <select
          v-model="selectedStatus"
          class="bg-surface-container border-0 text-on-surface text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
        >
          <option value="">Cualquier Estado</option>
          <option value="ok">En Stock</option>
          <option value="low">Stock Bajo</option>
          <option value="out">Agotado</option>
        </select>

        <button
          @click="exportData"
          class="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm flex-1 sm:flex-none"
        >
          <span class="material-symbols-outlined text-sm">file_download</span>
          <span>Exportar</span>
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-elevated overflow-hidden w-full">
      <div class="overflow-x-auto custom-scrollbar w-full">
        <table class="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">SKU</th>
              <th class="py-4 px-6">Producto</th>
              <th class="py-4 px-6">Categoría</th>
              <th class="py-4 px-6 text-right">Stock Actual</th>
              <th class="py-4 px-6 text-right hidden lg:table-cell">Nivel Crítico</th>
              <th class="py-4 px-6 text-right hidden xl:table-cell">Precio Venta</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th v-if="authStore.canEditInventory" class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr
              v-for="item in filteredProducts"
              :key="item.sku"
              class="hover:bg-surface-container-high/40 transition-colors"
            >
              <!-- SKU -->
              <td class="py-3.5 px-6 text-sm font-bold font-mono text-primary">
                {{ item.sku }}
              </td>

              <!-- Producto -->
              <td class="py-3.5 px-6">
                <p class="text-sm font-semibold text-on-surface" :class="{ 'opacity-60': item.status === 'out' }">
                  {{ item.name }}
                </p>
              </td>

              <!-- Categoría -->
              <td class="py-3.5 px-6">
                <span class="text-xs px-2.5 py-1 rounded-lg bg-surface-container font-semibold text-on-surface-variant">
                  {{ item.category }}
                </span>
              </td>

              <!-- Stock -->
              <td class="py-3.5 px-6 text-right font-mono font-bold text-sm text-on-surface">
                {{ item.currentStock }}
              </td>

              <!-- Nivel Crítico -->
              <td class="py-3.5 px-6 text-right font-mono text-xs text-on-surface-variant hidden lg:table-cell">
                {{ item.minStock }}
              </td>

              <!-- Precio -->
              <td class="py-3.5 px-6 text-right font-mono font-bold text-sm text-billing-green hidden xl:table-cell">
                ${{ item.price.toFixed(2) }}
              </td>

              <!-- Estado -->
              <td class="py-3.5 px-6 text-center">
                <span
                  v-if="item.status === 'ok'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/15 text-billing-green px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> En Stock
                </span>
                <span
                  v-else-if="item.status === 'low'"
                  class="inline-flex items-center gap-1.5 bg-admin-gold/15 text-admin-gold px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-admin-gold animate-pulse"></span> Stock Bajo
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-error-red/15 text-error-red px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-error-red"></span> Agotado
                </span>
              </td>

              <!-- Acciones -->
              <td v-if="authStore.canEditInventory" class="py-3.5 px-6 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(item)"
                    class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                    title="Editar producto"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="deleteProduct(item)"
                    class="p-1.5 text-on-surface-variant hover:text-error-red hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                    title="Eliminar producto"
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
          Mostrando {{ filteredProducts.length }} de {{ products.length }} productos
        </span>
      </div>
    </div>

    <!-- Modal Formulario Producto (Crear / Editar) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative glass-card max-w-lg w-full p-6 z-10 animate-in">
        <div class="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">
              {{ isEditing ? 'edit_note' : 'inventory_2' }}
            </span>
            <div>
              <h3 class="text-lg font-bold text-on-surface">
                {{ isEditing ? 'Editar Producto' : 'Registrar Nuevo Producto' }}
              </h3>
              <p class="text-xs text-on-surface-variant">Ingrese los datos técnicos y comerciales</p>
            </div>
          </div>
          <button @click="showModal = false" class="p-1 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Inline Form Error Alert -->
        <div v-if="formError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ formError }}</span>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Código SKU *</label>
              <input
                v-model="productForm.sku"
                @input="validateField('sku')"
                @blur="validateField('sku')"
                type="text"
                required
                :disabled="isEditing"
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm disabled:opacity-50 transition-colors"
                :class="fieldErrors.sku ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
                placeholder="Ej: AQ-20L-RET"
              />
              <p v-if="fieldErrors.sku" class="text-[11px] text-error-red mt-1 font-medium">{{ fieldErrors.sku }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Categoría *</label>
              <select
                v-model="productForm.category"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="Agua">Agua</option>
                <option value="Café">Café</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Insumos">Insumos</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre del Producto *</label>
            <input
              v-model="productForm.name"
              @input="validateField('name')"
              @blur="validateField('name')"
              type="text"
              required
              class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
              :class="fieldErrors.name ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              placeholder="Ej: Botellón Agua Purificada 20L"
            />
            <p v-if="fieldErrors.name" class="text-[11px] text-error-red mt-1 font-medium">{{ fieldErrors.name }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Stock Actual *</label>
              <input
                v-model.number="productForm.currentStock"
                @input="validateField('currentStock')"
                @blur="validateField('currentStock')"
                type="number"
                min="0"
                step="1"
                required
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
                :class="fieldErrors.currentStock ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              />
              <p v-if="fieldErrors.currentStock" class="text-[11px] text-error-red mt-1 font-medium">{{ fieldErrors.currentStock }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Stock Mínimo (Alerta) *</label>
              <input
                v-model.number="productForm.minStock"
                @input="validateField('minStock')"
                @blur="validateField('minStock')"
                type="number"
                min="1"
                step="1"
                required
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
                :class="fieldErrors.minStock ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              />
              <p v-if="fieldErrors.minStock" class="text-[11px] text-error-red mt-1 font-medium">{{ fieldErrors.minStock }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Costo Unitario ($) *</label>
              <input
                v-model.number="productForm.cost"
                @input="validateField('cost')"
                @blur="validateField('cost')"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm font-mono transition-colors"
                :class="fieldErrors.cost ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              />
              <p v-if="fieldErrors.cost" class="text-[11px] text-error-red mt-1 font-medium">{{ fieldErrors.cost }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Precio Venta ($) *</label>
              <input
                v-model.number="productForm.price"
                @input="validateField('price')"
                @blur="validateField('price')"
                type="number"
                min="0.01"
                step="0.01"
                required
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm font-mono transition-colors"
                :class="fieldErrors.price ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              />
              <p v-if="fieldErrors.price" class="text-[11px] text-error-red mt-1 font-medium">{{ fieldErrors.price }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              {{ isEditing ? 'Guardar Cambios' : 'Registrar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';
import { useAuthStore } from '~/stores/auth';
import { useInventoryStore, type Product } from '~/stores/inventory';
import {
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateNonNegativeInteger,
  validatePositiveInteger,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

interface ProductItem {
  id?: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  cost: number;
  price: number;
  status: 'ok' | 'low' | 'out';
  waterLiters?: number;
  icon?: string;
}

const authStore = useAuthStore();
const inventoryStore = useInventoryStore();
const toast = useToast();

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const formError = ref('');

const fieldErrors = reactive({
  sku: '',
  name: '',
  currentStock: '',
  minStock: '',
  cost: '',
  price: '',
});

const productForm = ref({
  sku: '',
  name: '',
  category: 'Agua',
  currentStock: 50,
  minStock: 20,
  cost: 2.5,
  price: 5.0,
});

onMounted(() => {
  inventoryStore.init();
});

const products = computed<ProductItem[]>(() => {
  return inventoryStore.products.map(p => {
    const status: 'ok' | 'low' | 'out' =
      p.currentStock === 0
        ? 'out'
        : p.currentStock <= p.minStock
        ? 'low'
        : 'ok';
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      currentStock: p.currentStock,
      minStock: p.minStock,
      cost: p.cost,
      price: p.price,
      status,
      waterLiters: p.waterLiters,
      icon: p.icon,
    };
  });
});

const stockAlertsCount = computed(() => {
  return products.value.filter(p => p.status === 'low' || p.status === 'out').length;
});

const totalInventoryValue = computed(() => {
  return products.value.reduce((acc, p) => acc + p.currentStock * p.cost, 0);
});

const filteredProducts = computed(() => {
  return products.value.filter(item => {
    const matchSearch =
      !searchQuery.value.trim() ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim());
    const matchCategory = !selectedCategory.value || item.category === selectedCategory.value;
    const matchStatus = !selectedStatus.value || item.status === selectedStatus.value;
    return matchSearch && matchCategory && matchStatus;
  });
});

const exportData = () => {
  toast.info('Exportando inventario a archivo CSV...');
};

const validateField = (field: 'sku' | 'name' | 'currentStock' | 'minStock' | 'cost' | 'price') => {
  if (field === 'sku') {
    fieldErrors.sku = validateRequired(productForm.value.sku, 'El código SKU') || '';
  } else if (field === 'name') {
    fieldErrors.name = validateRequired(productForm.value.name, 'El nombre del producto') || '';
  } else if (field === 'currentStock') {
    fieldErrors.currentStock = validateNonNegativeInteger(productForm.value.currentStock, 'El stock actual') || '';
  } else if (field === 'minStock') {
    fieldErrors.minStock = validatePositiveInteger(productForm.value.minStock, 'El stock mínimo') || '';
  } else if (field === 'cost') {
    fieldErrors.cost = validatePositiveNumber(productForm.value.cost, 'El costo unitario') || '';
  } else if (field === 'price') {
    fieldErrors.price = validatePositiveNumber(productForm.value.price, 'El precio de venta') || '';
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  formError.value = '';
  fieldErrors.sku = '';
  fieldErrors.name = '';
  fieldErrors.currentStock = '';
  fieldErrors.minStock = '';
  fieldErrors.cost = '';
  fieldErrors.price = '';

  productForm.value = {
    sku: '',
    name: '',
    category: 'Agua',
    currentStock: 50,
    minStock: 20,
    cost: 2.5,
    price: 5.0,
  };
  showModal.value = true;
};

const openEditModal = (item: ProductItem) => {
  isEditing.value = true;
  formError.value = '';
  fieldErrors.sku = '';
  fieldErrors.name = '';
  fieldErrors.currentStock = '';
  fieldErrors.minStock = '';
  fieldErrors.cost = '';
  fieldErrors.price = '';

  productForm.value = {
    sku: item.sku,
    name: item.name,
    category: item.category,
    currentStock: item.currentStock,
    minStock: item.minStock,
    cost: item.cost,
    price: item.price,
  };
  showModal.value = true;
};

const saveProduct = () => {
  formError.value = '';
  const cleaned = sanitizeFormData(productForm.value);

  // Validate all fields
  validateField('sku');
  validateField('name');
  validateField('currentStock');
  validateField('minStock');
  validateField('cost');
  validateField('price');

  if (
    fieldErrors.sku ||
    fieldErrors.name ||
    fieldErrors.currentStock ||
    fieldErrors.minStock ||
    fieldErrors.cost ||
    fieldErrors.price
  ) {
    formError.value =
      fieldErrors.sku ||
      fieldErrors.name ||
      fieldErrors.currentStock ||
      fieldErrors.minStock ||
      fieldErrors.cost ||
      fieldErrors.price;
    return;
  }

  if (isEditing.value) {
    const updated = inventoryStore.updateProduct(cleaned.sku, {
      name: cleaned.name,
      category: cleaned.category as any,
      currentStock: Number(cleaned.currentStock),
      minStock: Number(cleaned.minStock),
      cost: Number(cleaned.cost),
      price: Number(cleaned.price),
    });
    if (updated) {
      toast.updateSuccess('Producto', `Producto ${cleaned.name} actualizado exitosamente.`);
    }
  } else {
    // Check duplicate SKU
    if (inventoryStore.products.some(p => p.sku.toLowerCase() === cleaned.sku.toLowerCase())) {
      formError.value = `Ya existe un producto con el SKU "${cleaned.sku}".`;
      return;
    }

    inventoryStore.addProduct({
      sku: cleaned.sku,
      name: cleaned.name,
      category: cleaned.category as any,
      currentStock: Number(cleaned.currentStock),
      minStock: Number(cleaned.minStock),
      cost: Number(cleaned.cost),
      price: Number(cleaned.price),
      waterLiters: cleaned.category === 'Agua' ? 20 : 0,
      icon: cleaned.category === 'Agua' ? 'water_drop' : 'inventory_2',
    });
    toast.createSuccess('Producto', `Producto ${cleaned.name} registrado con SKU ${cleaned.sku}.`);
  }

  showModal.value = false;
};

const deleteProduct = (item: ProductItem) => {
  inventoryStore.deleteProduct(item.sku);
  toast.deleteSuccess('Producto', `Producto ${item.name} (${item.sku}) eliminado.`);
};
</script>
