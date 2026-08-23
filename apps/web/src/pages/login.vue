<template>
  <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <div class="w-12 h-12 bg-primary dark:bg-primary-dark rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <span class="text-headline-lg font-bold text-on-surface dark:text-on-surface">AquaPure Pro</span>
        </NuxtLink>
      </div>

      <Card class="p-8">
        <div class="mb-6">
          <h1 class="text-headline-md font-bold text-on-surface dark:text-on-surface mb-2">Welcome back</h1>
          <p class="text-on-surface-variant dark:text-on-surface-variant">Sign in to your account</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <FormField label="Email" :error="errors.email">
            <Input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              :disabled="loading"
              autocomplete="email"
              required
            />
          </FormField>

          <FormField label="Password" :error="errors.password">
            <Input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              :disabled="loading"
              autocomplete="current-password"
              required
            />
          </FormField>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-outline-variant dark:border-outline-variant text-primary focus:ring-primary"
              />
              <span class="text-label-sm text-on-surface-variant dark:text-on-surface-variant">Remember me</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-label-sm text-primary hover:underline">Forgot password?</NuxtLink>
          </div>

          <Button type="submit" variant="primary" size="lg" full-width :loading="loading">
            Sign In
          </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-on-surface-variant dark:text-on-surface-variant">
            Don't have an account?
            <NuxtLink to="/register" class="text-primary font-medium hover:underline ml-1">Sign up</NuxtLink>
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import Card from '~/components/ui/Card.vue';
import Input from '~/components/ui/Input.vue';
import Button from '~/components/ui/Button.vue';
import FormField from '~/components/ui/FormField.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const form = reactive({
  email: '',
  password: '',
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
    errors.email = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
    valid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    await authStore.login(form.email, form.password, form.rememberMe);
    const redirect = route.query.redirect as string || '/dashboard';
    router.push(redirect);
  } catch (err) {
    // Error handled in store
  } finally {
    loading.value = false;
  }
};

// Redirect if already authenticated
if (import.meta.client) {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
}
</script>