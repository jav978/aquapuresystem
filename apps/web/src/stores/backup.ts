import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSalesStore } from './sales';
import { useCustomersStore } from './customers';
import { useInventoryStore } from './inventory';
import { useTanksStore } from './tanks';
import { useCurrencyStore } from './currency';

export interface AquaPureBackupPackage {
  metadata: {
    appName: string;
    version: string;
    schemaVersion: number;
    createdAt: string;
    totalInvoices: number;
    totalCustomers: number;
    totalProducts: number;
    totalMovements: number;
    masterTankLiters: number;
    totalSalesUsd: number;
    checksum: string;
  };
  data: {
    sales: {
      invoices: any[];
      auditLogs: any[];
      supervisorPin: string;
    };
    customers: {
      customers: any[];
    };
    inventory: {
      products: any[];
    };
    tanks: {
      masterTank: any;
      movements: any[];
      settings: any;
    };
    currency: {
      usdRate: number;
      history: any[];
    };
    settings?: {
      company?: any;
      branches?: any[];
      paymentMethods?: any;
      generalSettings?: any;
    };
  };
}

const LAST_BACKUP_KEY = 'aquapure_last_backup_timestamp_v1';
const AUTO_BACKUP_KEY = 'aquapure_auto_backup_on_close_v1';

