/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design Token Colors
        'dt-background': {
          light: 'var(--dt-color-background-light)',
          dark: 'var(--dt-color-background-dark)',
        },
        'dt-surface': {
          'low-light': 'var(--dt-color-surface-low-light)',
          'mid-light': 'var(--dt-color-surface-mid-light)',
          'low-dark': 'var(--dt-color-surface-low-dark)',
          'mid-dark': 'var(--dt-color-surface-mid-dark)',
        },
        'dt-text': {
          'primary-light': 'var(--dt-color-text-primary-light)',
          'secondary-light': 'var(--dt-color-text-secondary-light)',
          'primary-dark': 'var(--dt-color-text-primary-dark)',
          'secondary-dark': 'var(--dt-color-text-secondary-dark)',
        },
        'dt-accent': {
          primary: 'var(--dt-color-accent-primary)',
          hover: 'var(--dt-color-accent-hover)',
          muted: 'var(--dt-color-accent-muted)',
        },
        'dt-border': {
          light: 'var(--dt-color-border-light)',
          dark: 'var(--dt-color-border-dark)',
        },
        'dt-shadow': {
          layer1: 'var(--dt-color-shadow-layer1)',
          layer2: 'var(--dt-color-shadow-layer2)',
          'dark-layer1': 'var(--dt-color-shadow-dark-layer1)',
        },
        // White Christmas Wonderland Palette
        'ice-blue': '#e0f2fe',
        'frost-white': '#ffffff',
        'aurora-green': '#dcfce7',
        'silver-frost': '#f1f5f9',
        'deep-ice': '#f8fafc',
        'arctic-blue': '#f0f9ff',
        'winter-mint': '#ecfdf5',
        'snow-flake': '#ffffff',
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
      spacing: {
        'dt-xxs': 'var(--dt-spacing-xxs)',
        'dt-xs': 'var(--dt-spacing-xs)',
        'dt-sm': 'var(--dt-spacing-sm)',
        'dt-md': 'var(--dt-spacing-md)',
        'dt-lg': 'var(--dt-spacing-lg)',
        'dt-xl': 'var(--dt-spacing-xl)',
        'dt-xxl': 'var(--dt-spacing-xxl)',
      },
      borderRadius: {
        'dt-sm': 'var(--dt-radius-sm)',
        'dt-md': 'var(--dt-radius-md)',
        'dt-lg': 'var(--dt-radius-lg)',
        'dt-pill': 'var(--dt-radius-pill)',
      },
      boxShadow: {
        'dt-card': 'var(--dt-shadow-card)',
        'dt-modal': 'var(--dt-shadow-modal)',
        'dt-elevated-dark': 'var(--dt-shadow-elevated-dark)',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'nunito': ['Nunito', 'system-ui', 'sans-serif'],
        christmas: ['Fredoka', 'cursive'],
      },
      fontSize: {
        'dt-heading1': ['var(--dt-typography-heading1-fontSize)', {
          lineHeight: 'var(--dt-typography-heading1-lineHeight)',
          fontWeight: 'var(--dt-typography-heading1-fontWeight)',
        }],
        'dt-heading2': ['var(--dt-typography-heading2-fontSize)', {
          lineHeight: 'var(--dt-typography-heading2-lineHeight)',
          fontWeight: 'var(--dt-typography-heading2-fontWeight)',
        }],
        'dt-heading3': ['var(--dt-typography-heading3-fontSize)', {
          lineHeight: 'var(--dt-typography-heading3-lineHeight)',
          fontWeight: 'var(--dt-typography-heading3-fontWeight)',
        }],
        'dt-body': ['var(--dt-typography-body-fontSize)', {
          lineHeight: 'var(--dt-typography-body-lineHeight)',
          fontWeight: 'var(--dt-typography-body-fontWeight)',
        }],
        'dt-body-small': ['var(--dt-typography-body-small-fontSize)', {
          lineHeight: 'var(--dt-typography-body-small-lineHeight)',
          fontWeight: 'var(--dt-typography-body-small-fontWeight)',
        }],
        'dt-caption': ['var(--dt-typography-caption-fontSize)', {
          lineHeight: 'var(--dt-typography-caption-lineHeight)',
          fontWeight: 'var(--dt-typography-caption-fontWeight)',
        }],
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
