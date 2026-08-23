import type { Config } from 'tailwindcss';
import { colors } from '../src/tokens/colors';
import { typography } from '../src/tokens/typography';
import { spacing } from '../src/tokens/spacing';
import { borderRadius } from '../src/tokens/border-radius';
import { shadows } from '../src/tokens/shadows';

const lightColors = colors.light;
const darkColors = colors.dark;

const flattenColors = (obj: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = `${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenColors(value, `${cssKey}-`));
    } else {
      result[cssKey] = value;
    }
  }
  return result;
};

const lightColorVars = flattenColors(lightColors);
const darkColorVars = flattenColors(darkColors);

const preset: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: lightColorVars['primary-default'],
          container: lightColorVars['primary-container'],
          dark: lightColorVars['primary-dark'],
          onPrimary: lightColorVars['primary-onprimary'],
          onContainer: lightColorVars['primary-onprimarycontainer'],
        },
        secondary: {
          DEFAULT: lightColorVars['secondary-default'],
          container: lightColorVars['secondary-container'],
          onSecondary: lightColorVars['secondary-onsecondary'],
          onContainer: lightColorVars['secondary-onsecondarycontainer'],
        },
        tertiary: {
          DEFAULT: lightColorVars['tertiary-default'],
          container: lightColorVars['tertiary-container'],
          onTertiary: lightColorVars['tertiary-ontertiary'],
          onContainer: lightColorVars['tertiary-ontertiarycontainer'],
        },
        surface: {
          DEFAULT: lightColorVars['surface-default'],
          container: lightColorVars['surface-container'],
          containerHigh: lightColorVars['surface-containerhigh'],
          containerHighest: lightColorVars['surface-containerhighest'],
          containerLow: lightColorVars['surface-containerlow'],
          containerLowest: lightColorVars['surface-containerlowest'],
          dim: lightColorVars['surface-dim'],
          bright: lightColorVars['surface-bright'],
          tint: lightColorVars['surface-tint'],
          variant: lightColorVars['surface-variant'],
          onSurface: lightColorVars['surface-onsurface'],
          onSurfaceVariant: lightColorVars['surface-onsurfacevariant'],
        },
        background: lightColorVars['background'],
        onBackground: lightColorVars['onbackground'],
        outline: lightColorVars['outline'],
        outlineVariant: lightColorVars['outlinevariant'],
        inverseSurface: lightColorVars['inversesurface'],
        inverseOnSurface: lightColorVars['inverseonsurface'],
        inversePrimary: lightColorVars['inverseprimary'],
        error: {
          DEFAULT: lightColorVars['error-default'],
          onError: lightColorVars['error-onerror'],
          container: lightColorVars['error-container'],
          onContainer: lightColorVars['error-onerrorcontainer'],
        },
        success: {
          DEFAULT: lightColorVars['success-default'],
          onSuccess: lightColorVars['success-onsuccess'],
          container: lightColorVars['success-container'],
          onContainer: lightColorVars['success-onsuccesscontainer'],
        },
        warning: {
          DEFAULT: lightColorVars['warning-default'],
          onWarning: lightColorVars['warning-onwarning'],
          container: lightColorVars['warning-container'],
          onContainer: lightColorVars['warning-onwarningcontainer'],
        },
      },
      darkMode: {
        primary: {
          DEFAULT: darkColorVars['primary-default'],
          container: darkColorVars['primary-container'],
          dark: darkColorVars['primary-dark'],
          onPrimary: darkColorVars['primary-onprimary'],
          onContainer: darkColorVars['primary-onprimarycontainer'],
        },
        secondary: {
          DEFAULT: darkColorVars['secondary-default'],
          container: darkColorVars['secondary-container'],
          onSecondary: darkColorVars['secondary-onsecondary'],
          onContainer: darkColorVars['secondary-onsecondarycontainer'],
        },
        tertiary: {
          DEFAULT: darkColorVars['tertiary-default'],
          container: darkColorVars['tertiary-container'],
          onTertiary: darkColorVars['tertiary-ontertiary'],
          onContainer: darkColorVars['tertiary-ontertiarycontainer'],
        },
        surface: {
          DEFAULT: darkColorVars['surface-default'],
          container: darkColorVars['surface-container'],
          containerHigh: darkColorVars['surface-containerhigh'],
          containerHighest: darkColorVars['surface-containerhighest'],
          containerLow: darkColorVars['surface-containerlow'],
          containerLowest: darkColorVars['surface-containerlowest'],
          dim: darkColorVars['surface-dim'],
          bright: darkColorVars['surface-bright'],
          tint: darkColorVars['surface-tint'],
          variant: darkColorVars['surface-variant'],
          onSurface: darkColorVars['surface-onsurface'],
          onSurfaceVariant: darkColorVars['surface-onsurfacevariant'],
        },
        background: darkColorVars['background'],
        onBackground: darkColorVars['onbackground'],
        outline: darkColorVars['outline'],
        outlineVariant: darkColorVars['outlinevariant'],
        inverseSurface: darkColorVars['inversesurface'],
        inverseOnSurface: darkColorVars['inverseonsurface'],
        inversePrimary: darkColorVars['inverseprimary'],
        error: {
          DEFAULT: darkColorVars['error-default'],
          onError: darkColorVars['error-onerror'],
          container: darkColorVars['error-container'],
          onContainer: darkColorVars['error-onerrorcontainer'],
        },
        success: {
          DEFAULT: darkColorVars['success-default'],
          onSuccess: darkColorVars['success-onsuccess'],
          container: darkColorVars['success-container'],
          onContainer: darkColorVars['success-onsuccesscontainer'],
        },
        warning: {
          DEFAULT: darkColorVars['warning-default'],
          onWarning: darkColorVars['warning-onwarning'],
          container: darkColorVars['warning-container'],
          onContainer: darkColorVars['warning-onwarningcontainer'],
        },
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing: {
        ...Object.fromEntries(
          Object.entries(spacing).filter(([key]) => !isNaN(Number(key))).map(([key, value]) => [key, value])
        ),
        gutter: spacing.gutter,
        section: spacing.section,
      },
      borderRadius,
      boxShadow: shadows,
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
        'ultra': '1536px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: spacing.containerPadding.mobile,
          desktop: spacing.containerPadding.desktop,
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
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
};

export default preset;