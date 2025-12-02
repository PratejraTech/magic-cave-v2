/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Modern Technology Christmas Wonderland Palette
        'ice-blue': '#1e3a8a',
        'frost-white': '#f8fafc',
        'aurora-green': '#10b981',
        'silver-frost': '#64748b',
        'deep-ice': '#0f172a',
        'arctic-blue': '#3b82f6',
        'winter-mint': '#06b6d4',
        'snow-flake': '#e2e8f0',
        // Legacy colors for backward compatibility
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
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        christmas: ['Fredoka', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'wobble': 'wobble 1s ease-in-out infinite',
        'snow-fall': 'snow-fall 10s linear infinite',
        'frost-glow': 'frost-glow 3s ease-in-out infinite alternate',
        'ice-shimmer': 'ice-shimmer 4s ease-in-out infinite',
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
        'snow-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        'frost-glow': {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)' },
        },
        'ice-shimmer': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'frost': '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        'ice-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'arctic': '0 8px 32px rgba(30, 58, 138, 0.15)',
      },
    },
  },
  plugins: [],
};
