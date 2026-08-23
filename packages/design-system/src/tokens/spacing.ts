export const spacing = {
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
  gutter: '24px',
  section: '48px',
  containerPadding: {
    mobile: '16px',
    desktop: '32px',
  },
} as const;

export type SpacingScale = typeof spacing;

export function spacingValue(key: keyof SpacingScale): string {
  return spacing[key];
}