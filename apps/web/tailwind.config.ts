import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-dim': 'var(--color-surface-dim)',
        'surface-bright': 'var(--color-surface-bright)',
        'surface-navy': 'var(--color-surface-navy)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-variant': 'var(--color-surface-variant)',
        'on-surface': 'var(--color-text)',
        'on-surface-variant': 'var(--color-text-muted)',
        'on-background': 'var(--color-text)',
        outline: ({ opacityValue }: any) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--color-outline-rgb), ${opacityValue})`;
          }
          return 'var(--color-outline)';
        },
        'outline-variant': ({ opacityValue }: any) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--color-border-rgb), ${opacityValue})`;
          }
          return 'var(--color-border)';
        },
        outlineVariant: ({ opacityValue }: any) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--color-border-rgb), ${opacityValue})`;
          }
          return 'var(--color-border)';
        },

        primary: {
          DEFAULT: 'var(--color-primary)',
          container: 'var(--color-primary-container)',
          dark: '#8aebff',
          fixed: '#a2eeff',
          'fixed-dim': '#2fd9f4',
        },
        'primary-container': 'var(--color-primary-container)',
        'on-primary': 'var(--color-on-primary)',
        'on-primary-container': '#fefcff',

        'billing-green': 'var(--color-billing-green)',
        'admin-gold': 'var(--color-admin-gold)',
        'error-red': 'var(--color-error-red)',

        secondary: {
          DEFAULT: '#405f91',
          container: '#a6c5fe',
          fixed: '#d6e3ff',
          'fixed-dim': '#a9c7ff',
        },
        'secondary-container': '#a6c5fe',
        'on-secondary': '#ffffff',

        tertiary: {
          DEFAULT: '#4c5f66',
          container: '#65777f',
          fixed: '#d2e6ef',
          'fixed-dim': '#b6cad2',
        },
        'tertiary-container': '#65777f',
        'on-tertiary': '#ffffff',

        error: {
          DEFAULT: 'var(--color-error-red)',
          container: '#ffdad6',
        },
        'error-container': '#ffdad6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.01em' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.01em',
      },
      spacing: {
        base: '8px',
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        'space-xs': '4px',
        'space-sm': '8px',
        'space-md': '16px',
        'space-lg': '24px',
        'space-xl': '32px',
        'margin-desktop': '40px',
        gutter: '24px',
        section: '48px',
        containerPadding: {
          mobile: '16px',
          desktop: '32px',
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        level1: '0 2px 4px rgba(15, 23, 42, 0.05)',
        level2: '0 8px 16px rgba(15, 23, 42, 0.08)',
        level3: '0 16px 32px rgba(15, 23, 42, 0.12)',
        glow: '0 0 12px rgba(0, 88, 188, 0.3)',
        glowStrong: '0 0 24px rgba(0, 88, 188, 0.5)',
        inner: 'inset 0 2px 4px rgba(15, 23, 42, 0.05)',
        focus: '0 0 0 2px #0058bc',
        focusDark: '0 0 0 2px #adc6ff',
      },
      screens: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px',
        ultra: '1536px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '16px',
          desktop: '32px',
        },
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-in',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;