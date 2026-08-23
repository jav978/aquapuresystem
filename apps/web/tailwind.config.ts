import type { Config } from 'tailwindcss';
import preset from '@aquasystem/design-system/tailwind';

export default {
  presets: [preset],
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@aquasystem/design-system/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;