<template>
  <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4">
    <div class="w-full max-w-md text-center">
      <div class="mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <div class="w-10 h-10 bg-primary dark:bg-primary-dark rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <span class="text-headline-lg font-bold text-on-surface dark:text-on-surface">AquaPure Pro</span>
        </NuxtLink>
      </div>

      <Card class="p-8">
        <div class="mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-error/10 dark:bg-error-dark/10 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-error dark:text-error-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-headline-lg font-bold text-on-surface dark:text-on-surface mb-2">
            Something went wrong
          </h1>
          <p class="text-on-surface-variant dark:text-on-surface-variant">
            {{ error?.statusMessage || 'An unexpected error occurred' }}
          </p>
        </div>

        <div class="space-y-3">
          <NuxtLink to="/" class="btn btn-primary btn-lg w-full">
            Go Home
          </NuxtLink>
          <button @click="window.location.reload()" class="btn btn-secondary btn-lg w-full">
            Try Again
          </button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number;
    statusMessage: string;
    message: string;
  };
}>();
</script>