import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import authentication from '@feathersjs/authentication-client';
import io from 'socket.io-client';
import { useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';

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

  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Feathers client
  const socket = io(import.meta.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3030', {
    transports: ['websocket'],
    autoConnect: false,
  });

  const client = feathers();
  client.configure(socketio(socket));
  client.configure(authentication({
    storage: window.localStorage,
    path: '/authentication',
    jwtStrategy: 'jwt',
  }));

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isManager = computed(() => ['ADMIN', 'MANAGER'].includes(user.value?.role || ''));
  const isOperator = computed(() => ['ADMIN', 'MANAGER', 'OPERATOR'].includes(user.value?.role || ''));

  const hasRole = (roles: string[]) => {
    return user.value ? roles.includes(user.value.role) : false;
  };

  const initialize = async () => {
    try {
      const authResult = await client.authenticate();
      if (authResult?.accessToken) {
        accessToken.value = authResult.accessToken;
        refreshToken.value = authResult.refreshToken;
        await fetchUser();
      }
    } catch (err) {
      console.debug('No existing session');
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await client.service('users').get('me');
      user.value = userData;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    loading.value = true;
    error.value = null;

    try {
      const authResult = await client.authenticate({
        strategy: 'local',
        email,
        password,
      });

      accessToken.value = authResult.accessToken;
      refreshToken.value = authResult.refreshToken;

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      await fetchUser();
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      error.value = err.message || 'Invalid credentials';
      toast.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    loading.value = true;
    error.value = null;

    try {
      await client.service('users').create(data);
      toast.success('Registration successful! Please check your email.');
      router.push('/login');
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
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
      localStorage.removeItem('rememberMe');
      router.push('/login');
      toast.info('You have been logged out');
    }
  };

  const forgotPassword = async (email: string) => {
    loading.value = true;
    try {
      await client.service('auth/password').create({ email, action: 'forgot' });
      toast.success('If the email exists, a reset code has been sent');
    } catch (err: any) {
      toast.error('Failed to send reset code');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const verifyCode = async (email: string, code: string) => {
    loading.value = true;
    try {
      await client.service('auth/password').create({ email, code, action: 'verify' });
      toast.success('Code verified successfully');
    } catch (err: any) {
      toast.error('Invalid or expired code');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    loading.value = true;
    try {
      await client.service('auth/password').create({ email, code, newPassword, action: 'reset' });
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (err: any) {
      toast.error('Failed to reset password');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const authResult = await client.authenticate({
        strategy: 'jwt',
        refreshToken: refreshToken.value,
      });
      accessToken.value = authResult.accessToken;
      refreshToken.value = authResult.refreshToken;
      return true;
    } catch (err) {
      logout();
      return false;
    }
  };

  // Listen for auth changes
  client.on('authenticated', async (authResult) => {
    accessToken.value = authResult.accessToken;
    refreshToken.value = authResult.refreshToken;
    await fetchUser();
  });

  client.on('logout', () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
  });

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
    hasRole,
    login,
    register,
    logout,
    forgotPassword,
    verifyCode,
    resetPassword,
    refreshAccessToken,
    initialize,
    client,
  };
});