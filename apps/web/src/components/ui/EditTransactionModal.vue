<template>
  <div
    v-if="modelValue && invoice"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    @click.self="close"
  >
    <div
      class="bg-surface border border-outline/30 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-outline/20 flex items-center justify-between bg-surface-container/40">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-xl">edit_note</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-on-surface">Corregir Transacción</h2>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                {{ invoice.invoiceNo }}
              </span>
            </div>
            <p class="text-xs text-on-surface-variant">
              Modificación de montos, productos o método de pago con autorización
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="close"
          class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error flex items-start gap-2.5 text-xs animate-in shake"
        >
          <span class="material-symbols-outlined text-base flex-shrink-0">error</span>
          <span class="font-medium">{{ errorMessage }}</span>
        </div>

        <!-- Section 1: Customer Data -->
        <div class="bg-surface-container/30 border border-outline/20 rounded-2xl p-4 space-y-3">
          <h3 class="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-primary">person</span>
            <span>Datos del Cliente</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Nombre / Razón Social</label>
              <input
                v-model="editForm.customerName"
                type="text"
                class="w-full bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Cédula / RIF</label>
              <input
                v-model="editForm.customerDoc"
                type="text"
                class="w-full bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs font-mono text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: Items in Invoice -->
        <div class="bg-surface-container/30 border border-outline/20 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm text-primary">shopping_bag</span>
              <span>Productos en la Factura</span>
            </h3>
            <span class="text-[11px] text-on-surface-variant font-medium">
              Total Agua: <strong class="text-primary">{{ calculatedWaterLiters }} L</strong>
            </span>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, idx) in editForm.items"
              :key="idx"
              class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-outline/20 text-xs"
            >
              <div class="flex-1 min-w-0">
                <p class="font-bold text-on-surface truncate">{{ item.name }}</p>
                <p class="text-[10px] text-on-surface-variant">
                  ${{ item.price.toFixed(2) }} c/u • {{ item.waterLiters ? `${item.waterLiters * item.quantity}L de agua` : 'Sin agua' }}
                </p>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="decrementItem(idx)"
                  class="w-6 h-6 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer font-bold"
                >
                  -
                </button>
                <span class="w-7 text-center font-bold text-on-surface font-mono">{{ item.quantity }}</span>
                <button
                  type="button"
                  @click="incrementItem(idx)"
                  class="w-6 h-6 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer font-bold"
                >
                  +
                </button>
              </div>

              <!-- Subtotal & Remove -->
              <div class="text-right min-w-[65px]">
                <p class="font-mono font-bold text-on-surface">${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>

              <button
                type="button"
                @click="removeItem(idx)"
                class="text-error/70 hover:text-error p-1 rounded-lg hover:bg-error/10 cursor-pointer"
                title="Quitar producto"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>

            <!-- Quick Add Product Dropdown -->
            <div class="pt-2 flex gap-2">
              <select
                v-model="selectedAddProduct"
                class="flex-1 bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none"
              >
                <option :value="null">-- Agregar producto a la factura --</option>
                <option
                  v-for="p in availableCatalog"
                  :key="p.id"
                  :value="p"
                >
                  {{ p.name }} - ${{ p.price.toFixed(2) }}
                </option>
              </select>
              <button
                type="button"
                @click="addItemFromCatalog"
                :disabled="!selectedAddProduct"
                class="px-3 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Section 3: Payment & Financials -->
        <div class="bg-surface-container/30 border border-outline/20 rounded-2xl p-4 space-y-3">
          <h3 class="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-primary">payments</span>
            <span>Pago y Totales Recalculados</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Método de Pago</label>
              <select
                v-model="editForm.paymentMethod"
                class="w-full bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none"
              >
                <option value="CASH_USD">Efectivo Dólares ($)</option>
                <option value="CASH_VES">Efectivo Bolívares (Bs.)</option>
                <option value="PAGO_MOVIL">Pago Móvil</option>
                <option value="TRANSFER">Transferencia Bancaria</option>
                <option value="POS_CARD">Punto de Venta (Tarjeta)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Estado de Pago</label>
              <select
                v-model="editForm.status"
                class="w-full bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none"
              >
                <option value="PAID">Pagado</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>

            <div v-if="editForm.paymentMethod === 'PAGO_MOVIL' || editForm.paymentMethod === 'TRANSFER'">
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Referencia Bancaria</label>
              <input
                v-model="editForm.referenceNumber"
                type="text"
                placeholder="Últimos dígitos de referencia"
                class="w-full bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs font-mono text-on-surface outline-none"
              />
            </div>

            <div v-if="editForm.paymentMethod === 'CASH_USD' || editForm.paymentMethod === 'CASH_VES'">
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Monto Recibido ({{ editForm.paymentMethod === 'CASH_USD' ? '$' : 'Bs.' }})
              </label>
              <input
                v-model.number="editForm.receivedAmount"
                type="number"
                step="0.01"
                class="w-full bg-surface border border-outline/30 rounded-xl px-3 py-2 text-xs font-mono text-on-surface outline-none"
              />
            </div>
          </div>

          <!-- Total Calculation Card -->
          <div class="mt-3 p-3 rounded-xl bg-surface border border-primary/20 flex items-center justify-between">
            <div>
              <p class="text-[10px] text-on-surface-variant font-semibold">NUEVO TOTAL FACTURA</p>
              <p class="text-lg font-black text-primary font-mono">${{ calculatedTotalUsd.toFixed(2) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-on-surface-variant font-semibold">TASA BCV: {{ currencyStore.formatRate }}</p>
              <p class="text-xs font-bold text-on-surface font-mono">{{ currencyStore.formatVes(calculatedTotalVes) }}</p>
            </div>
          </div>
        </div>

        <!-- Section 4: Supervisor Authorization & Reason -->
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div class="flex items-center gap-2 text-amber-500">
            <span class="material-symbols-outlined text-base">lock</span>
            <h3 class="text-xs font-bold uppercase tracking-wider">Autorización de Supervisor (Requerida)</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
                PIN de Supervisor * (Default: 1234)
              </label>
              <input
                v-model="supervisorPinInput"
                type="password"
                maxlength="8"
                placeholder="••••"
                class="w-full bg-surface border border-amber-500/40 rounded-xl px-3 py-2 text-sm font-mono tracking-widest text-on-surface text-center focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Motivo de la Corrección *
              </label>
              <input
                v-model="correctionReason"
                type="text"
                placeholder="Ej: Error en cantidad digitada por cajero"
                class="w-full bg-surface border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="px-6 py-4 border-t border-outline/20 flex items-center justify-end gap-3 bg-surface-container/40">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="submitEdit"
          :disabled="isSubmitting || editForm.items.length === 0"
          class="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/25 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-base">verified_user</span>
          <span>Autorizar & Guardar Corrección</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useSalesStore, type SaleInvoice, type PaymentMethodType, type InvoiceStatus } from '~/stores/sales';
import { useInventoryStore, type Product } from '~/stores/inventory';
import { useCurrencyStore } from '~/stores/currency';
import { useToast } from '~/composables/useToast';

const props = defineProps<{
  modelValue: boolean;
  invoice: SaleInvoice | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'updated', invoice: SaleInvoice): void;
}>();

const salesStore = useSalesStore();
const inventoryStore = useInventoryStore();
const currencyStore = useCurrencyStore();
const toast = useToast();

const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);
const supervisorPinInput = ref('');
const correctionReason = ref('');
const selectedAddProduct = ref<Product | null>(null);

