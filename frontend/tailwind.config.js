/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        clay: {
          50:  '#fff9f5',
          100: '#fff0e8',
          200: '#ffddc8',
          300: '#ffbf99',
          400: '#ff9a6c',
          500: '#ff7040',
          600: '#f04e1e',
          700: '#c83a12',
          800: '#a02e10',
          900: '#832a13',
        },
        cream: '#fef8f0',
        mango: '#ff8c42',
        kiwi:  '#6bcb77',
        sky:   '#4ecdc4',
        grape: '#a78bfa',
        lemon: '#ffd166',
      },
      boxShadow: {
        'clay-sm': '3px 3px 0 0 rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'clay':    '6px 6px 0 0 rgba(0,0,0,0.1),  inset 0 1px 0 rgba(255,255,255,0.6)',
        'clay-lg': '10px 10px 0 0 rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.6)',
        'clay-xl': '14px 14px 0 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.7)',
        'inner-glow': 'inset 0 2px 8px rgba(255,255,255,0.8), inset 0 -2px 8px rgba(0,0,0,0.06)',
        'glow-mango': '0 0 30px rgba(255,140,66,0.4)',
        'glow-grape': '0 0 30px rgba(167,139,250,0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%':   { opacity: 0, transform: 'scale(0.8)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