export const useBackupStore = defineStore('backup', () => {
  const isBackingUp = ref(false);
  const isRestoring = ref(false);
  const lastBackupTimestamp = ref<string | null>(null);
  const autoBackupOnDayClose = ref<boolean>(true);

  const loadSettings = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const storedLast = localStorage.getItem(LAST_BACKUP_KEY);
      if (storedLast) {
        lastBackupTimestamp.value = storedLast;
      }
      const storedAuto = localStorage.getItem(AUTO_BACKUP_KEY);
      if (storedAuto !== null) {
        autoBackupOnDayClose.value = storedAuto === 'true';
      }
    } catch {
      // ignore
    }
  };

  const setAutoBackup = (enabled: boolean) => {
    autoBackupOnDayClose.value = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTO_BACKUP_KEY, enabled.toString());
    }
  };

  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'AQ-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };

  const generateBackupPackage = (): AquaPureBackupPackage => {
    const salesStore = useSalesStore();
    const customersStore = useCustomersStore();
    const inventoryStore = useInventoryStore();
    const tanksStore = useTanksStore();
    const currencyStore = useCurrencyStore();

    // Read stored settings
    let companySettings = null;
    let branches = null;
    let paymentMethods = null;
    let generalSettings = null;

    if (typeof localStorage !== 'undefined') {
      try {
        const c = localStorage.getItem('aquapure_company_form_v1');
        if (c) companySettings = JSON.parse(c);
        const b = localStorage.getItem('aquapure_branches_v1');
        if (b) branches = JSON.parse(b);
        const p = localStorage.getItem('aquapure_payment_methods_v1');
        if (p) paymentMethods = JSON.parse(p);
        const g = localStorage.getItem('aquapure_general_settings_v1');
        if (g) generalSettings = JSON.parse(g);
      } catch {
        // ignore
      }
    }

    const rawData = {
      sales: {
        invoices: salesStore.invoices,
        auditLogs: salesStore.auditLogs,
        supervisorPin: salesStore.supervisorPin,
      },
      customers: {
        customers: customersStore.customers,
      },
      inventory: {
        products: inventoryStore.products,
      },
      tanks: {
        masterTank: tanksStore.masterTank,
        movements: tanksStore.movements,
        settings: {
          washWastePercentage: tanksStore.washWastePercentage,
          alertThresholdPercent: tanksStore.alertThresholdPercent,
          averageDailySalesLiters: tanksStore.averageDailySalesLiters,
        },
      },
      currency: {
        usdRate: currencyStore.usdRate,
        history: (currencyStore as any).history || [],
      },
      settings: {
        company: companySettings,
        branches: branches,
        paymentMethods: paymentMethods,
        generalSettings: generalSettings,
      },
    };

    const dataString = JSON.stringify(rawData);
    const checksum = simpleHash(dataString);
    const nowIso = new Date().toISOString();

    const backupPackage: AquaPureBackupPackage = {
      metadata: {
        appName: 'AquaPure System',
        version: '1.0.0',
        schemaVersion: 1,
        createdAt: nowIso,
        totalInvoices: salesStore.invoices.length,
        totalCustomers: customersStore.customers.length,
        totalProducts: inventoryStore.products.length,
        totalMovements: tanksStore.movements.length,
        masterTankLiters: tanksStore.masterTank.currentLiters,
        totalSalesUsd: salesStore.totalSalesAmount,
        checksum,
      },
      data: rawData,
    };

    return backupPackage;
  };

  const exportBackupToFile = (customFileName?: string): { success: boolean; filename: string; sizeBytes: number } => {
    isBackingUp.value = true;
    try {
      const backupPackage = generateBackupPackage();
      const jsonString = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const sizeBytes = blob.size;

      const dateStr = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .substring(0, 19);
      const filename = customFileName || `aquapure_backup_${dateStr}.json`;

      if (typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      const nowIso = new Date().toISOString();
      lastBackupTimestamp.value = nowIso;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LAST_BACKUP_KEY, nowIso);
      }

      return { success: true, filename, sizeBytes };
    } finally {
      isBackingUp.value = false;
    }
  };

  const validateBackupContent = (
    jsonContent: string
  ): { valid: boolean; error?: string; pkg?: AquaPureBackupPackage } => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'El archivo no contiene un JSON válido.' };
      }

      if (!parsed.metadata || parsed.metadata.appName !== 'AquaPure System') {
        return {
          valid: false,
          error: 'El archivo no es una copia de seguridad oficial de AquaPure System.',
        };
      }

      if (!parsed.data || !parsed.data.sales || !parsed.data.customers || !parsed.data.tanks) {
        return {
          valid: false,
          error: 'La estructura de datos del respaldo está incompleta o corrupta.',
        };
      }

      return { valid: true, pkg: parsed as AquaPureBackupPackage };
    } catch (e: any) {
      return { valid: false, error: `Error de sintaxis JSON: ${e?.message || 'Archivo dañado'}` };
    }
  };

  const safeSetItem = (key: string, value: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      // ignore in test/SSR environments without localstorage file
    }
  };

  const restoreFromBackupPackage = (
    pkg: AquaPureBackupPackage,
    enteredSupervisorPin: string
  ): { success: boolean; error?: string; stats?: any } => {
    const salesStore = useSalesStore();

    // Verify supervisor authorization
    if (!salesStore.verifySupervisorPin(enteredSupervisorPin)) {
      return { success: false, error: 'PIN de Supervisor incorrecto. Restauración denegada.' };
    }

    isRestoring.value = true;
    try {
      // 1. Restore sales & audit logs
      if (pkg.data.sales) {
        safeSetItem('aquapure_sales_invoices_v3', JSON.stringify(pkg.data.sales.invoices || []));
        safeSetItem('aquapure_sales_audit_logs_v1', JSON.stringify(pkg.data.sales.auditLogs || []));
        if (pkg.data.sales.supervisorPin) {
          safeSetItem('aquapure_supervisor_pin_v1', pkg.data.sales.supervisorPin);
        }
      }

      // 2. Restore customers
      if (pkg.data.customers) {
        safeSetItem(
          'aquapure_customers_directory_v1',
          JSON.stringify(pkg.data.customers.customers || [])
        );
      }

      // 3. Restore inventory
      if (pkg.data.inventory) {
        safeSetItem(
          'aquapure_products_catalog_v2',
          JSON.stringify(pkg.data.inventory.products || [])
        );
      }

      // 4. Restore tanks
      if (pkg.data.tanks) {
        if (pkg.data.tanks.masterTank) {
          safeSetItem('aquapure_master_tank_v2', JSON.stringify(pkg.data.tanks.masterTank));
        }
        if (pkg.data.tanks.movements) {
          safeSetItem('aquapure_tanks_history_v2', JSON.stringify(pkg.data.tanks.movements));
        }
        if (pkg.data.tanks.settings) {
          safeSetItem('aquapure_tanks_settings_v2', JSON.stringify(pkg.data.tanks.settings));
        }
      }

      // 5. Restore currency
      if (pkg.data.currency) {
        if (pkg.data.currency.usdRate) {
          safeSetItem('aquapure_usd_rate', pkg.data.currency.usdRate.toString());
        }
        if (pkg.data.currency.history) {
          safeSetItem('aquapure_rate_history', JSON.stringify(pkg.data.currency.history));
        }
      }

      // 6. Restore custom settings if present
      if (pkg.data.settings) {
        if (pkg.data.settings.company) {
          safeSetItem('aquapure_company_form_v1', JSON.stringify(pkg.data.settings.company));
        }
        if (pkg.data.settings.branches) {
          safeSetItem('aquapure_branches_v1', JSON.stringify(pkg.data.settings.branches));
        }
        if (pkg.data.settings.paymentMethods) {
          safeSetItem(
            'aquapure_payment_methods_v1',
            JSON.stringify(pkg.data.settings.paymentMethods)
          );
        }
        if (pkg.data.settings.generalSettings) {
          safeSetItem(
            'aquapure_general_settings_v1',
            JSON.stringify(pkg.data.settings.generalSettings)
          );
        }
      }

      // 7. Hot Reload All Stores
      salesStore.loadFromStorage();
      const customersStore = useCustomersStore();
      customersStore.loadFromStorage();
      const inventoryStore = useInventoryStore();
      inventoryStore.loadFromStorage();
      const tanksStore = useTanksStore();
      tanksStore.loadFromStorage();
      const currencyStore = useCurrencyStore();
      currencyStore.loadFromStorage();

      return {
        success: true,
        stats: {
          invoices: pkg.metadata.totalInvoices,
          customers: pkg.metadata.totalCustomers,
          products: pkg.metadata.totalProducts,
          movements: pkg.metadata.totalMovements,
          backupDate: pkg.metadata.createdAt,
        },
      };
    } catch (e: any) {
      return { success: false, error: `Error al restaurar: ${e?.message || 'Falla desconocida'}` };
    } finally {
      isRestoring.value = false;
    }
  };

  const formattedLastBackup = computed(() => {
    if (!lastBackupTimestamp.value) return 'Sin respaldos registrados';
    try {
      const d = new Date(lastBackupTimestamp.value);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return lastBackupTimestamp.value;
    }
  });

  // Initial load
  loadSettings();

  return {
    isBackingUp,
    isRestoring,
    lastBackupTimestamp,
    formattedLastBackup,
    autoBackupOnDayClose,
    setAutoBackup,
    generateBackupPackage,
    exportBackupToFile,
    validateBackupContent,
    restoreFromBackupPackage,
  };
});
