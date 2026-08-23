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
        // Light Minimalist Palette (Swiss Technical)
        surface: {
          canvas: '#FBFBFD',      // Soft off-white page background
          card: '#FFFFFF',         // Crisp white panel
          border: '#E4E4E7',       // Subtle 1px structural dividers
        },
        text: {
          primary: '#09090B',      // Deep charcoal for high legibility
          secondary: '#71717A',    // Muted labels, metadata, hints
          muted: '#A1A1AA',        // Even more muted
        },
        action: {
          primary: '#09090B',      // High-contrast primary CTA (zinc-950)
          primaryHover: '#18181B', // zinc-900
          secondary: '#F4F4F5',    // Subtle secondary (zinc-100)
          secondaryHover: '#E4E4E7', // zinc-200
          secondaryText: '#18181B', // zinc-900
        },
        signal: {
          green: '#059669',        // Low latency, healthy routes, low cost (emerald-600)
          greenBg: '#ECFDF5',      // emerald-50
          amber: '#D97706',        // Degraded routes, high load (amber-600)
          amberBg: '#FFFAEB',      // amber-50
          red: '#DC2626',          // Provider offline, error (red-600)
          redBg: '#FEF2F2',        // red-50
        },
        // Keep existing dark theme for fallback
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
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
        'drawer': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #f1f1f4 1px, transparent 1px), linear-gradient(to bottom, #f1f1f4 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}