<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    @click.self="close"
  >
    <div
      class="bg-surface border border-outline/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-outline/20 flex items-center justify-between bg-surface-container/40">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-xl">history</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-on-surface">Historial de Auditoría</h2>
              <span v-if="invoice" class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                {{ invoice.invoiceNo }}
              </span>
            </div>
            <p class="text-xs text-on-surface-variant">
              Trazabilidad inmutable de modificaciones y autorizaciones de supervisor
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

      <!-- Logs List -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
        <div v-if="logs.length === 0" class="py-12 text-center text-on-surface-variant space-y-2">
          <span class="material-symbols-outlined text-4xl opacity-40">policy</span>
          <p class="text-xs font-semibold">No se han registrado modificaciones en esta transacción.</p>
          <p class="text-[11px] opacity-70">Los datos originales se mantienen intactos desde su emisión.</p>
        </div>

        <div
          v-for="log in logs"
          :key="log.id"
          class="p-4 rounded-2xl border transition-all space-y-3"
          :class="[
            log.action === 'TRANSACTION_CANCEL'
              ? 'bg-error/5 border-error/25'
              : 'bg-surface-container/30 border-outline/20'
          ]"
        >
          <!-- Log Meta Header -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                :class="[
                  log.action === 'TRANSACTION_CANCEL'
                    ? 'bg-error/20 text-error'
                    : 'bg-amber-500/20 text-amber-500'
                ]"
              >
                <span class="material-symbols-outlined text-xs">
                  {{ log.action === 'TRANSACTION_CANCEL' ? 'cancel' : 'edit_note' }}
                </span>
                <span>{{ log.actionLabel }}</span>
              </span>

              <span class="text-[11px] font-mono text-on-surface-variant">
                {{ formatDateTime(log.timestamp) }}
              </span>
            </div>

            <span class="text-[11px] font-bold text-on-surface flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-primary">verified_user</span>
              <span>{{ log.authorizedBy }}</span>
            </span>
          </div>

          <!-- Reason & Justification -->
          <div class="p-2.5 rounded-xl bg-surface border border-outline/10 text-xs">
            <span class="font-bold text-on-surface-variant block text-[10px] uppercase">Motivo / Justificación:</span>
            <p class="text-on-surface font-medium mt-0.5">{{ log.reason }}</p>
          </div>

          <!-- Side by Side Diff -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <!-- Estado Anterior -->
            <div class="p-2.5 rounded-xl bg-surface border border-outline/10 space-y-1">
              <span class="text-[10px] font-bold text-error uppercase flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">arrow_back</span>
                <span>Estado Anterior</span>
              </span>
              <p class="text-[11px] text-on-surface-variant">
                Monto: <strong class="text-on-surface font-mono">${{ (log.previousState.total || 0).toFixed(2) }}</strong>
                ({{ currencyStore.formatVes(log.previousState.totalVes || 0) }})
              </p>
              <p class="text-[11px] text-on-surface-variant">
                Método: <span class="font-semibold text-on-surface">{{ log.previousState.paymentMethod }}</span>
              </p>
              <p v-if="log.previousState.referenceNumber" class="text-[10px] text-on-surface-variant font-mono">
                Ref: {{ log.previousState.referenceNumber }}
              </p>
              <p class="text-[10px] text-on-surface-variant truncate">
                {{ log.previousState.itemsSummary }}
              </p>
            </div>

            <!-- Nuevo Estado -->
            <div class="p-2.5 rounded-xl bg-surface border border-outline/10 space-y-1">
              <span class="text-[10px] font-bold text-success uppercase flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
                <span>Nuevo Estado Aplicado</span>
              </span>
              <p class="text-[11px] text-on-surface-variant">
                Monto: <strong class="text-on-surface font-mono">${{ (log.newState.total || 0).toFixed(2) }}</strong>
                ({{ currencyStore.formatVes(log.newState.totalVes || 0) }})
              </p>
              <p class="text-[11px] text-on-surface-variant">
                Método: <span class="font-semibold text-on-surface">{{ log.newState.paymentMethod }}</span>
              </p>
              <p v-if="log.newState.referenceNumber" class="text-[10px] text-on-surface-variant font-mono">
                Ref: {{ log.newState.referenceNumber }}
              </p>
              <p class="text-[10px] text-on-surface-variant truncate">
                {{ log.newState.itemsSummary }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3.5 border-t border-outline/20 flex items-center justify-between bg-surface-container/40">
        <span class="text-[11px] text-on-surface-variant">
          Total de eventos de auditoría: <strong>{{ logs.length }}</strong>
        </span>
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSalesStore, type SaleInvoice, type AuditLogEntry } from '~/stores/sales';
import { useCurrencyStore } from '~/stores/currency';

const props = defineProps<{
  modelValue: boolean;
  invoice: SaleInvoice | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const salesStore = useSalesStore();
const currencyStore = useCurrencyStore();

const logs = computed<AuditLogEntry[]>(() => {
  if (props.invoice) {
    return salesStore.getInvoiceAuditLogs(props.invoice.id);
  }
  return salesStore.auditLogs;
});

const formatDateTime = (iso: string): string => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('es-VE')} ${d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return iso;
  }
};

const close = () => {
  emit('update:modelValue', false);
};
</script>