const editForm = reactive({
  customerName: '',
  customerDoc: '',
  paymentMethod: 'CASH_USD' as PaymentMethodType,
  status: 'PAID' as InvoiceStatus,
  receivedAmount: 0,
  referenceNumber: '',
  bankName: '',
  items: [] as {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    waterLiters: number;
  }[],
});

const availableCatalog = computed(() => {
  return inventoryStore.products;
});

watch(
  () => props.invoice,
  (inv) => {
    if (inv) {
      errorMessage.value = null;
      supervisorPinInput.value = '';
      correctionReason.value = '';
      selectedAddProduct.value = null;

      editForm.customerName = inv.customer || '';
      editForm.customerDoc = inv.customerDoc || '';
      editForm.paymentMethod = inv.payment.method;
      editForm.status = inv.status;
      editForm.receivedAmount = inv.payment.receivedAmount || inv.total;
      editForm.referenceNumber = inv.payment.referenceNumber || '';
      editForm.bankName = inv.payment.bankName || '';
      editForm.items = (inv.items || []).map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        waterLiters: i.waterLiters || 0,
      }));
    }
  },
  { immediate: true }
);

const calculatedTotalUsd = computed(() => {
  return editForm.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

const calculatedTotalVes = computed(() => {
  return currencyStore.toVes(calculatedTotalUsd.value);
});

const calculatedWaterLiters = computed(() => {
  return editForm.items.reduce((sum, i) => sum + (i.waterLiters || 0) * i.quantity, 0);
});

const incrementItem = (idx: number) => {
  if (editForm.items[idx]) {
    editForm.items[idx].quantity += 1;
  }
};

const decrementItem = (idx: number) => {
  if (editForm.items[idx]) {
    if (editForm.items[idx].quantity > 1) {
      editForm.items[idx].quantity -= 1;
    } else {
      removeItem(idx);
    }
  }
};

const removeItem = (idx: number) => {
  editForm.items.splice(idx, 1);
};

const addItemFromCatalog = () => {
  if (!selectedAddProduct.value) return;
  const existing = editForm.items.find((i) => i.productId === selectedAddProduct.value!.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    editForm.items.push({
      productId: selectedAddProduct.value.id,
      name: selectedAddProduct.value.name,
      price: selectedAddProduct.value.price,
      quantity: 1,
      waterLiters: selectedAddProduct.value.waterLiters || 0,
    });
  }
  selectedAddProduct.value = null;
};

const close = () => {
  emit('update:modelValue', false);
};

const submitEdit = () => {
  errorMessage.value = null;

  if (!props.invoice) return;

  if (!supervisorPinInput.value.trim()) {
    errorMessage.value = 'Debes ingresar el PIN de Supervisor para autorizar este cambio.';
    return;
  }

  if (!correctionReason.value.trim()) {
    errorMessage.value = 'Debes especificar el motivo de la corrección para el registro de auditoría.';
    return;
  }

  if (editForm.items.length === 0) {
    errorMessage.value = 'La factura debe tener al menos un producto.';
    return;
  }

  isSubmitting.value = true;

  const result = salesStore.editInvoice({
    invoiceId: props.invoice.id,
    supervisorPin: supervisorPinInput.value.trim(),
    reason: correctionReason.value.trim(),
    updatedCustomer: {
      name: editForm.customerName.trim(),
      docNumber: editForm.customerDoc.trim(),
    },
    updatedPayment: {
      method: editForm.paymentMethod,
      receivedAmount: editForm.receivedAmount,
      referenceNumber: editForm.referenceNumber.trim(),
      bankName: editForm.bankName.trim(),
    },
    updatedItems: editForm.items,
    newStatus: editForm.status,
  });

  isSubmitting.value = false;

  if (!result.success) {
    errorMessage.value = result.error || 'Error al autorizar corrección';
    return;
  }

  toast.createSuccess(
    'Transacción Corregida',
    `Factura ${props.invoice.invoiceNo} actualizada y registrada en auditoría.`
  );

  if (result.invoice) {
    emit('updated', result.invoice);
  }
  close();
};
</script>
