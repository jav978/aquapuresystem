<template>
  <div
    v-if="modelValue && invoice"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    @click.self="close"
  >
    <div
      class="bg-surface border border-outline/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-outline/20 flex items-center justify-between bg-error/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-error/20 text-error flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-xl">assignment_return</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-on-surface">Anular / Devolución</h2>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-error/20 text-error border border-error/30">
                {{ invoice.invoiceNo }}
              </span>
            </div>
            <p class="text-xs text-on-surface-variant">Reverso de venta, inventario y arqueo de caja</p>
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

      <!-- Body -->
      <div class="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error flex items-start gap-2.5 text-xs animate-in shake"
        >
          <span class="material-symbols-outlined text-base flex-shrink-0">error</span>
          <span class="font-medium">{{ errorMessage }}</span>
        </div>

        <!-- Invoice Summary Card -->
        <div class="p-3.5 rounded-2xl bg-surface-container/40 border border-outline/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-on-surface-variant font-medium">Cliente:</span>
            <span class="text-xs font-bold text-on-surface truncate max-w-[240px]">{{ invoice.customer }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-on-surface-variant font-medium">Monto a Reversar:</span>
            <span class="text-sm font-black text-error font-mono">${{ invoice.total.toFixed(2) }} ({{ currencyStore.formatVes(invoice.totalVes) }})</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Método de Pago:</span>
            <span class="font-semibold text-on-surface">{{ invoice.payment.methodLabel || invoice.payment.method }}</span>
          </div>
          <div class="text-[11px] text-on-surface-variant pt-1 border-t border-outline/10">
            <span>Ítems: {{ invoice.itemsSummary }}</span>
          </div>
        </div>

        <!-- Water Return Decision -->
        <div v-if="invoice.waterLiters > 0" class="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-2.5">
          <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-base">water_drop</span>
            <h4 class="text-xs font-bold">Destino del Agua ({{ invoice.waterLiters }} Litros)</h4>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Por normas de bioseguridad sanitaria, si el agua ya salió de la planta o estuvo en contacto con el cliente, se recomienda registrarla como merma.
          </p>
          <div class="flex flex-col gap-2 pt-1">
            <label class="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer p-2 rounded-xl bg-surface border border-outline/20 hover:border-primary/50 transition-all">
              <input
                type="radio"
                name="waterAction"
                :value="true"
                v-model="returnWaterToTank"
                class="text-primary focus:ring-primary"
              />
              <div>
                <span class="font-bold">Reintegrar al Tanque Principal</span>
                <p class="text-[10px] text-on-surface-variant">Solo si la venta no salió del mostrador / error inmediato.</p>
              </div>
            </label>
            <label class="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer p-2 rounded-xl bg-surface border border-outline/20 hover:border-primary/50 transition-all">
              <input
                type="radio"
                name="waterAction"
                :value="false"
                v-model="returnWaterToTank"
                class="text-primary focus:ring-primary"
              />
              <div>
                <span class="font-bold">Declarar como Merma / Desecho</span>
                <p class="text-[10px] text-on-surface-variant">Recomendado para botellones devueltos o abiertos.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Physical Stock Restock Checkbox -->
        <div class="p-3 rounded-xl bg-surface-container/30 border border-outline/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-primary">inventory_2</span>
            <div>
              <p class="text-xs font-bold text-on-surface">Restituir productos físicos al stock</p>
              <p class="text-[10px] text-on-surface-variant">Sumar tapas, botellones o accesorios al inventario vendible.</p>
            </div>
          </div>
          <input
            type="checkbox"
            v-model="restockPhysicalItems"
            class="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <!-- Section 3: Reason and Supervisor PIN -->
        <div
          class="rounded-2xl p-4 space-y-3 transition-colors"
          :class="salesStore.supervisorSecurity.isLocked ? 'bg-error/15 border border-error/40' : 'bg-error/10 border border-error/20'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-error">
              <span class="material-symbols-outlined text-base">{{ salesStore.supervisorSecurity.isLocked ? 'lock_person' : 'lock' }}</span>
              <h3 class="text-xs font-bold uppercase tracking-wider">Autorización de Seguridad Requerida</h3>
            </div>
            <span
              v-if="salesStore.supervisorSecurity.isLocked"
              class="px-2 py-0.5 text-[10px] font-black bg-error text-white rounded-full animate-pulse"
            >
              BLOQUEADO POR INTENTOS
            </span>
            <span
              v-else-if="salesStore.supervisorSecurity.failedAttempts > 0"
              class="px-2 py-0.5 text-[10px] font-bold bg-error/20 text-error border border-error/30 rounded-full"
            >
              {{ 3 - salesStore.supervisorSecurity.failedAttempts }} intentos restantes
            </span>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
              Motivo de la Anulación *
            </label>
            <input
              v-model="cancelReason"
              type="text"
              placeholder="Ej: Cliente canceló pedido / Botellón con fisura"
              :disabled="salesStore.supervisorSecurity.isLocked"
              class="w-full bg-surface border border-error/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-error outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
              PIN de Supervisor del Día *
            </label>
            <input
              v-model="supervisorPin"
              type="password"
              maxlength="8"
              placeholder="••••"
              :disabled="salesStore.supervisorSecurity.isLocked"
              class="w-full bg-surface border border-error/40 rounded-xl px-3 py-2 text-sm font-mono tracking-widest text-on-surface text-center focus:ring-2 focus:ring-error outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="text-[10px] text-on-surface-variant/70 mt-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">schedule</span>
              PIN dinámico 24h (Gestionado por el Administrador en Configuración)
            </p>
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
          @click="submitCancel"
          :disabled="isSubmitting"
          class="px-5 py-2 rounded-xl bg-error text-white font-bold text-xs shadow-lg shadow-error/25 hover:bg-error/90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-base">cancel</span>
          <span>Confirmar Anulación / Reverso</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSalesStore, type SaleInvoice } from '~/stores/sales';
