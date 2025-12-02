/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        peppermint: '#FF69B4',
        aurora: '#00FF7F',
        glacier: '#87CEEB',
        golden: '#FFD700',
        cocoa: '#8B4513',
        sparkle: '#FFFFFF',
        candy: {
          pink: '#FF69B4',
          green: '#00FF7F',
          blue: '#87CEEB',
          red: '#FF0000',
          yellow: '#FFD700',
          brown: '#8B4513',
        },
        northern: {
          purple: '#9370DB',
          green: '#00FF7F',
          blue: '#00BFFF',
        }
      },
      fontFamily: {
        christmas: ['Fredoka', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'wobble': 'wobble 1s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};
