<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">Configuración Global</h2>
        <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Administre los parámetros operativos, identidad corporativa y puntos de venta.</p>
      </div>

      <!-- Theme Switcher Quick Toggle -->
      <div class="flex items-center gap-1.5 sm:gap-2 bg-surface-container-high/70 p-1.5 rounded-xl self-start sm:self-auto shadow-sm flex-shrink-0">
        <button
          type="button"
          @click="setTheme('light')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="!themeStore.isDark ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="material-symbols-outlined text-sm">light_mode</span>
          Modo Claro
        </button>
        <button
          type="button"
          @click="setTheme('dark')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="themeStore.isDark ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="material-symbols-outlined text-sm">dark_mode</span>
          Modo Oscuro
        </button>
      </div>
    </div>

    <!-- 2x2 Grid of Settings Cards -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <!-- Card 1: Información de la Empresa -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <span class="material-symbols-outlined text-primary text-xl">domain</span>
            <h3 class="text-base font-bold text-on-surface">Información de la Empresa</h3>
          </div>

          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Upload Logo Box -->
              <div
                @click="triggerUploadLogo"
                class="w-full sm:w-36 h-32 rounded-2xl border border-dashed border-black/10 dark:border-white/10 hover:border-primary/60 bg-surface-container/40 hover:bg-surface-container-high/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all flex-shrink-0 group"
              >
                <span class="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">add_photo_alternate</span>
                <span class="text-xs font-bold text-on-surface mt-1.5">Subir Logotipo</span>
                <span class="text-[10px] text-on-surface-variant/70 mt-1 leading-tight">Formato PNG o SVG. Máx 2MB.</span>
              </div>

              <!-- Commercial Name -->
              <div class="flex-1 flex flex-col justify-center">
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre Comercial *</label>
                <input
                  v-model="companyForm.businessName"
                  type="text"
                  required
                  class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">RUC / NIT *</label>
                <input
                  v-model="companyForm.taxId"
                  type="text"
                  required
                  class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Teléfono *</label>
                <input
                  v-model="companyForm.phone"
                  type="text"
                  required
                  class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Dirección Principal *</label>
              <input
                v-model="companyForm.address"
                type="text"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Métodos de Pago -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <span class="material-symbols-outlined text-primary text-xl">payments</span>
            <h3 class="text-base font-bold text-on-surface">Métodos de Pago</h3>
          </div>

          <div class="space-y-3">
            <!-- Cash -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">payments</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Efectivo</p>
                  <p class="text-xs text-on-surface-variant">Moneda local</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.cash" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- Transfer -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Transferencia Bancaria</p>
                  <p class="text-xs text-on-surface-variant">B2B / Grandes montos</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.transfer" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- POS Terminal -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">point_of_sale</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Terminal POS</p>
                  <p class="text-xs text-on-surface-variant">Tarjetas de crédito/débito</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.pos" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- QR / Mobile -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">qr_code_scanner</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Pago Móvil / QR</p>
                  <p class="text-xs text-on-surface-variant">Billeteras digitales</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.qr" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Ajustes Generales -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <span class="material-symbols-outlined text-primary text-xl">tune</span>
            <h3 class="text-base font-bold text-on-surface">Ajustes Generales</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Idioma de Interfaz</label>
              <select
                v-model="generalSettings.language"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="es-LA">Español (América Latina)</option>
                <option value="es-ES">Español (España)</option>
                <option value="en-US">English (United States)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Moneda Principal</label>
              <select
                v-model="generalSettings.currency"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="USD">Dólares Americanos (USD - $)</option>
                <option value="PEN">Soles (PEN - S/)</option>
                <option value="EUR">Euros (EUR - €)</option>
                <option value="MXN">Pesos Mexicanos (MXN - $)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Zona Horaria Operativa</label>
              <select
                v-model="generalSettings.timezone"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="UTC-5">(UTC-05:00) Lima, Quito, Bogotá, Panamá</option>
                <option value="UTC-4">(UTC-04:00) Caracas, La Paz, Santiago</option>
                <option value="UTC-6">(UTC-06:00) Ciudad de México, San José</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 4: Puntos de Venta (Sucursales) -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">store</span>
              <h3 class="text-base font-bold text-on-surface">Puntos de Venta (Sucursales)</h3>
            </div>

            <button
              type="button"
              @click="openAddBranchModal"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-hover transition-all cursor-pointer active:scale-95"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Nueva Sucursal</span>
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="branch in branches"
              :key="branch.id"
              class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-xl">{{ branch.isMatrix ? 'apartment' : 'storefront' }}</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-bold text-on-surface leading-tight">{{ branch.name }}</p>
                    <span
                      class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
                      :class="branch.isMatrix ? 'bg-admin-gold/20 text-admin-gold' : 'bg-primary/20 text-primary'"
                    >
                      {{ branch.isMatrix ? 'Casa Matriz' : 'Sucursal' }}
                    </span>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-0.5">{{ branch.address }}</p>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  @click="editBranch(branch)"
                  class="p-2 hover:text-primary hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
                  title="Editar Sucursal"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  v-if="!branch.isMatrix"
                  @click="deleteBranch(branch)"
                  class="p-2 hover:text-error-red hover:bg-error-red/10 rounded-xl transition-colors cursor-pointer"
                  title="Eliminar Sucursal"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Settings Floating / Bottom Action Bar -->
    <div class="flex justify-end pt-2">
      <button
        @click="saveAllSettings"
        class="bg-primary text-on-primary font-bold text-sm px-8 py-3 rounded-xl glow-cyan-hover shadow-lg shadow-primary/25 cursor-pointer active:scale-95 flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-lg">save</span>
        Guardar Configuración Global
      </button>
    </div>

    <!-- Branch Modal -->
    <div v-if="showBranchModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showBranchModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">storefront</span>
            <h4 class="text-base font-bold text-on-surface">
              {{ isEditingBranch ? 'Editar Sucursal' : 'Nueva Sucursal' }}
            </h4>
          </div>
          <button @click="showBranchModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="branchError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ branchError }}</span>
        </div>

        <form @submit.prevent="saveBranch" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre de la Sucursal *</label>
            <input
              v-model="branchForm.name"
              type="text"
              required
              placeholder="Ej: Sucursal Norte"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Dirección *</label>
            <input
              v-model="branchForm.address"
              type="text"
              required
              placeholder="Ej: Av. Las Américas 450"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showBranchModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              {{ isEditingBranch ? 'Guardar Cambios' : 'Registrar Sucursal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useThemeStore } from '~/stores/theme';
import { useToast } from '~/composables/useToast';
import {
  validateRequired,
  validateTaxId,
  validatePhone,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const themeStore = useThemeStore();
const toast = useToast();

const showBranchModal = ref(false);
const isEditingBranch = ref(false);
const editingBranchId = ref<string | null>(null);
const branchError = ref('');

const branchForm = reactive({
  name: '',
  address: '',
});

const companyForm = reactive({
  businessName: 'AquaPure Pro S.A.',
  taxId: '20549382910',
  phone: '+51 987 654 321',
  address: 'Av. Tecnológica 1042, Parque Industrial',
});

const paymentMethods = reactive({
  cash: true,
  transfer: true,
  pos: false,
  qr: true,
});

const generalSettings = reactive({
  language: 'es-LA',
  currency: 'USD',
  timezone: 'UTC-5',
});

const branches = ref([
  {
    id: 'b-1',
    name: 'Local Principal',
    address: 'Av. Tecnológica 1042, Zona Centro',
    isMatrix: true,
  },
  {
    id: 'b-2',
    name: 'Sucursal Norte',
    address: 'Plaza Comercial Los Pinos, L-12',
    isMatrix: false,
  },
]);

const setTheme = (mode: 'light' | 'dark') => {
  themeStore.setTheme(mode);
  toast.info(`Tema cambiado a ${mode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}`);
};

const triggerUploadLogo = () => {
  toast.info('Seleccione un archivo de imagen (PNG o SVG) para el logotipo.');
};

const openAddBranchModal = () => {
  isEditingBranch.value = false;
  editingBranchId.value = null;
  branchError.value = '';
  branchForm.name = '';
  branchForm.address = '';
  showBranchModal.value = true;
};

const editBranch = (branch: any) => {
  isEditingBranch.value = true;
  editingBranchId.value = branch.id;
  branchError.value = '';
  branchForm.name = branch.name;
  branchForm.address = branch.address;
  showBranchModal.value = true;
};

const saveBranch = () => {
  branchError.value = '';
  const cleaned = sanitizeFormData(branchForm);

  const nameError = validateRequired(cleaned.name, 'El nombre de la sucursal');
  if (nameError) {
    branchError.value = nameError;
    return;
  }

  const addressError = validateRequired(cleaned.address, 'La dirección');
  if (addressError) {
    branchError.value = addressError;
    return;
  }

  if (isEditingBranch.value && editingBranchId.value) {
    const idx = branches.value.findIndex(b => b.id === editingBranchId.value);
    if (idx !== -1) {
      branches.value[idx].name = cleaned.name;
      branches.value[idx].address = cleaned.address;
      toast.updateSuccess('Sucursal', `Sucursal ${cleaned.name} actualizada.`);
    }
  } else {
    branches.value.push({
      id: `b-${Date.now()}`,
      name: cleaned.name,
      address: cleaned.address,
      isMatrix: false,
    });
    toast.createSuccess('Sucursal', `Sucursal ${cleaned.name} agregada al sistema.`);
  }

  showBranchModal.value = false;
};

const deleteBranch = (branch: any) => {
  branches.value = branches.value.filter((b) => b.id !== branch.id);
  toast.deleteSuccess('Sucursal', `Sucursal ${branch.name} eliminada.`);
};

const saveAllSettings = () => {
  const cleanedCompany = sanitizeFormData(companyForm);

  const nameErr = validateRequired(cleanedCompany.businessName, 'El nombre comercial');
  if (nameErr) {
    toast.error('Error de validación', nameErr);
    return;
  }

  const taxErr = validateTaxId(cleanedCompany.taxId, 'El RUC/NIT');
  if (taxErr) {
    toast.error('Error de validación', taxErr);
    return;
  }

  const phoneErr = validatePhone(cleanedCompany.phone, 'El teléfono');
  if (phoneErr) {
    toast.error('Error de validación', phoneErr);
    return;
  }

  toast.success('Configuración guardada', 'Todos los parámetros corporativos fueron actualizados.');
};
</script>
