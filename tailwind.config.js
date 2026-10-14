/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8f1fa',
          100: '#b5d5ea',
          200: '#80b5d5',
          300: '#4d94c2',
          400: '#2d75a8',
          500: '#1a5a8a',
          600: '#134670',
          700: '#0e3358',
          800: '#0a2440',
          900: '#061a30',
          950: '#03101f',
        },
        orange: {
          50: '#fff0e0',
          100: '#ffd199',
          200: '#ffb866',
          300: '#ffa14d',
          400: '#ff8c33',
          500: '#ff7a1a',
          600: '#ff6b00',
          700: '#e65c00',
          800: '#cc4d00',
          900: '#b33d00',
          950: '#802c00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'cart-bounce': {
          '0%, 100%': { transform: 'scale(1) translateY(0)' },
          '30%': { transform: 'scale(1.25) translateY(-4px)' },
          '60%': { transform: 'scale(0.9) translateY(0)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'count-up': {
          '0%': { transform: 'translateY(-100%) scale(0.5)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'cart-bounce': 'cart-bounce 0.5s ease-out',
        'pop-in': 'pop-in 0.3s ease-out',
        'count-up': 'count-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
