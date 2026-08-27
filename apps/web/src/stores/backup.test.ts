import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBackupStore } from './backup';
import { useSalesStore } from './sales';
import { useCustomersStore } from './customers';
import { useTanksStore } from './tanks';
import { useInventoryStore } from './inventory';

describe('Backup and Disaster Recovery Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should generate a valid AquaPure backup package with checksum and metadata', () => {
    const backupStore = useBackupStore();
    const pkg = backupStore.generateBackupPackage();

    expect(pkg.metadata.appName).toBe('AquaPure System');
    expect(pkg.metadata.schemaVersion).toBe(1);
    expect(pkg.metadata.checksum).toContain('AQ-');
    expect(pkg.metadata.totalInvoices).toBeGreaterThan(0);
    expect(pkg.data.sales).toBeDefined();
    expect(pkg.data.customers).toBeDefined();
    expect(pkg.data.inventory).toBeDefined();
    expect(pkg.data.tanks).toBeDefined();
  });

  it('should validate valid backup JSON content', () => {
    const backupStore = useBackupStore();
    const pkg = backupStore.generateBackupPackage();
    const jsonStr = JSON.stringify(pkg);

    const validation = backupStore.validateBackupContent(jsonStr);
    expect(validation.valid).toBe(true);
    expect(validation.pkg).toBeDefined();
  });

  it('should reject invalid or tampered JSON content', () => {
    const backupStore = useBackupStore();
    const badValidation = backupStore.validateBackupContent('{ "random": 123 }');
    expect(badValidation.valid).toBe(false);
    expect(badValidation.error).toContain('AquaPure System');
  });

  it('should require correct supervisor PIN to restore data', () => {
    const backupStore = useBackupStore();
    const pkg = backupStore.generateBackupPackage();

    const failedResult = backupStore.restoreFromBackupPackage(pkg, 'wrong-pin');
    expect(failedResult.success).toBe(false);
    expect(failedResult.error).toContain('PIN de Supervisor');

    const successResult = backupStore.restoreFromBackupPackage(pkg, '1234');
    if (!successResult.success) {
      console.error('RESTORE FAILED WITH:', successResult.error);
    }
    expect(successResult.success).toBe(true);
    expect(successResult.stats).toBeDefined();
  });

  it('should toggle and persist auto-backup setting', () => {
    const backupStore = useBackupStore();
    backupStore.setAutoBackup(false);
    expect(backupStore.autoBackupOnDayClose).toBe(false);

    backupStore.setAutoBackup(true);
    expect(backupStore.autoBackupOnDayClose).toBe(true);
  });
});
