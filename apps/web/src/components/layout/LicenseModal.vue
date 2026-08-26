<template>
  <div>
    <!-- License Status Trigger Pill in Header -->
    <button
      @click="showModal = true"
      class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm border-0"
      :class="licenseStore.isTampered ? 'bg-error-red/15 text-error-red animate-pulse' : licenseStore.daysRemaining <= 5 ? 'bg-admin-gold/15 text-admin-gold' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'"
      title="Estado de Suscripción & Licencia"
    >
      <span class="material-symbols-outlined text-sm" :class="licenseStore.isTampered ? 'text-error-red' : licenseStore.daysRemaining <= 5 ? 'text-admin-gold' : 'text-primary'">
        {{ licenseStore.isTampered ? 'gpp_bad' : licenseStore.daysRemaining <= 5 ? 'alarm' : 'verified_user' }}
      </span>
      <span>
        {{ licenseStore.isTampered ? 'Licencia Bloqueada' : `${licenseStore.daysRemaining}d Restantes` }}
      </span>
    </button>

    <!-- License Activation & Renewal Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
          <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-xl">workspace_premium</span>
              </div>
              <div>
                <h4 class="text-base font-bold text-on-surface">Gestión de Suscripción</h4>
                <p class="text-xs text-on-surface-variant">Suscripción activa de 30 días</p>
              </div>
            </div>
            <button @click="showModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Anti-Tamper Security Alert if Flagged -->
          <div v-if="licenseStore.isTampered" class="mb-4 p-4 rounded-xl bg-error-red/15 border border-error-red/30 text-xs text-on-surface">
            <div class="flex items-center gap-2 font-bold text-error-red mb-1">
              <span class="material-symbols-outlined text-base">security</span>
              <span>Protección Anti-Manipulación Activada</span>
            </div>
            <p class="text-on-surface-variant leading-relaxed">
              {{ licenseStore.tamperReason }}
            </p>
          </div>

          <!-- Subscription Summary Details -->
          <div class="space-y-3 p-4 rounded-2xl bg-surface-container/60 mb-4 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-on-surface-variant">Plan Activo:</span>
              <span class="font-bold text-on-surface">{{ licenseStore.currentLicense.plan }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-on-surface-variant">Estado:</span>
              <span
                class="px-2 py-0.5 rounded-md font-bold text-[11px]"
                :class="licenseStore.isValid ? 'bg-billing-green/15 text-billing-green' : 'bg-error-red/15 text-error-red'"
              >
                {{ licenseStore.isValid ? 'Activo & Protegido' : 'Expirado / Bloqueado' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-on-surface-variant">Días Restantes:</span>
              <span class="font-extrabold text-sm text-primary">{{ licenseStore.daysRemaining }} Días</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-on-surface-variant">ID de Suscripción:</span>
              <span class="font-mono text-on-surface text-[11px]">{{ licenseStore.currentLicense.tenantId }}</span>
            </div>
          </div>

          <!-- Token Activation Form -->
          <form @submit.prevent="handleActivate" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Ingresar Token de Activación (30 Días) *
              </label>
              <input
                v-model="activationKey"
                type="text"
                required
                placeholder="Ej: AQUA-2026-30DY-PRO1"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm"
              />
              <p class="text-[11px] text-on-surface-variant mt-1">
                Ingrese el código criptográfico provisto por AquaPure System.
              </p>
            </div>

            <!-- Inline Error / Success Message -->
            <div v-if="statusMsg" class="p-3 rounded-xl text-xs font-semibold flex items-center gap-2" :class="isSuccess ? 'bg-billing-green/15 text-billing-green' : 'bg-error-red/15 text-error-red'">
              <span class="material-symbols-outlined text-sm">{{ isSuccess ? 'check_circle' : 'error' }}</span>
              <span>{{ statusMsg }}</span>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
              >
                Activar / Renovar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLicenseStore } from '~/stores/license';
import { useToast } from '~/composables/useToast';
import { validateRequired } from '~/utils/validators';

const licenseStore = useLicenseStore();
const toast = useToast();

const showModal = ref(false);
const activationKey = ref('');
const statusMsg = ref('');
const isSuccess = ref(false);

const handleActivate = () => {
  statusMsg.value = '';
  const valError = validateRequired(activationKey.value, 'El código de activación');
  if (valError) {
    statusMsg.value = valError;
    isSuccess.value = false;
    return;
  }

  const res = licenseStore.activateToken(activationKey.value);
  statusMsg.value = res.message;
  isSuccess.value = res.success;

  if (res.success) {
    toast.success('Suscripción renovada', 'Se han acreditado 30 días adicionales de acceso.');
    setTimeout(() => {
      showModal.value = false;
      activationKey.value = '';
      statusMsg.value = '';
    }, 1500);
  } else {
    toast.error('Error de activación', res.message);
  }
};
</script>
