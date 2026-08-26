import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLicenseStore } from './license';

describe('License Store & Anti-Clock Tamper Security', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with active subscription and calculate remaining days', () => {
    const store = useLicenseStore();
    expect(store.isActivated).toBe(true);
    expect(store.daysRemaining).toBeGreaterThan(0);
    expect(store.isTampered).toBe(false);
  });

  it('should detect clock rollback and trigger security tamper state', () => {
    const store = useLicenseStore();
    // Simulate current watermark is now, but someone wound back clock 10 days
    store.lastSeenEpoch = Date.now();
    const rewoundClock = Date.now() - 1000 * 60 * 60 * 24 * 10;

    const isOk = store.verifyAntiClockTamper(rewoundClock);
    expect(isOk).toBe(false);
    expect(store.isTampered).toBe(true);
    expect(store.daysRemaining).toBe(0);
  });

  it('should unlock tampered system using Master Technician Rescue Token', () => {
    const store = useLicenseStore();
    store.isTampered = true;
    store.tamperReason = 'Clock tampered';

    const unlocked = store.unlockTamperedLicense('AQUA-UNLOCK-2026-X89F');
    expect(unlocked).toBe(true);
    expect(store.isTampered).toBe(false);
    expect(store.tamperReason).toBeNull();
    expect(store.daysRemaining).toBe(30);
  });

  it('should reject invalid rescue tokens', () => {
    const store = useLicenseStore();
    store.isTampered = true;

    const invalid = store.unlockTamperedLicense('INVALID-KEY-1234');
    expect(invalid).toBe(false);
    expect(store.isTampered).toBe(true);
  });
});
