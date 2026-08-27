import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type CustomerType = 'NATURAL' | 'JURIDICO';
export type DocType = 'V' | 'E' | 'J' | 'G';

export interface Customer {
  id: string;
  type: CustomerType;
  docType: DocType;
  docNumber: string;
  fullDoc: string; // ej: V-18.945.120 o J-20549382-9
  name: string; // Nombre y apellido o Razón Social
  address: string;
  phone?: string;
  email?: string;
  totalPurchases?: number;
  createdAt: string;
}

export const GENERIC_CUSTOMER: Customer = {
  id: 'cust-generic',
  type: 'NATURAL',
  docType: 'V',
  docNumber: '00000000',
  fullDoc: 'V-00000000',
  name: 'Consumidor Final',
  address: 'Venta Mostrador / Planta',
  phone: '',
  email: '',
  totalPurchases: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_CUSTOMERS: Customer[] = [
  GENERIC_CUSTOMER,
  {
    id: 'cust-1',
    type: 'JURIDICO',
    docType: 'J',
    docNumber: '31245678-0',
    fullDoc: 'J-31245678-0',
    name: 'AquaExpress Delivery C.A.',
    address: 'Av. Las Industrias, Galpón 4, Zona Industrial',
    phone: '+58 414 123 4567',
    email: 'contacto@aquaexpress.com',
    totalPurchases: 225.00,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'cust-2',
    type: 'JURIDICO',
    docType: 'J',
    docNumber: '40123987-1',
    fullDoc: 'J-40123987-1',
    name: 'Minimarket Los Andes',
    address: 'Calle Real de San Antonio, Local 12',
    phone: '+58 424 987 6543',
    email: 'compras@losandesmarket.com',
    totalPurchases: 110.00,
    createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
  },
  {
    id: 'cust-3',
    type: 'NATURAL',
    docType: 'V',
    docNumber: '18945120',
    fullDoc: 'V-18945120',
    name: 'Carlos Mendoza',
    address: 'Urb. Los Pinos, Vereda 5, Casa #14',
    phone: '+58 412 555 7890',
    email: 'carlos.mendoza@gmail.com',
    totalPurchases: 45.00,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: 'cust-4',
    type: 'JURIDICO',
    docType: 'J',
    docNumber: '29874512-3',
    fullDoc: 'J-29874512-3',
    name: 'Gimnasio PowerFit C.A.',
    address: 'Av. Francisco de Miranda, Centro Comercial Oasis, Nivel 2',
    phone: '+58 416 333 2211',
    email: 'admin@powerfit.com',
    totalPurchases: 67.50,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
];

const STORAGE_KEY = 'aquapure_customers_directory_v1';

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([...DEFAULT_CUSTOMERS]);

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        customers.value = JSON.parse(stored);
      } else {
        saveToStorage();
      }
    } catch {
      // ignore
    }
  };

  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers.value));
    } catch {
      // ignore
    }
  };

  const findCustomer = (query: string): Customer | undefined => {
    if (!query) return undefined;
    const cleanQuery = query.toLowerCase().replace(/[\s.-]/g, '');
    return customers.value.find((c) => {
      const cleanDoc = c.fullDoc.toLowerCase().replace(/[\s.-]/g, '');
      const cleanDocNum = c.docNumber.toLowerCase().replace(/[\s.-]/g, '');
      const cleanName = c.name.toLowerCase();
      return (
        cleanDoc === cleanQuery ||
        cleanDocNum === cleanQuery ||
        cleanName.includes(query.toLowerCase())
      );
    });
  };

  const registerOrUpdateCustomer = (data: {
    type: CustomerType;
    docType: DocType;
    docNumber: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
  }): Customer => {
    const fullDoc = `${data.docType}-${data.docNumber.trim()}`;
    const existingIndex = customers.value.findIndex(
      (c) =>
        c.fullDoc.toLowerCase().replace(/[\s.-]/g, '') ===
        fullDoc.toLowerCase().replace(/[\s.-]/g, '')
    );

    if (existingIndex !== -1) {
      // Update existing customer
      customers.value[existingIndex] = {
        ...customers.value[existingIndex],
        type: data.type,
        docType: data.docType,
        docNumber: data.docNumber.trim(),
        fullDoc,
        name: data.name.trim(),
        address: data.address.trim(),
        phone: data.phone?.trim() || customers.value[existingIndex].phone,
        email: data.email?.trim() || customers.value[existingIndex].email,
      };
      saveToStorage();
      return customers.value[existingIndex];
    } else {
      // Register new customer
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        type: data.type,
        docType: data.docType,
        docNumber: data.docNumber.trim(),
        fullDoc,
        name: data.name.trim(),
        address: data.address.trim(),
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        totalPurchases: 0,
        createdAt: new Date().toISOString(),
      };
      customers.value.unshift(newCustomer);
      saveToStorage();
      return newCustomer;
    }
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    customers,
    findCustomer,
    registerOrUpdateCustomer,
    init,
  };
});
