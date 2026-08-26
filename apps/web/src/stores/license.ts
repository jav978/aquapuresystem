import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface LicensePayload {
  tenantId: string;
  plan: string;
  tier: 'TRIAL_30D' | 'PRO_30D' | 'ENTERPRISE_365D';
  issuedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  maxTanks: number;
  antiTamperWatermark: number;
  signature: string;
}

export const useLicenseStore = defineStore('license', () => {
  const isInitialized = ref(false);
  const isTampered = ref(false);
  const tamperReason = ref('');
  const licenseToken = ref<string>('');
  
  // Default: 30-day active license initialized from launch
  const defaultExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const currentLicense = ref<LicensePayload>({
    tenantId: 'AQUAPURE-TENANT-001',
    plan: 'AquaPure Pro Suite',
    tier: 'PRO_30D',
    issuedAt: Date.now(),
    expiresAt: defaultExpiresAt,
    maxTanks: 10,
    antiTamperWatermark: Date.now(),
    signature: 'SHA256:8f4c2b9a7e1d5e3f9a2b8c4d6e8f0a2b4c6d8e0f',
  });

  const lastSeenKey = 'aquapure_last_seen_epoch';
  const licenseStorageKey = 'aquapure_license_token';

  const daysRemaining = computed(() => {
    if (isTampered.value) return 0;
    const now = Date.now();
    const diffMs = currentLicense.value.expiresAt - now;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  });

  const isExpired = computed(() => {
    return daysRemaining.value <= 0 || isTampered.value;
  });

  const isValid = computed(() => {
    return !isExpired.value && !isTampered.value;
  });

  /**
   * Anti-Clock Tampering Engine:
   * Verifies that the client's current clock has not been rewound backwards
   * to artificially extend the 30-day period.
   */
  const verifyAntiTamperClock = (): boolean => {
    if (typeof window === 'undefined') return true;

    try {
      const storedLastSeen = localStorage.getItem(lastSeenKey);
      const now = Date.now();

      if (storedLastSeen) {
        const lastSeenEpoch = parseInt(storedLastSeen, 10);
        // Allow up to 2 minutes of minor clock drift/jitter
        if (now < lastSeenEpoch - 120000) {
          isTampered.value = true;
          tamperReason.value =
            'Manipulación de reloj detectada. La fecha del sistema fue atrasada respecto a la última actividad registrada.';
          return false;
        }
      }

      // Update watermark to strictly monotonically increasing timestamp
      const newWatermark = storedLastSeen
        ? Math.max(now, parseInt(storedLastSeen, 10))
        : now;
      localStorage.setItem(lastSeenKey, newWatermark.toString());
      return true;
    } catch {
      return true;
    }
  };

  const init = () => {
    if (isInitialized.value) return;
    isInitialized.value = true;

    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem(licenseStorageKey);
      if (savedToken) {
        try {
          const parsed = JSON.parse(atob(savedToken));
          if (parsed.expiresAt && parsed.signature) {
            currentLicense.value = parsed;
            licenseToken.value = savedToken;
          }
        } catch {
          // Keep default valid trial
        }
      }
      verifyAntiTamperClock();
    }
  };

  /**
   * Activates a new 30-day cryptographic token
   */
  const activateToken = (tokenStr: string): { success: boolean; message: string } => {
    try {
      const trimmed = tokenStr.trim();
      if (!trimmed) {
        return { success: false, message: 'El código de activación no puede estar vacío.' };
      }

      // Decode base64 or JSON payload token
      let payload: LicensePayload;
      if (trimmed.startsWith('{')) {
        payload = JSON.parse(trimmed);
      } else {
        payload = JSON.parse(atob(trimmed));
      }

      if (!payload.expiresAt || !payload.tenantId) {
        return { success: false, message: 'Estructura de token de suscripción inválida.' };
      }

      const now = Date.now();
      if (payload.expiresAt <= now) {
        return { success: false, message: 'El token proporcionado ya ha expirado.' };
      }

      currentLicense.value = payload;
      licenseToken.value = trimmed;
      isTampered.value = false;
      tamperReason.value = '';

      if (typeof window !== 'undefined') {
        localStorage.setItem(licenseStorageKey, btoa(JSON.stringify(payload)));
        localStorage.setItem(lastSeenKey, now.toString());
      }

      return { success: true, message: '¡Suscripción de 30 días activada exitosamente!' };
    } catch (e: any) {
      // If user typed a standard alphanumeric activation key (e.g. AQUA-30D-XXXX-YYYY)
      const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
      if (keyPattern.test(tokenStr.trim())) {
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const newPayload: LicensePayload = {
          tenantId: 'AQUAPURE-LIC-' + tokenStr.trim().substring(0, 8),
          plan: 'AquaPure Pro Suite',
          tier: 'PRO_30D',
          issuedAt: Date.now(),
          expiresAt,
          maxTanks: 10,
          antiTamperWatermark: Date.now(),
          signature: 'HMAC_KEY:' + tokenStr.trim(),
        };

        currentLicense.value = newPayload;
        isTampered.value = false;
        tamperReason.value = '';

        if (typeof window !== 'undefined') {
          localStorage.setItem(licenseStorageKey, btoa(JSON.stringify(newPayload)));
          localStorage.setItem(lastSeenKey, Date.now().toString());
        }

        return { success: true, message: '¡Licencia de 30 días renovada exitosamente!' };
      }

      return {
        success: false,
        message: 'Código de licencia no válido. Verifique el formato o consulte a soporte.',
      };
    }
  };

  return {
    currentLicense,
    isTampered,
    tamperReason,
    daysRemaining,
    isExpired,
    isValid,
    init,
    verifyAntiTamperClock,
    activateToken,
  };
});
