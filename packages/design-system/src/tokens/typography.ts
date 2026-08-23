export const typography = {
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
} as const;

export type TypographyScale = typeof typography.fontSize;
export type FontFamily = keyof typeof typography.fontFamily;