import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCustomersStore } from './customers';

describe('Customers Store (Natural & Juridico Clients)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should register a new natural person customer', () => {
    const store = useCustomersStore();
    const customer = store.registerOrUpdateCustomer({
      type: 'NATURAL',
      docType: 'V',
      docNumber: '24123456',
      name: 'María Alejandra Gómez',
      address: 'Av. Las Palmas, Edif. Centro, Apto 4B',
      phone: '+58 414 555 1234',
    });

    expect(customer.fullDoc).toBe('V-24123456');
    expect(customer.name).toBe('María Alejandra Gómez');
    expect(store.customers.length).toBeGreaterThan(0);
  });

  it('should find existing customer by document query or name', () => {
    const store = useCustomersStore();
    store.registerOrUpdateCustomer({
      type: 'JURIDICO',
      docType: 'J',
      docNumber: '50123987-9',
      name: 'Restaurante El Gran Sabor C.A.',
      address: 'Calle 10 con Carrera 5',
    });

    const foundByDoc = store.findCustomer('J-50123987-9');
    expect(foundByDoc).toBeDefined();
    expect(foundByDoc?.name).toBe('Restaurante El Gran Sabor C.A.');

    const foundByName = store.findCustomer('Gran Sabor');
    expect(foundByName).toBeDefined();
    expect(foundByName?.docNumber).toBe('50123987-9');
  });
});
