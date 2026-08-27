<template>
  <div class="min-h-screen flex items-center justify-center bg-background text-on-surface px-4 relative overflow-hidden">
    <!-- Animated Ambient Blobs -->
    <div class="absolute top-1/4 left-1/8 w-[480px] h-[480px] bg-primary/8 rounded-full blur-3xl pointer-events-none animate-blob"></div>
    <div class="absolute bottom-1/4 right-1/8 w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-3xl pointer-events-none animate-blob-delay-2"></div>
    <div class="absolute top-2/3 left-1/2 w-[320px] h-[320px] bg-billing-green/5 rounded-full blur-3xl pointer-events-none animate-blob-delay-4"></div>

    <div class="w-full max-w-md relative z-10 animate-in">
      <!-- Brand Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3.5 group">
          <div class="w-14 h-14 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/15 group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-primary" style="font-size:32px" data-weight="fill">water_drop</span>
          </div>
          <div class="text-left">
            <h1 class="text-2xl font-bold text-primary tracking-tight">AquaPure Pro</h1>
            <p class="text-xs text-on-surface-variant">Sistema de Gestión de Agua</p>
          </div>
        </div>
      </div>

      <!-- Glassmorphic Login Card -->
      <div class="glass-card p-8" :class="{ 'animate-shake': loginFailed }">
        <div class="mb-7">
          <h2 class="text-xl font-bold text-on-surface">Iniciar Sesión</h2>
          <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">Ingresa tus credenciales para acceder a la plataforma</p>
        </div>

        <!-- Global error banner -->
        <Transition name="modal">
          <div v-if="authStore.error" class="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-error-red/10 border border-error-red/30 text-error-red text-xs font-medium">
            <span class="material-symbols-outlined text-base flex-shrink-0">error_outline</span>
            <span>{{ authStore.error }}</span>
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1.5" for="login-email">
              Correo Electrónico
            </label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">mail</span>
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                placeholder="admin@aquapure.com"
                :disabled="loading"
                autocomplete="email"
                required
                class="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-60"
                :class="errors.email ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : ''"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-error-red mt-1.5 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">error</span>
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1.5" for="login-password">
              Contraseña
            </label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">lock</span>
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                :disabled="loading"
                autocomplete="current-password"
                required
                class="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-10 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-60"
                :class="errors.password ? 'border-error-red focus:border-error-red focus:ring-error-red/20' : ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-error-red mt-1.5 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">error</span>
              {{ errors.password }}
            </p>
          </div>

          <!-- Remember Me + Forgot -->
          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors" for="remember-me">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary accent-primary"
              />
              <span>Recordarme</span>
            </label>
            <a href="#" class="text-primary hover:text-primary-container hover:underline transition-colors font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            id="btn-login"
            class="w-full bg-primary text-on-primary font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2.5 glow-cyan-hover shadow-lg shadow-primary/20 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            <span v-else class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">login</span>
              Entrar a AquaPure Pro
            </span>
          </button>
        </form>

        <!-- Demo credentials helper -->
        <div class="mt-6 p-3.5 bg-surface-container/80 rounded-xl  text-xs text-on-surface-variant">
          <p class="font-bold text-primary mb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">bolt</span>
            Acceso Demo Rápido
          </p>
          <div class="space-y-1">
            <p class="flex items-center gap-2">
              <span class="text-on-surface-variant/60">Email:</span>
              <code class="text-on-surface bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-mono">admin@aquasystem.com</code>
            </p>
            <p class="flex items-center gap-2">
              <span class="text-on-surface-variant/60">Password:</span>
              <code class="text-on-surface bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-mono">admin123</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-[11px] text-on-surface-variant/50 mt-6">
        © 2026 AquaPure Pro — Desarrollado por <span class="text-primary/80">Ing. José Vásquez</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';

definePageMeta({
  layout: false,
  middleware: ['guest'],
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const showPassword = ref(false);
const loginFailed = ref(false);
const form = reactive({
  email: 'admin@aquasystem.com',
  password: 'admin123',
  rememberMe: false,
});
const errors = reactive({
  email: '',
  password: '',
});

const validateForm = () => {
  let valid = true;
  errors.email = '';
  errors.password = '';

  if (!form.email) {
    errors.email = 'El correo electrónico es requerido';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Formato de correo inválido';
    valid = false;
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida';
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  loginFailed.value = false;
  try {
    await authStore.login(form.email, form.password, form.rememberMe);
    const redirect = (route.query.redirect as string) || '/dashboard';
    router.push(redirect);
  } catch (err: any) {
    // Trigger shake animation and show toast
    loginFailed.value = true;
    toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
    // Reset shake after animation completes
    setTimeout(() => { loginFailed.value = false; }, 500);
  } finally {
    loading.value = false;
  }
};


</script>