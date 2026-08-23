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
          950: '#F7F4EE',
          900: '#FFFFFF',
          850: '#F1EDE5',
          800: '#E4DDD1',
          750: '#D8CFC0',
          700: '#C6BBAA',
          600: '#9A8F7F',
          500: '#756B5F',
          400: '#5E564E',
          300: '#403A35',
          200: '#2F2B27',
          100: '#181614'
        },
        brand: {
          emerald: '#0F766E',
          emeraldDim: 'rgba(15, 118, 110, 0.10)',
          mint: '#2A9D8F',
          lime: '#8A9A5B',
          white: '#FFFFFF',
          silver: '#E9E2D8',
          dark: '#181614'
        },
        signal: {
          emerald: '#0F766E',
          emeraldDim: 'rgba(15, 118, 110, 0.12)',
          amber: '#B7791F',
          amberDim: 'rgba(183, 121, 31, 0.13)',
          cyan: '#2563EB',
          cyanDim: 'rgba(37, 99, 235, 0.10)',
          rose: '#C2410C',
          roseDim: 'rgba(194, 65, 12, 0.11)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      // A real type scale — reused everywhere instead of one-off text-[Npx]
      // values sprinkled per component.
      fontSize: {
        micro: ['11px', { lineHeight: '15px' }],
        caption: ['12px', { lineHeight: '16px' }],
        'body-sm': ['13px', { lineHeight: '19px' }],
        body: ['14px', { lineHeight: '21px' }],
        'body-lg': ['15px', { lineHeight: '23px' }],
        'heading-sm': ['16px', { lineHeight: '22px', fontWeight: '600' }],
        heading: ['20px', { lineHeight: '27px', fontWeight: '600' }],
        display: ['32px', { lineHeight: '38px', fontWeight: '500' }]
      },
      // Additive radius tokens for new/updated surfaces — doesn't touch
      // Tailwind's default rounded-lg/xl/2xl scale, so untouched pages
      // that already use those keep working unchanged.
      borderRadius: {
        control: '8px',
        card: '12px',
        panel: '16px'
      },
      boxShadow: {
        'glow-emerald': '0 1px 2px rgba(24, 22, 20, 0.10), 0 0 0 1px rgba(15, 118, 110, 0.18)',
        'glow-amber': '0 1px 2px rgba(24, 22, 20, 0.10), 0 0 0 1px rgba(183, 121, 31, 0.18)',
        'glow-white': '0 1px 2px rgba(24, 22, 20, 0.08), 0 0 0 1px rgba(24, 22, 20, 0.08)',
        'subtle-panel': '0 14px 38px -28px rgba(24, 22, 20, 0.38)',
        xs: '0 1px 2px rgba(24, 22, 20, 0.08)',
        sm: '0 4px 14px rgba(24, 22, 20, 0.08)',
        md: '0 18px 46px -30px rgba(24, 22, 20, 0.30)'
      }
    },
  },
  plugins: [],
}
