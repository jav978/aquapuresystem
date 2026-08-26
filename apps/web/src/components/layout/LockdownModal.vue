<template>
  <Teleport to="body">
    <div
      v-if="licenseStore.isTampered"
      class="fixed inset-0 z-[99999] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 select-none"
    >
      <div class="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface-dim/95 border border-error-red/40 shadow-2xl shadow-error-red/20 text-center animate-in">
        <!-- Glowing Alert Icon -->
        <div class="w-20 h-20 rounded-3xl bg-error-red/15 text-error-red border border-error-red/30 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-error-red/25">
          <span class="material-symbols-outlined text-4xl animate-bounce">gfm</span>
        </div>

        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-red/20 text-error-red text-xs font-black uppercase tracking-wider mb-2">
          <span class="w-2 h-2 rounded-full bg-error-red animate-ping"></span>
          Bloqueo de Seguridad Anti-Fraude
        </div>

        <h3 class="text-2xl font-black text-on-surface tracking-tight mt-1">
          Acceso al Sistema Suspendido
        </h3>

        <p class="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
          Se ha detectado una alteración o atraso en el reloj del sistema operativo / BIOS para evadir el ciclo de suscripción de 30 días. Por políticas de seguridad, el sistema se encuentra totalmente bloqueado.
        </p>

        <!-- Technical incident box -->
        <div class="p-3.5 rounded-2xl bg-surface-container-highest/30 border border-error-red/20 my-4 text-left text-xs font-mono text-error-red/90 space-y-1">
          <p class="text-[11px] font-bold text-on-surface">Registro Criptográfico del Incidente:</p>
          <p class="text-[10px] break-all opacity-80">{{ licenseStore.tamperReason }}</p>
          <p class="text-[10px] text-on-surface-variant">ID de Instalación: <span class="font-bold text-on-surface">AQ-PRO-2026-SRV1</span></p>
        </div>

        <!-- Error alert if unlock token is invalid -->
        <div v-if="unlockError" class="mb-4 p-3 rounded-xl bg-error-red/20 text-error-red text-xs font-bold">
          {{ unlockError }}
        </div>

        <!-- Success alert -->
        <div v-if="unlockSuccess" class="mb-4 p-3 rounded-xl bg-billing-green/20 text-billing-green text-xs font-bold">
          {{ unlockSuccess }}
        </div>

        <!-- Technician Rescue Token Input -->
        <form @submit.prevent="handleUnlock" class="space-y-3">
          <div class="text-left">
            <label class="block text-xs font-bold text-on-surface mb-1">
              Token de Desbloqueo Técnico / Administrador:
            </label>
            <input
              v-model="rescueToken"
              type="text"
              required
              placeholder="Ej: AQUA-UNLOCK-2026-X89F"
              class="w-full bg-surface-container border border-error-red/40 rounded-xl px-4 py-2.5 text-on-surface text-sm font-mono font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-error-red hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-error-red/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-lg">lock_open</span>
            <span>Desbloquear y Restaurar Sistema</span>
          </button>
        </form>

        <p class="text-[11px] text-on-surface-variant/70 mt-4">
          Contacte al administrador o proveedor del software para obtener un token de reactivación.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLicenseStore } from '~/stores/license';
import { useToast } from '~/composables/useToast';

const licenseStore = useLicenseStore();
const toast = useToast();

const rescueToken = ref('');
const unlockError = ref<string | null>(null);
const unlockSuccess = ref<string | null>(null);

const handleUnlock = () => {
  unlockError.value = null;
  unlockSuccess.value = null;

  if (!rescueToken.value.trim()) {
    unlockError.value = 'Ingrese el código de desbloqueo suministrado por el técnico.';
    return;
  }

  const ok = licenseStore.unlockTamperedLicense(rescueToken.value);
  if (ok) {
    unlockSuccess.value = 'Sistema desbloqueado y reactivado exitosamente por 30 días.';
    rescueToken.value = '';
    toast.success('Seguridad Restaurada', 'La suscripción ha sido reactivada legítimamente.');
  } else {
    unlockError.value = 'Token de desbloqueo inválido o no autorizado.';
  }
};
</script>
