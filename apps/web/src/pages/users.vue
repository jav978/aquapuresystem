<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Gestión de Usuarios</h2>
        <p class="text-sm text-on-surface-variant mt-1">Administra los accesos y roles del equipo técnico y administrativo.</p>
      </div>

      <button
        @click="openCreateModal"
        class="bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95 self-start sm:self-auto"
      >
        <span class="material-symbols-outlined text-lg">person_add</span>
        Registrar Nuevo Usuario
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="card-elevated p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-lg">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <!-- Filter Tabs & Button -->
      <div class="flex items-center gap-2">
        <div class="bg-surface-container-high/60 p-1 rounded-xl flex items-center gap-1">
          <button
            v-for="filter in roleFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            :class="activeFilter === filter.value ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'"
          >
            {{ filter.label }}
          </button>
        </div>

        <button
          @click="toggleSortOrder"
          class="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-0 shadow-sm"
          title="Filtros avanzados"
        >
          <span class="material-symbols-outlined text-lg">filter_list</span>
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card-elevated overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-5 w-12 text-center">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  class="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container cursor-pointer"
                />
              </th>
              <th class="py-4 px-6">Usuario</th>
              <th class="py-4 px-6">Rol</th>
              <th class="py-4 px-6">Estado</th>
              <th class="py-4 px-6">Último Acceso</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-surface-container-highest/30 transition-colors group"
            >
              <!-- Checkbox -->
              <td class="py-4 px-5 text-center">
                <input
                  type="checkbox"
                  :value="user.id"
                  v-model="selectedUserIds"
                  class="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container cursor-pointer"
                />
              </td>

              <!-- Usuario (Avatar + Name + Email) -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono tracking-wider flex-shrink-0"
                    :class="user.role === 'ADMIN' ? 'bg-admin-gold/20 text-admin-gold' : 'bg-primary/20 text-primary'"
                  >
                    {{ user.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-on-surface leading-tight">{{ user.fullName }}</p>
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
                {{ user.lastAccess }}
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
                    @click="deleteUser(user)"
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

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-highest/20 text-xs">
        <span class="text-on-surface-variant">
          Mostrando {{ filteredUsers.length }} de {{ totalUsersCount }} usuarios
        </span>

        <div class="flex items-center gap-1.5">
          <button
            class="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer"
            disabled
          >
            <span class="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button class="w-8 h-8 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-sm">
            1
          </button>
          <button class="w-8 h-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-medium text-xs flex items-center justify-center transition-colors cursor-pointer">
            2
          </button>
          <button class="w-8 h-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-medium text-xs flex items-center justify-center transition-colors cursor-pointer">
            3
          </button>
          <span class="px-1 text-on-surface-variant">...</span>
          <button class="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
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

        <!-- Modal Error Message -->
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
                type="text"
                required
                placeholder="Ej: Elena"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Apellido *</label>
              <input
                v-model="userForm.lastName"
                type="text"
                required
                placeholder="Ej: Castillo"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Correo Electrónico *</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              placeholder="elena.c@aquapure.com"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
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

          <div v-if="!isEditing">
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Contraseña Inicial *</label>
            <input
              v-model="userForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
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
              class="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary glow-cyan-hover shadow-lg shadow-primary/25 cursor-pointer"
            >
              {{ isEditing ? 'Guardar Cambios' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useToast } from '~/composables/useToast';
import { z } from 'zod';

definePageMeta({
  middleware: ['auth'],
});

const toast = useToast();

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  isActive: boolean;
  lastAccess: string;
  initials: string;
}

const UserSchema = z.object({
  firstName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres.'),
  email: z.string().trim().email('Ingrese un correo electrónico válido.'),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR']),
  isActive: z.boolean(),
});

const searchQuery = ref('');
const activeFilter = ref<'ALL' | 'ADMIN' | 'OPERATOR'>('ALL');
const selectAll = ref(false);
const selectedUserIds = ref<string[]>([]);
const totalUsersCount = 24;

const showUserModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref<string | null>(null);
const modalError = ref<string | null>(null);

const roleFilters = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Administradores', value: 'ADMIN' },
  { label: 'Operadores', value: 'OPERATOR' },
];

const users = ref<UserItem[]>([
  {
    id: 'user-1',
    firstName: 'Elena',
    lastName: 'Castillo',
    fullName: 'Elena Castillo',
    email: 'elena.c@aquapure.com',
    role: 'ADMIN',
    isActive: true,
    lastAccess: 'Hoy, 09:41 AM',
    initials: 'EC',
  },
  {
    id: 'user-2',
    firstName: 'Miguel',
    lastName: 'Rivera',
    fullName: 'Miguel Rivera',
    email: 'm.rivera@aquapure.com',
    role: 'OPERATOR',
    isActive: true,
    lastAccess: 'Ayer, 16:30 PM',
    initials: 'MR',
  },
  {
    id: 'user-3',
    firstName: 'Sofia',
    lastName: 'Lopez',
    fullName: 'Sofia Lopez',
    email: 's.lopez@aquapure.com',
    role: 'OPERATOR',
    isActive: false,
    lastAccess: '12 Oct 2023',
    initials: 'SL',
  },
]);

const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: 'OPERATOR' as 'ADMIN' | 'MANAGER' | 'OPERATOR',
  isActive: true,
  password: '',
});

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchesFilter =
      activeFilter.value === 'ALL' ||
      (activeFilter.value === 'ADMIN' && u.role === 'ADMIN') ||
      (activeFilter.value === 'OPERATOR' && u.role === 'OPERATOR');

    const q = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });
});

