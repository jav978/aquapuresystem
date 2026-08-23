export const colors = {
  light: {
    primary: {
      DEFAULT: '#0058bc',
      container: '#0070eb',
      dark: '#adc6ff',
      onPrimary: '#ffffff',
      onPrimaryContainer: '#fefcff',
    },
    secondary: {
      DEFAULT: '#405f91',
      container: '#a6c5fe',
      onSecondary: '#ffffff',
      onSecondaryContainer: '#315182',
    },
    tertiary: {
      DEFAULT: '#4c5f66',
      container: '#65777f',
      onTertiary: '#ffffff',
      onTertiaryContainer: '#fafdff',
    },
    surface: {
      DEFAULT: '#f7f9fb',
      container: '#eceef0',
      containerHigh: '#e6e8ea',
      containerHighest: '#e0e3e5',
      containerLow: '#f2f4f6',
      containerLowest: '#ffffff',
      dim: '#d8dadc',
      bright: '#f7f9fb',
      tint: '#005bc1',
      variant: '#e0e3e5',
      onSurface: '#191c1e',
      onSurfaceVariant: '#414755',
    },
    background: '#f7f9fb',
    onBackground: '#191c1e',
    outline: '#717786',
    outlineVariant: '#c1c6d7',
    inverseSurface: '#2d3133',
    inverseOnSurface: '#eff1f3',
    inversePrimary: '#adc6ff',
    error: {
      DEFAULT: '#ba1a1a',
      onError: '#ffffff',
      container: '#ffdad6',
      onErrorContainer: '#93000a',
    },
    success: {
      DEFAULT: '#00684a',
      onSuccess: '#ffffff',
      container: '#a7f5d5',
      onSuccessContainer: '#002112',
    },
    warning: {
      DEFAULT: '#8c5a00',
      onWarning: '#ffffff',
      container: '#ffdc80',
      onWarningContainer: '#2d1a00',
    },
  },
  dark: {
    primary: {
      DEFAULT: '#adc6ff',
      container: '#004493',
      dark: '#0058bc',
      onPrimary: '#001a41',
      onPrimaryContainer: '#d8e2ff',
    },
    secondary: {
      DEFAULT: '#a9c7ff',
      container: '#315182',
      onSecondary: '#001b3d',
      onSecondaryContainer: '#d6e3ff',
    },
    tertiary: {
      DEFAULT: '#b6cad2',
      container: '#4c5f66',
      onTertiary: '#0b1e24',
      onTertiaryContainer: '#d2e6ef',
    },
    surface: {
      DEFAULT: '#2d3133',
      container: '#3d4143',
      containerHigh: '#484c4f',
      containerHighest: '#52575b',
      containerLow: '#373b3e',
      containerLowest: '#1e2022',
      dim: '#191c1e',
      bright: '#373b3e',
      tint: '#adc6ff',
      variant: '#414755',
      onSurface: '#eff1f3',
      onSurfaceVariant: '#c1c6d7',
    },
    background: '#191c1e',
    onBackground: '#eff1f3',
    outline: '#8a91a0',
    outlineVariant: '#414755',
    inverseSurface: '#f7f9fb',
    inverseOnSurface: '#191c1e',
    inversePrimary: '#0058bc',
    error: {
      DEFAULT: '#f2b8b5',
      onError: '#601410',
      container: '#93000a',
      onErrorContainer: '#ffdad6',
    },
    success: {
      DEFAULT: '#6ad9a0',
      onSuccess: '#002112',
      container: '#004d2e',
      onSuccessContainer: '#a7f5d5',
    },
    warning: {
      DEFAULT: '#ffcc66',
      onWarning: '#2d1a00',
      container: '#4d3600',
      onWarningContainer: '#ffdc80',
    },
  },
} as const;

export type ColorScheme = typeof colors.light;
export type ColorMode = 'light' | 'dark';

export function getColors(mode: ColorMode): ColorScheme {
  return colors[mode];
}

export function generateCSSVariables(mode: ColorMode): Record<string, string> {
  const scheme = colors[mode];
  const vars: Record<string, string> = {};

  const flatten = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cssKey = `--color-${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flatten(value, `${key}-`));
      } else {
        result[cssKey] = value;
      }
    }
    return result;
  };

  Object.assign(vars, flatten(scheme));
  return vars;
}