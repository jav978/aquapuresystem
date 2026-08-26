<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:p-0"
    >
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md print:hidden" @click="close"></div>

      <div class="relative w-full max-w-lg bg-surface-dim border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in max-h-[95vh] overflow-y-auto print:max-w-none print:w-full print:border-0 print:p-4 print:bg-white print:text-black">
        <!-- Close button (Hidden on print) -->
        <button
          @click="close"
          class="absolute top-4 right-4 p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer print:hidden"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Printable Invoice Content -->
        <div id="printable-receipt" class="space-y-4 text-xs font-sans">
          <!-- Enterprise Header -->
          <div class="text-center pb-3 border-b border-black/10 dark:border-white/10 print:border-black space-y-1">
            <div class="flex items-center justify-center gap-2 mb-1">
              <span class="p-1.5 rounded-lg bg-primary/15 text-primary material-symbols-outlined text-lg print:text-black">water_drop</span>
              <h3 class="text-base font-black text-on-surface tracking-tight print:text-black">AquaPure Pro S.A.</h3>
            </div>
            <p class="text-[11px] font-mono font-bold text-on-surface print:text-black">RIF: J-20549382-9</p>
            <p class="text-[10px] text-on-surface-variant print:text-black">Av. Tecnológica 1042, Parque Industrial • Tel: +58 414 123 4567</p>
            <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary print:bg-gray-100 print:text-black font-extrabold text-[10px]">
              COMPROBANTE FISCAL DIGITAL
            </span>
          </div>

          <!-- Invoice & Customer Metadata Grid -->
          <div class="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-black/10 dark:border-white/10 print:border-black">
            <div>
              <span class="text-on-surface-variant print:text-black block text-[10px]">Nº Factura:</span>
              <span class="font-mono font-extrabold text-primary print:text-black text-xs">{{ invoice.invoiceNo }}</span>
            </div>
            <div class="text-right">
              <span class="text-on-surface-variant print:text-black block text-[10px]">Fecha & Hora:</span>
              <span class="font-bold text-on-surface print:text-black">{{ formatDateTime(invoice.dateTime || invoice.date) }}</span>
            </div>

            <div class="col-span-2 pt-1">
              <span class="text-on-surface-variant print:text-black block text-[10px]">Cliente / Razón Social:</span>
              <span class="font-bold text-on-surface print:text-black">{{ invoice.customer }}</span>
              <span class="font-mono text-on-surface-variant print:text-black text-[10px] block">
                Doc: {{ invoice.customerDoc || 'No especificado' }}
              </span>
            </div>

            <div v-if="invoice.customerAddress" class="col-span-2">
              <span class="text-on-surface-variant print:text-black block text-[10px]">Dirección de Entrega:</span>
              <span class="text-on-surface print:text-black">{{ invoice.customerAddress }}</span>
            </div>
          </div>

          <!-- Items Table -->
          <div class="pb-3 border-b border-black/10 dark:border-white/10 print:border-black">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-on-surface-variant print:text-black border-b border-black/5 dark:border-white/5 print:border-black">
                  <th class="py-1">Cant.</th>
                  <th class="py-1">Descripción</th>
                  <th class="py-1 text-right">P. Unit</th>
                  <th class="py-1 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/5 dark:divide-white/5 print:divide-gray-300">
                <tr v-for="item in (invoice.items || [])" :key="item.productId" class="text-[11px]">
                  <td class="py-1.5 font-bold">{{ item.quantity }}x</td>
                  <td class="py-1.5">{{ item.name }}</td>
                  <td class="py-1.5 text-right font-mono">${{ (item.price || 0).toFixed(2) }}</td>
                  <td class="py-1.5 text-right font-mono font-bold">${{ (item.subtotal || item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals & BCV Breakdown -->
          <div class="space-y-1.5 pb-3 border-b border-black/10 dark:border-white/10 print:border-black text-[11px]">
            <div class="flex justify-between">
              <span class="text-on-surface-variant print:text-black">Tasa Oficial BCV:</span>
              <span class="font-mono font-bold text-billing-green print:text-black">Bs. {{ (invoice.bcvRate || 62.45).toFixed(2) }} / USD</span>
            </div>

            <div class="flex justify-between text-sm font-extrabold pt-1">
              <span class="text-on-surface print:text-black">TOTAL EN DÓLARES:</span>
              <span class="font-mono text-primary print:text-black">${{ (invoice.total || 0).toFixed(2) }} USD</span>
            </div>

            <div class="flex justify-between text-xs font-extrabold">
              <span class="text-on-surface-variant print:text-black">TOTAL EN BOLÍVARES:</span>
              <span class="font-mono text-billing-green print:text-black">Bs. {{ formatVes(invoice.totalVes || (invoice.total * (invoice.bcvRate || 62.45))) }}</span>
            </div>
          </div>

          <!-- Payment Details & Banking Reconciliation Breakdown -->
          <div class="p-3 rounded-2xl bg-surface-container/60 print:bg-gray-50 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-on-surface-variant print:text-black font-semibold">Método de Pago:</span>
              <span class="font-bold text-on-surface print:text-black">{{ invoice.payment?.methodLabel || invoice.payment?.method || 'Efectivo / Transferencia' }}</span>
            </div>

            <!-- If Cash: Show received & change -->
            <div v-if="invoice.payment?.receivedAmount" class="flex justify-between">
              <span class="text-on-surface-variant print:text-black">Monto Recibido:</span>
              <span class="font-mono font-bold text-on-surface print:text-black">${{ (invoice.payment.receivedAmount).toFixed(2) }}</span>
            </div>
            <div v-if="invoice.payment?.changeUsd !== undefined && invoice.payment?.changeUsd > 0" class="flex justify-between text-billing-green print:text-black font-bold">
              <span>Vuelto / Cambio:</span>
              <span class="font-mono">${{ invoice.payment.changeUsd.toFixed(2) }} (Bs. {{ formatVes(invoice.payment.changeVes || 0) }})</span>
            </div>

            <!-- If Bank / Pago Móvil: Show Bank & Reference -->
            <div v-if="invoice.payment?.bankName" class="flex justify-between">
              <span class="text-on-surface-variant print:text-black">Banco Receptor:</span>
              <span class="font-bold text-on-surface print:text-black">{{ invoice.payment.bankName }}</span>
            </div>
            <div v-if="invoice.payment?.referenceNumber" class="flex justify-between">
              <span class="text-on-surface-variant print:text-black">Nº Referencia / Aprobación:</span>
              <span class="font-mono font-black text-primary print:text-black">{{ invoice.payment.referenceNumber }}</span>
            </div>
          </div>

          <!-- Dynamic Fiscal QR Code -->
          <div class="pt-2 flex flex-col items-center justify-center text-center space-y-1.5">
            <!-- Simulated High-Precision Fiscal QR Code Pattern -->
            <div class="p-2.5 rounded-2xl bg-white shadow-md inline-block border border-black/10">
              <svg class="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- QR Finder Patterns (Top-Left, Top-Right, Bottom-Left) -->
                <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4"/>
                <rect x="9" y="9" width="18" height="18" fill="white" rx="2"/>
                <rect x="13" y="13" width="10" height="10" fill="#0f172a" rx="1"/>

                <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4"/>
                <rect x="73" y="9" width="18" height="18" fill="white" rx="2"/>
                <rect x="77" y="13" width="10" height="10" fill="#0f172a" rx="1"/>

                <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4"/>
                <rect x="9" y="73" width="18" height="18" fill="white" rx="2"/>
                <rect x="13" y="77" width="10" height="10" fill="#0f172a" rx="1"/>

                <!-- QR Data Matrix Dots -->
                <rect x="36" y="8" width="5" height="5" fill="#0f172a"/>
                <rect x="46" y="8" width="5" height="5" fill="#0f172a"/>
                <rect x="56" y="8" width="5" height="5" fill="#0f172a"/>
                <rect x="36" y="18" width="5" height="5" fill="#0f172a"/>
                <rect x="46" y="18" width="5" height="5" fill="#0f172a"/>
                <rect x="56" y="18" width="5" height="5" fill="#0f172a"/>

                <rect x="8" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="18" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="28" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="38" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="48" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="58" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="68" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="78" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="88" y="36" width="5" height="5" fill="#0f172a"/>

                <rect x="36" y="46" width="5" height="5" fill="#0f172a"/>
                <rect x="46" y="46" width="5" height="5" fill="#0f172a"/>
                <rect x="56" y="46" width="5" height="5" fill="#0f172a"/>
                <rect x="66" y="46" width="5" height="5" fill="#0f172a"/>
                <rect x="76" y="46" width="5" height="5" fill="#0f172a"/>
                <rect x="86" y="46" width="5" height="5" fill="#0f172a"/>

                <rect x="8" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="18" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="28" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="38" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="48" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="58" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="68" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="78" y="56" width="5" height="5" fill="#0f172a"/>
                <rect x="88" y="56" width="5" height="5" fill="#0f172a"/>

                <rect x="36" y="66" width="5" height="5" fill="#0f172a"/>
                <rect x="46" y="66" width="5" height="5" fill="#0f172a"/>
                <rect x="56" y="66" width="5" height="5" fill="#0f172a"/>
                <rect x="66" y="66" width="5" height="5" fill="#0f172a"/>
                <rect x="76" y="66" width="5" height="5" fill="#0f172a"/>
                <rect x="86" y="66" width="5" height="5" fill="#0f172a"/>

                <rect x="36" y="76" width="5" height="5" fill="#0f172a"/>
                <rect x="46" y="76" width="5" height="5" fill="#0f172a"/>
                <rect x="56" y="76" width="5" height="5" fill="#0f172a"/>
                <rect x="66" y="76" width="5" height="5" fill="#0f172a"/>
                <rect x="76" y="76" width="5" height="5" fill="#0f172a"/>
                <rect x="86" y="76" width="5" height="5" fill="#0f172a"/>

                <rect x="36" y="86" width="5" height="5" fill="#0f172a"/>
                <rect x="46" y="86" width="5" height="5" fill="#0f172a"/>
                <rect x="56" y="86" width="5" height="5" fill="#0f172a"/>
                <rect x="66" y="86" width="5" height="5" fill="#0f172a"/>
                <rect x="76" y="86" width="5" height="5" fill="#0f172a"/>
                <rect x="88" y="86" width="5" height="5" fill="#0f172a"/>
              </svg>
            </div>
            <p class="text-[9px] text-on-surface-variant print:text-black font-mono">
              Escanear código QR para validación fiscal en línea
            </p>
            <p class="text-[8px] text-on-surface-variant/70 print:text-black font-mono">
              {{ invoice.qrPayload }}
            </p>
          </div>
        </div>

        <!-- Action Buttons (Hidden on Print) -->
        <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-black/10 dark:border-white/10 print:hidden">
          <button
            type="button"
            @click="close"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            @click="printReceipt"
            class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-lg shadow-primary/25"
          >
            <span class="material-symbols-outlined text-base">print</span>
            <span>Imprimir Comprobante</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { SaleInvoice } from '~/stores/sales';

const props = defineProps<{
  modelValue: boolean;
  invoice: SaleInvoice | Record<string, any>;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
}>();

const close = () => {
  emit('update:modelValue', false);
};

const printReceipt = () => {
  if (typeof window !== 'undefined') {
    window.print();
  }
};

const formatDateTime = (val?: string): string => {
  if (!val) return 'Hoy';
  try {
    return new Date(val).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return val;
  }
};

const formatVes = (val?: number): string => {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
};
</script>
