<template>
  <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
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
        <slot />
      </Card>

      <p class="mt-6 text-center text-label-sm text-on-surface-variant dark:text-on-surface-variant">
        &copy; {{ new Date().getFullYear() }} AquaPure Pro. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '~/components/ui/Card.vue';
</script>