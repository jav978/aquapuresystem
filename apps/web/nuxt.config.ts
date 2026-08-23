import tailwindcss from '@nuxtjs/tailwindcss';
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    exposeConfig: true,
    viewer: true,
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3030',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3030',
    },
  },

  app: {
    head: {
      title: 'AquaPure Pro',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f7f9fb' },
        { name: 'description', content: 'AquaPure Pro - Water Purification Management System' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  build: {
    transpile: [
      '@aquasystem/design-system',
      '@aquasystem/domain',
      '@aquasystem/application',
      '@aquasystem/shared-kernel',
    ],
  },

  vite: {
    optimizeDeps: {
      include: ['@aquasystem/design-system', '@aquasystem/domain', '@aquasystem/application'],
    },
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3030',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://localhost:3030',
        ws: true,
      },
    },
  },

  experimental: {
    componentIslands: true,
  },

  compatibilityDate: '2024-07-01',
});