import { useCurrencyStore } from '~/stores/currency';
import { useToast } from '~/composables/useToast';

const props = defineProps<{
  modelValue: boolean;
  invoice: SaleInvoice | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'cancelled', invoice: SaleInvoice): void;
}>();

const salesStore = useSalesStore();
const currencyStore = useCurrencyStore();
const toast = useToast();

const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);
const supervisorPin = ref('');
const cancelReason = ref('');
const returnWaterToTank = ref(false); // Default to false (Biosecurity waste)
const restockPhysicalItems = ref(true);

watch(
  () => props.invoice,
  (inv) => {
    if (inv) {
      errorMessage.value = null;
      supervisorPin.value = '';
      cancelReason.value = '';
      returnWaterToTank.value = false;
      restockPhysicalItems.value = true;
    }
  },
  { immediate: true }
);

const close = () => {
  emit('update:modelValue', false);
};

const submitCancel = () => {
  errorMessage.value = null;

  if (!props.invoice) return;

  if (!supervisorPin.value.trim()) {
    errorMessage.value = 'Debes ingresar el PIN de Supervisor para autorizar la anulación.';
    return;
  }

  if (!cancelReason.value.trim()) {
    errorMessage.value = 'Debes ingresar el motivo de la anulación para el registro de auditoría.';
    return;
  }

  isSubmitting.value = true;

  const result = salesStore.cancelInvoice({
    invoiceId: props.invoice.id,
    supervisorPin: supervisorPin.value.trim(),
    reason: cancelReason.value.trim(),
    returnWaterToTank: returnWaterToTank.value,
    restockPhysicalItems: restockPhysicalItems.value,
  });

  isSubmitting.value = false;

  if (!result.success) {
    errorMessage.value = result.error || 'Error al anular la factura';
    return;
  }

  toast.deleteSuccess(
    'Factura Anulada & Reversada',
    `Comprobante ${props.invoice.invoiceNo} marcado como ANULADO. Reverso registrado en auditoría.`
  );

  if (result.invoice) {
    emit('cancelled', result.invoice);
  }
  close();
};
</script>
