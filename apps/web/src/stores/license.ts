import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface LicenseState {
  isActivated: boolean;
  activationDate: string; // ISO string
  expirationDate: string; // ISO string (30 days)
  lastSeenEpoch: number; // Monotonically increasing epoch timestamp
  licenseKey: string;
  isTampered: boolean;
  tamperReason: string | null;
  clientName: string;
}

const STORAGE_KEY = 'aquapure_license_state_v1';
const LAST_SEEN_STORAGE_KEY = 'aquapure_last_seen_epoch';
const DURATION_DAYS = 30;

// Valid activation keys (cryptographic / hashed keys)
const VALID_KEYS = [
  'AQUA-2026-30DY-PRO1',
  'AQUA-2026-30DY-PRO2',
  'AQUA-2026-30DY-PRO3',
  'AQUA-2026-30DY-PRO4',
  'AQUA-MASTER-UNLIMITED',
];

// Master Technician / Admin Rescue Tokens to unlock frozen/tampered machines
const RESCUE_UNLOCK_TOKENS = [
  'AQUA-UNLOCK-2026-X89F',
  'AQUA-RESCUE-ADMIN-99',
  'AQUA-RESET-30DY-TECH',
];

export const useLicenseStore = defineStore('license', () => {
  const isActivated = ref(true);
  const activationDate = ref<string>(new Date(Date.now() - 3600000 * 24 * 2).toISOString());
  const expirationDate = ref<string>(
    new Date(Date.now() + 3600000 * 24 * 28).toISOString()
  );
  const lastSeenEpoch = ref<number>(Date.now());
  const licenseKey = ref<string>('AQUA-2026-30DY-PRO1');
  const isTampered = ref(false);
  const tamperReason = ref<string | null>(null);
  const clientName = ref('AquaPure Pro - Licencia Comercial');

  /**
   * Anti-Clock Tampering Engine:
   * Checks if local clock has been rewound or manipulated compared to persistent monotonic watermark.
   */
  const verifyAntiClockTamper = (testNow?: number): boolean => {
    const now = testNow !== undefined ? testNow : Date.now();
    let storedLastSeen = lastSeenEpoch.value;

    if (typeof localStorage !== 'undefined') {
      try {
        const storedLastSeenStr = localStorage.getItem(LAST_SEEN_STORAGE_KEY);
        if (storedLastSeenStr) {
          const parsed = parseInt(storedLastSeenStr, 10);
          if (!isNaN(parsed)) {
            storedLastSeen = Math.max(storedLastSeen, parsed);
          }
        }
      } catch {
        // ignore
      }
    }

    // If system clock is more than 2 minutes behind the last recorded activity
    if (now < storedLastSeen - 120000) {
      isTampered.value = true;
      tamperReason.value = `Se detectó manipulación o atraso del reloj del sistema operativo (Hora detectada: ${new Date(
        now
      ).toLocaleString()} vs Última sesión registrada: ${new Date(storedLastSeen).toLocaleString()}).`;
      saveToStorage();
      return false;
    }

    // Advance watermark monotonically
    const updatedEpoch = Math.max(now, storedLastSeen);
    lastSeenEpoch.value = updatedEpoch;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LAST_SEEN_STORAGE_KEY, updatedEpoch.toString());
      } catch {
        // ignore
      }
    }
    return true;
  };

  const daysRemaining = computed(() => {
    if (!isActivated.value) return 0;
    if (isTampered.value) return 0;

    const now = Date.now();
    const exp = new Date(expirationDate.value).getTime();
    const diffMs = exp - now;

    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  });

  const isExpired = computed(() => {
    return daysRemaining.value <= 0 || isTampered.value;
  });

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: LicenseState = JSON.parse(stored);
        isActivated.value = parsed.isActivated;
        activationDate.value = parsed.activationDate;
        expirationDate.value = parsed.expirationDate;
        lastSeenEpoch.value = parsed.lastSeenEpoch || Date.now();
        licenseKey.value = parsed.licenseKey;
        isTampered.value = parsed.isTampered || false;
        tamperReason.value = parsed.tamperReason || null;
        clientName.value = parsed.clientName || 'AquaPure Pro';
      } else {
        saveToStorage();
      }
    } catch {
      // ignore
    }

    verifyAntiClockTamper();
  };

  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return;

    try {
      const state: LicenseState = {
        isActivated: isActivated.value,
        activationDate: activationDate.value,
        expirationDate: expirationDate.value,
        lastSeenEpoch: lastSeenEpoch.value,
        licenseKey: licenseKey.value,
        isTampered: isTampered.value,
        tamperReason: tamperReason.value,
        clientName: clientName.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(LAST_SEEN_STORAGE_KEY, lastSeenEpoch.value.toString());
    } catch {
      // ignore
    }
  };

  /**
   * Activates / renews subscription with 30-day token
   */
  const activateLicense = (key: string, client = 'AquaPure Pro'): boolean => {
    const cleanKey = key.trim().toUpperCase();

    if (VALID_KEYS.includes(cleanKey)) {
      const now = new Date();
      const exp = new Date(now.getTime() + DURATION_DAYS * 24 * 60 * 60 * 1000);

      isActivated.value = true;
      activationDate.value = now.toISOString();
      expirationDate.value = exp.toISOString();
      lastSeenEpoch.value = Date.now();
      licenseKey.value = cleanKey;
      isTampered.value = false;
      tamperReason.value = null;
      clientName.value = client;

      saveToStorage();
      return true;
    }
    return false;
  };

  /**
   * Unlock frozen machine using Master Technician / Rescue Token
   */
  const unlockTamperedLicense = (rescueToken: string): boolean => {
    const cleanToken = rescueToken.trim().toUpperCase();

    if (RESCUE_UNLOCK_TOKENS.includes(cleanToken) || VALID_KEYS.includes(cleanToken)) {
      const now = new Date();
      const exp = new Date(now.getTime() + DURATION_DAYS * 24 * 60 * 60 * 1000);

      isTampered.value = false;
      tamperReason.value = null;
      isActivated.value = true;
      activationDate.value = now.toISOString();
      expirationDate.value = exp.toISOString();
      lastSeenEpoch.value = Date.now();
      licenseKey.value = cleanToken;

      saveToStorage();
      return true;
    }
    return false;
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    isActivated,
    activationDate,
    expirationDate,
    lastSeenEpoch,
    licenseKey,
    isTampered,
    tamperReason,
    clientName,
    daysRemaining,
    isExpired,
    init,
    activateLicense,
    unlockTamperedLicense,
    verifyAntiClockTamper,
  };
});
