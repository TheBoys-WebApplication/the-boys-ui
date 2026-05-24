import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Dark-mode palette — pulled directly from the logo dark SVG
        navy: {
          950: '#0F0F1E', // compass inner fill (deepest)
          900: '#1A1A2E', // logo background  ← page bg in dark mode
          800: '#16213E', // surfaces: cards, headers, inputs, modals
          700: '#1E2A45', // elevated: code blocks, hover states, skeletons
          600: '#2A3A60', // borders & dividers
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
