<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">Gestión de Usuarios</h2>
        <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Administra los accesos y roles del equipo técnico y administrativo.</p>
      </div>

      <button
        @click="openCreateModal"
        class="bg-primary text-on-primary font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95 whitespace-nowrap self-start sm:self-auto flex-shrink-0"
      >
        <span class="material-symbols-outlined text-base sm:text-lg">person_add</span>
        <span>Registrar Nuevo Usuario</span>
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="card-elevated p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-lg">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <!-- Filter Tabs & Refresh Button -->
      <div class="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
        <div class="bg-surface-container-high/60 p-1 rounded-xl flex items-center gap-1 flex-shrink-0">
          <button
            v-for="filter in roleFilters"
            :key="filter.value"
            @click="setFilter(filter.value)"
            class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            :class="activeFilter === filter.value ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'"
          >
            {{ filter.label }}
          </button>
        </div>

        <button
          @click="fetchUsers"
          class="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-0 shadow-sm flex-shrink-0"
          title="Recargar usuarios"
        >
          <span class="material-symbols-outlined text-lg" :class="{ 'animate-spin': isLoading }">refresh</span>
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card-elevated overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
        <p class="text-sm font-medium">Cargando usuarios desde la base de datos...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="users.length === 0" class="p-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/50">group_off</span>
        <p class="text-base font-bold text-on-surface">No se encontraron usuarios</p>
        <p class="text-xs text-on-surface-variant max-w-sm">No hay registros que coincidan con la búsqueda o el filtro seleccionado.</p>
        <button
          @click="openCreateModal"
          class="mt-2 bg-primary/15 text-primary hover:bg-primary/25 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
        >
          <span class="material-symbols-outlined text-base">person_add</span>
          Crear Primer Usuario
        </button>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto custom-scrollbar w-full">
        <table class="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Usuario</th>
              <th class="py-4 px-6">Rol</th>
              <th class="py-4 px-6">Estado</th>
              <th class="py-4 px-6">Último Acceso</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-surface-container-highest/30 transition-colors group"
            >
              <!-- Usuario (Avatar + Name + Email) -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono tracking-wider flex-shrink-0"
                    :class="getAvatarClass(user.role)"
                  >
                    {{ getInitials(user) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-on-surface leading-tight">{{ user.fullName || `${user.firstName} ${user.lastName}` }}</p>
                    <p class="text-xs text-on-surface-variant font-mono mt-0.5">{{ user.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Rol Badge -->
              <td class="py-4 px-6">
                <span
                  v-if="user.role === 'ADMIN'"
                  class="inline-flex items-center gap-1.5 bg-admin-gold/15 text-admin-gold border border-admin-gold/30 px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="material-symbols-outlined text-xs">shield_person</span>
                  Administrador
                </span>
                <span
                  v-else-if="user.role === 'MANAGER'"
                  class="inline-flex items-center gap-1.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="material-symbols-outlined text-xs">supervisor_account</span>
                  Supervisor
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-slate-500/15 text-slate-300 border border-slate-500/30 px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="material-symbols-outlined text-xs">badge</span>
                  Operador
                </span>
              </td>

              <!-- Estado Badge -->
              <td class="py-4 px-6">
                <span
                  v-if="user.isActive"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-billing-green"
                >
                  <span class="w-2 h-2 rounded-full bg-billing-green animate-pulse"></span>
                  Activo
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant/70"
                >
                  <span class="w-2 h-2 rounded-full bg-on-surface-variant/50"></span>
                  Inactivo
                </span>
              </td>

              <!-- Último Acceso -->
              <td class="py-4 px-6 text-xs text-on-surface-variant font-medium">
                {{ formatAccessDate(user.lastLoginAt) }}
              </td>

              <!-- Acciones -->
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(user)"
                    class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer active:scale-95"
                    title="Editar Usuario"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>

                  <button
                    @click="toggleUserStatus(user)"
                    class="p-2 rounded-lg transition-colors cursor-pointer active:scale-95"
                    :class="user.isActive ? 'text-on-surface-variant hover:text-admin-gold hover:bg-surface-container' : 'text-billing-green hover:bg-billing-green/10'"
                    :title="user.isActive ? 'Desactivar Cuenta' : 'Activar Cuenta'"
                  >
                    <span class="material-symbols-outlined text-lg">{{ user.isActive ? 'lock' : 'lock_open' }}</span>
                  </button>

                  <button
                    @click="confirmDeleteUser(user)"
                    class="p-2 text-on-surface-variant hover:text-error-red hover:bg-error-red/10 rounded-lg transition-colors cursor-pointer active:scale-95"
                    title="Eliminar Usuario"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination / Count Footer -->
      <div class="p-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-highest/20 text-xs">
        <span class="text-on-surface-variant">
          Mostrando {{ users.length }} de {{ totalUsersCount }} usuario(s) registrado(s)
        </span>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showUserModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">
              {{ isEditing ? 'manage_accounts' : 'person_add' }}
            </span>
            <div>
              <h4 class="text-lg font-bold text-on-surface">{{ isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}</h4>
              <p class="text-xs text-on-surface-variant">Defina los datos personales y nivel de permisos</p>
            </div>
          </div>
          <button @click="showUserModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Inline Form Error Alert -->
        <div v-if="modalError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ modalError }}</span>
        </div>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre *</label>
              <input
                v-model="userForm.firstName"
                @input="validateField('firstName')"
                @blur="validateField('firstName')"
                type="text"
                required
                placeholder="Ej: Carlos"
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
                :class="formErrors.firstName ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              />
              <p v-if="formErrors.firstName" class="text-[11px] text-error-red mt-1 font-medium">{{ formErrors.firstName }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Apellido *</label>
              <input
                v-model="userForm.lastName"
                @input="validateField('lastName')"
                @blur="validateField('lastName')"
                type="text"
                required
                placeholder="Ej: Pérez"
                class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
                :class="formErrors.lastName ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
              />
              <p v-if="formErrors.lastName" class="text-[11px] text-error-red mt-1 font-medium">{{ formErrors.lastName }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Correo Electrónico *</label>
            <input
              v-model="userForm.email"
              @input="validateField('email')"
              @blur="validateField('email')"
              type="email"
              required
              placeholder="carlos.perez@aquapure.com"
              class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
              :class="formErrors.email ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
            />
            <p v-if="formErrors.email" class="text-[11px] text-error-red mt-1 font-medium">{{ formErrors.email }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Rol en el Sistema *</label>
              <select
                v-model="userForm.role"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Supervisor</option>
                <option value="OPERATOR">Operador</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Estado de la Cuenta *</label>
              <select
                v-model="userForm.isActive"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">
              {{ isEditing ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña Inicial *' }}
            </label>
            <input
              v-model="userForm.password"
              @input="validateField('password')"
              @blur="validateField('password')"
              type="password"
              :required="!isEditing"
              placeholder="••••••••"
              class="w-full bg-surface-container border rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
              :class="formErrors.password ? 'border-error-red focus:ring-error-red' : 'border-transparent'"
            />
            <p v-if="formErrors.password" class="text-[11px] text-error-red mt-1 font-medium">{{ formErrors.password }}</p>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showUserModal = false"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary glow-cyan-hover shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span>{{ isEditing ? 'Guardar Cambios' : 'Crear Usuario' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';
import { useFeathers } from '~/composables/useFeathers';
import { useAuthStore } from '~/stores/auth';
import {
  validateRequired,
  validateEmail,
  validatePassword,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['ADMIN'],
});

const toast = useToast();
const authStore = useAuthStore();
const { client: feathers } = useFeathers();

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

const searchQuery = ref('');
const activeFilter = ref<'ALL' | 'ADMIN' | 'OPERATOR' | 'MANAGER'>('ALL');
const users = ref<UserItem[]>([]);
const totalUsersCount = ref(0);
const isLoading = ref(false);
const isSubmitting = ref(false);

const showUserModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref<string | null>(null);
const modalError = ref<string | null>(null);

const roleFilters = [
  { label: 'Todos', value: 'ALL' as const },
  { label: 'Administradores', value: 'ADMIN' as const },
  { label: 'Supervisores', value: 'MANAGER' as const },
  { label: 'Operadores', value: 'OPERATOR' as const },
];

const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: 'OPERATOR' as 'ADMIN' | 'MANAGER' | 'OPERATOR',
  isActive: true,
  password: '',
});

let searchDebounceTimeout: any = null;
const onSearchInput = () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    fetchUsers();
  }, 300);
};

const setFilter = (val: 'ALL' | 'ADMIN' | 'OPERATOR' | 'MANAGER') => {
  activeFilter.value = val;
  fetchUsers();
};

const getInitials = (user: UserItem) => {
  const f = user.firstName ? user.firstName.charAt(0) : '';
  const l = user.lastName ? user.lastName.charAt(0) : '';
  return (f + l).toUpperCase() || 'U';
};

const getAvatarClass = (role: string) => {
  if (role === 'ADMIN') return 'bg-admin-gold/20 text-admin-gold';
  if (role === 'MANAGER') return 'bg-cyan-500/20 text-cyan-400';
  return 'bg-primary/20 text-primary';
};

const formatAccessDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Sin ingresos aún';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const query: any = {};
    if (activeFilter.value !== 'ALL') {
      query.role = activeFilter.value;
    }
    if (searchQuery.value.trim().length > 0) {
      query.search = searchQuery.value.trim();
    }

    const response = await feathers.service('users').find({ query });
    if (response && Array.isArray(response.data)) {
      users.value = response.data;
      totalUsersCount.value = response.total ?? response.data.length;
    } else if (Array.isArray(response)) {
      users.value = response;
      totalUsersCount.value = response.length;
    } else {
      users.value = [];
      totalUsersCount.value = 0;
    }
  } catch (error: any) {
    console.error('Error al cargar usuarios:', error);
    toast.error('Error de conexión', error.message || 'No se pudieron obtener los usuarios.');
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  modalError.value = null;
  userForm.firstName = '';
  userForm.lastName = '';
  userForm.email = '';
  userForm.role = 'OPERATOR';
  userForm.isActive = true;
  userForm.password = '';
  showUserModal.value = true;
};

const openEditModal = (user: UserItem) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  modalError.value = null;
  userForm.firstName = user.firstName;
  userForm.lastName = user.lastName;
  userForm.email = user.email;
  userForm.role = user.role;
  userForm.isActive = user.isActive;
  userForm.password = '';
  showUserModal.value = true;
};

const formErrors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
});

