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
          950: '#040605',
          900: '#080C0A',
          850: '#0D1310',
          800: '#141D18',
          750: '#1B2620',
          700: '#26362E',
          600: '#3A5245',
          500: '#6B8777',
          400: '#9FB3A8',
          300: '#D1DDD6',
          200: '#E8EFEA',
          100: '#F5F8F6'
        },
        brand: {
          emerald: '#00DC82',
          emeraldDim: 'rgba(0, 220, 130, 0.10)',
          mint: '#10B981',
          lime: '#4ADE80',
          white: '#FFFFFF',
          silver: '#E2E8F0',
          dark: '#050706'
        },
        signal: {
          emerald: '#00DC82',
          emeraldDim: 'rgba(0, 220, 130, 0.12)',
          amber: '#00DC82', // unified to luxury mint-green
          amberDim: 'rgba(0, 220, 130, 0.12)',
          cyan: '#10B981',
          cyanDim: 'rgba(16, 185, 129, 0.12)',
          rose: '#EF4444',
          roseDim: 'rgba(239, 68, 68, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -4px rgba(0, 220, 130, 0.35)',
        'glow-white': '0 0 20px -5px rgba(255, 255, 255, 0.25)',
        'subtle-panel': '0 4px 24px -2px rgba(0, 0, 0, 0.85)'
      }
    },
  },
  plugins: [],
}
