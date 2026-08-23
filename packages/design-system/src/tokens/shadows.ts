export const shadows = {
  none: 'none',
  level1: '0 2px 4px rgba(15, 23, 42, 0.05)',
  level2: '0 8px 16px rgba(15, 23, 42, 0.08)',
  level3: '0 16px 32px rgba(15, 23, 42, 0.12)',
  glow: '0 0 12px rgba(0, 88, 188, 0.3)',
  glowStrong: '0 0 24px rgba(0, 88, 188, 0.5)',
  inner: 'inset 0 2px 4px rgba(15, 23, 42, 0.05)',
  focus: '0 0 0 2px #0058bc',
  focusDark: '0 0 0 2px #adc6ff',
} as const;

export type ShadowScale = typeof shadows;