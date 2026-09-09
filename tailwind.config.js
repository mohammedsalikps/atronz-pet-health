/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F4F1EA',
          300: '#EBE7DE',
        },
        sage: {
          50: '#F2F6F3',
          100: '#E3EBE5',
          200: '#C6D8CB',
          300: '#A4C0AC',
          400: '#84A78E',
          500: '#6B9077',
          600: '#55755F',
          700: '#445E4D',
          800: '#374B3E',
          900: '#2E3E34',
        },
        charcoal: {
          /*
           * 400 and 500 carry every micro-label and caption in the app, so
           * they are tuned to clear WCAG AA (4.5:1) on the cream surfaces
           * rather than to look as light as possible. Same warm grey hue as
           * before, just dark enough to read.
           */
          400: '#6F706B',
          500: '#5A5C57',
          600: '#4B4D49',
          700: '#353734',
          800: '#262826',
          900: '#1A1C1A',
        },
        clay: '#C2836A',
        gold: '#C9A227',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26, 28, 26, 0.04), 0 8px 24px -12px rgba(26, 28, 26, 0.10)',
        pop: '0 8px 32px -8px rgba(26, 28, 26, 0.18)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
};
