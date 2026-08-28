import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';
import { useFeathers } from '~/composables/useFeathers';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  isActive: boolean;
  lastLoginAt: string | null;
  avatar?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const toast = useToast();
  const { client } = useFeathers();

  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isManager = computed(() => user.value?.role === 'MANAGER');
  const isOperator = computed(() => user.value?.role === 'OPERATOR');

  // RBAC Permission Computeds
  const canManageUsers = computed(() => user.value?.role === 'ADMIN');
  const canManageSettings = computed(() => user.value?.role === 'ADMIN');
  const canEditInventory = computed(() => ['ADMIN', 'MANAGER'].includes(user.value?.role || ''));
  const canManageSales = computed(() => ['ADMIN', 'MANAGER', 'OPERATOR'].includes(user.value?.role || ''));
  const canViewInvoices = computed(() => ['ADMIN', 'MANAGER', 'OPERATOR'].includes(user.value?.role || ''));

  const hasRole = (roles: string[]) => {
    return user.value ? roles.includes(user.value.role) : false;
  };

  const fetchUser = async () => {
    try {
      const userData = await client.service('users').get('me');
      user.value = userData;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      if (!user.value) {
        logout();
      }
    }
  };

  const initialize = async () => {
    try {
      const authResult = await client.authenticate();
      if (authResult?.accessToken) {
        accessToken.value = authResult.accessToken;
        refreshToken.value = authResult.refreshToken;
        user.value = authResult.user || null;
        if (!user.value) {
          await fetchUser();
        }
      }
    } catch (err) {
      console.debug('No existing session');
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    loading.value = true;
    error.value = null;

    try {
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          window.localStorage.setItem('rememberMe', 'true');
        } else {
          window.localStorage.removeItem('rememberMe');
          window.localStorage.removeItem('feathers-jwt');
          window.sessionStorage.removeItem('feathers-jwt');
        }
      }

      const authResult = await client.authenticate({
        strategy: 'local',
        email,
        password,
      });

      accessToken.value = authResult.accessToken;
      refreshToken.value = authResult.refreshToken;
      user.value = authResult.user || null;

      toast.success('¡Bienvenido!');
      router.push('/dashboard');
    } catch (err: any) {
      error.value = err.message || 'Credenciales inválidas';
      toast.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await client.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('rememberMe');
        window.localStorage.removeItem('feathers-jwt');
        window.sessionStorage.removeItem('feathers-jwt');
      }
      router.push('/login');
      toast.info('Has cerrado sesión correctamente');
    }
  };

  // Listen for auth changes on the shared client
  client.on('authenticated', async (authResult: any) => {
    accessToken.value = authResult.accessToken;
    refreshToken.value = authResult.refreshToken;
    if (authResult.user) {
      user.value = authResult.user;
    } else {
      await fetchUser();
    }
  });

  client.on('logout', () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
  });

  const setUser = (newUser: User | null, token: string | null = null) => {
    user.value = newUser;
    if (token !== undefined) {
      accessToken.value = token;
    }
  };

  return {
    user: computed(() => user.value),
    accessToken: computed(() => accessToken.value),
    refreshToken: computed(() => refreshToken.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isAuthenticated,
    isAdmin,
    isManager,
    isOperator,
    canManageUsers,
    canManageSettings,
    canEditInventory,
    canManageSales,
    canViewInvoices,
    hasRole,
    setUser,
    login,
    logout,
    initialize,
    client,
  };
});