const validateField = (field: 'firstName' | 'lastName' | 'email' | 'password') => {
  if (field === 'firstName') {
    formErrors.firstName = validateRequired(userForm.firstName, 'El nombre') || '';
  } else if (field === 'lastName') {
    formErrors.lastName = validateRequired(userForm.lastName, 'El apellido') || '';
  } else if (field === 'email') {
    formErrors.email = validateEmail(userForm.email) || '';
  } else if (field === 'password') {
    if (!isEditing.value || userForm.password.length > 0) {
      formErrors.password = validatePassword(userForm.password, 6) || '';
    } else {
      formErrors.password = '';
    }
  }
};

const saveUser = async () => {
  modalError.value = null;

  // Run all field validations
  validateField('firstName');
  validateField('lastName');
  validateField('email');
  validateField('password');

  if (formErrors.firstName || formErrors.lastName || formErrors.email || formErrors.password) {
    modalError.value = formErrors.firstName || formErrors.lastName || formErrors.email || formErrors.password;
    return;
  }

  isSubmitting.value = true;
  try {
    const cleaned = sanitizeFormData(userForm);

    if (isEditing.value && editingUserId.value) {
      const payload: any = {
        firstName: cleaned.firstName,
        lastName: cleaned.lastName,
        email: cleaned.email,
        role: cleaned.role,
        isActive: cleaned.isActive,
      };
      if (cleaned.password && cleaned.password.length > 0) {
        payload.password = cleaned.password;
      }

      await feathers.service('users').patch(editingUserId.value, payload);
      toast.updateSuccess('Usuario', `Usuario ${cleaned.firstName} ${cleaned.lastName} actualizado exitosamente.`);
    } else {
      await feathers.service('users').create({
        firstName: cleaned.firstName,
        lastName: cleaned.lastName,
        email: cleaned.email,
        role: cleaned.role,
        isActive: cleaned.isActive,
        password: cleaned.password,
      });
      toast.createSuccess('Usuario', `Usuario ${cleaned.firstName} ${cleaned.lastName} registrado exitosamente.`);
    }

    showUserModal.value = false;
    await fetchUsers();
  } catch (err: any) {
    console.error('Error al guardar usuario:', err);
    modalError.value = err.message || 'Error al guardar el usuario en el servidor.';
  } finally {
    isSubmitting.value = false;
  }
};

const toggleUserStatus = async (user: UserItem) => {
  try {
    const nextStatus = !user.isActive;
    await feathers.service('users').patch(user.id, { isActive: nextStatus });
    user.isActive = nextStatus;
    toast.info(
      'Estado de usuario',
      `Usuario ${user.fullName || user.email} ${nextStatus ? 'activado' : 'desactivado'} correctamente.`
    );
  } catch (err: any) {
    toast.error('Error', err.message || 'No se pudo cambiar el estado del usuario.');
  }
};

const confirmDeleteUser = async (user: UserItem) => {
  if (!confirm(`¿Está seguro de que desea eliminar al usuario ${user.fullName || user.email}? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    await feathers.service('users').remove(user.id);
    toast.deleteSuccess('Usuario', `Usuario ${user.fullName || user.email} eliminado.`);
    await fetchUsers();
  } catch (err: any) {
    toast.error('Error', err.message || 'No se pudo eliminar el usuario.');
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