const toggleSortOrder = () => {
  users.value.reverse();
  toast.info('Orden de lista actualizado');
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
  showUserModal.value = true;
};

const saveUser = () => {
  modalError.value = null;
  const cleaned = sanitizeFormData(userForm);

  const fNameErr = validateRequired(cleaned.firstName, 'El nombre');
  if (fNameErr) {
    modalError.value = fNameErr;
    return;
  }

  const lNameErr = validateRequired(cleaned.lastName, 'El apellido');
  if (lNameErr) {
    modalError.value = lNameErr;
    return;
  }

  const emailErr = validateEmail(cleaned.email);
  if (emailErr) {
    modalError.value = emailErr;
    return;
  }

  if (!isEditing.value) {
    const passErr = validatePassword(cleaned.password, 6);
    if (passErr) {
      modalError.value = passErr;
      return;
    }
  }

  const initials = `${cleaned.firstName.charAt(0)}${cleaned.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${cleaned.firstName} ${cleaned.lastName}`;

  if (isEditing.value && editingUserId.value) {
    const userIndex = users.value.findIndex((u) => u.id === editingUserId.value);
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        firstName: cleaned.firstName,
        lastName: cleaned.lastName,
        fullName,
        email: cleaned.email,
        role: cleaned.role,
        isActive: cleaned.isActive,
        initials,
      };
      toast.updateSuccess('Usuario', `Usuario ${fullName} actualizado exitosamente.`);
    }
  } else {
    // Check duplicate email
    if (users.value.some(u => u.email.toLowerCase() === cleaned.email.toLowerCase())) {
      modalError.value = 'Ya existe un usuario con este correo electrónico.';
      return;
    }

    const newId = `user-${Date.now()}`;
    users.value.unshift({
      id: newId,
      firstName: cleaned.firstName,
      lastName: cleaned.lastName,
      fullName,
      email: cleaned.email,
      role: cleaned.role,
      isActive: cleaned.isActive,
      lastAccess: 'Recién creado',
      initials,
    });
    toast.createSuccess('Usuario', `Usuario ${fullName} registrado exitosamente.`);
  }

  showUserModal.value = false;
};

const toggleUserStatus = (user: UserItem) => {
  user.isActive = !user.isActive;
  toast.info(
    'Estado de usuario',
    `Usuario ${user.fullName} ${user.isActive ? 'activado' : 'desactivado'} correctamente.`
  );
};

const deleteUser = (user: UserItem) => {
  users.value = users.value.filter((u) => u.id !== user.id);
  toast.deleteSuccess('Usuario', `Usuario ${user.fullName} eliminado.`);
};
</script>
