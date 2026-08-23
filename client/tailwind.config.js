/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        grid: {
          950: '#09090b',
          900: '#121215',
          850: '#18181b',
          800: '#27272a',
          750: '#3f3f46',
          700: '#52525b',
          600: '#71717a',
          500: '#a1a1aa',
          400: '#d4d4d8',
          300: '#e4e4e7',
          200: '#f4f4f5',
          100: '#fafafa'
        },
        brand: {
          emerald: '#10B981',
          emeraldDim: 'rgba(16, 185, 129, 0.08)',
          mint: '#059669',
          lime: '#22c55e',
          white: '#FFFFFF',
          silver: '#E2E8F0',
          dark: '#09090b'
        },
        signal: {
          emerald: '#10B981',
          emeraldDim: 'rgba(16, 185, 129, 0.08)',
          amber: '#F59E0B',
          amberDim: 'rgba(245, 158, 11, 0.08)',
          cyan: '#06B6D4',
          cyanDim: 'rgba(6, 182, 212, 0.08)',
          rose: '#EF4444',
          roseDim: 'rgba(239, 68, 68, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-emerald': 'none',
        'glow-white': 'none',
        'glow-amber': 'none',
        'subtle-panel': '0 2px 12px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
