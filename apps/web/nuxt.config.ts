import tailwindcss from '@nuxtjs/tailwindcss';
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  devServer: {
    port: 3000,
  },

  srcDir: 'src',

  future: {
    compatibilityVersion: 4,
  },

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
      htmlAttrs: {
        lang: 'es',
      },
      script: [
        {
          children: `(function() {
            try {
              var theme = localStorage.getItem('theme') || 'dark';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch (e) {}
          })();`,
          type: 'text/javascript',
        },
      ],
      title: 'AquaPure Pro',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0b1326' },
        { name: 'description', content: 'AquaPure Pro - Water Purification Management System' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' },
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