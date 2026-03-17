import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#070a0f', 2: '#0c1018' },
        surface: '#111827',
        card: '#141c28',
        border: { DEFAULT: '#1e2d40', 2: '#253347' },
        teal: { DEFAULT: '#0dd9c4', 2: '#08b5a2' },
        amber: { brand: '#f5a623', brand2: '#c87d10' },
        red: { DEFAULT: '#f04438', 2: '#a41010' },
        blue: { DEFAULT: '#3b82f6', 2: '#1d4e8f' },
        green: { brand: '#22c55e' },
        violet: { brand: '#a78bfa' },
        pink: { brand: '#f472b6' },
        orange: { brand: '#fb923c' },
        text: { DEFAULT: '#e2eaf5', 2: '#94a3b8', 3: '#4a5e78' },
      },
      fontFamily: {
        head: ['var(--font-head)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-teal': 'pulse-teal 2s infinite',
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease',
      },
      keyframes: {
        'pulse-teal': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13,217,196,0.4)' },
          '50%': { boxShadow: '0 0 0 5px rgba(13,217,196,0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'teal-glow': '0 0 18px rgba(13,217,196,0.3)',
      },
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

export default config
