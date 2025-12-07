/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // New Design System Colors
        'primary-peach': 'var(--color-primary-peach)',
        'primary-rose': 'var(--color-primary-rose)',
        'primary-purple': 'var(--color-primary-purple)',
        'secondary-blue': 'var(--color-secondary-blue)',
        'secondary-indigo': 'var(--color-secondary-indigo)',
        'secondary-pink': 'var(--color-secondary-pink)',

        // Neutrals
        'bg-light': 'var(--color-bg-light)',
        'bg-soft': 'var(--color-bg-soft)',
        'bg-subtle': 'var(--color-bg-subtle)',
        'bg-muted': 'var(--color-bg-muted)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-inverse': 'var(--color-text-inverse)',

        // Pastel Accents
        'accent-mint': 'var(--color-accent-mint)',
        'accent-lavender': 'var(--color-accent-lavender)',
        'accent-peach': 'var(--color-accent-peach)',
        'accent-sky': 'var(--color-accent-sky)',
        'accent-rose': 'var(--color-accent-rose)',

        // Semantic
        'success': 'var(--color-success)',
        'success-light': 'var(--color-success-light)',
        'warning': 'var(--color-warning)',
        'warning-light': 'var(--color-warning-light)',
        'error': 'var(--color-error)',
        'error-light': 'var(--color-error-light)',
        'info': 'var(--color-info)',
        'info-light': 'var(--color-info-light)',

        // Magic Colors (Child UI)
        'magic-primary': 'var(--color-magic-primary)',
        'magic-secondary': 'var(--color-magic-secondary)',
        'magic-accent': 'var(--color-magic-accent)',
        'magic-success': 'var(--color-magic-success)',
        'magic-purple': 'var(--color-magic-purple)',

        // Shadcn UI Compatibility
        border: 'var(--color-bg-muted)',
        input: 'var(--color-bg-muted)',
        ring: 'var(--color-primary-rose)',
        background: 'var(--color-bg-light)',
        foreground: 'var(--color-text-primary)',
        card: {
          DEFAULT: 'var(--color-bg-light)',
          foreground: 'var(--color-text-primary)',
        },
        popover: {
          DEFAULT: 'var(--color-bg-light)',
          foreground: 'var(--color-text-primary)',
        },
        primary: {
          DEFAULT: 'var(--color-primary-rose)',
          foreground: 'var(--color-text-inverse)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-blue)',
          foreground: 'var(--color-text-inverse)',
        },
        muted: {
          DEFAULT: 'var(--color-bg-muted)',
          foreground: 'var(--color-text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-peach)',
          foreground: 'var(--color-text-primary)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-text-inverse)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
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
        },
        // Modern Christmas Magic Palette
        'christmas-modern': {
          'midnight': '#020617',      // Deep midnight blue
          'slate': '#0f172a',         // Rich slate blue
          'royal': '#1e3a8a',         // Royal blue
          'gold': '#fbbf24',          // Golden yellow
          'crimson': '#dc2626',       // Bright red
          'emerald': '#10b981',       // Electric green
          'purple': '#9333ea',        // Electric purple
          'amber': '#f59e0b',         // Amber
          'magenta': '#ec4899',       // Magenta
          'cyan': '#06b6d4',          // Cyan
          'electric-green': '#22c55e', // Electric green
          'hot-pink': '#ec4899',      // Hot pink
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
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
        // Legacy design tokens
        'dt-sm': 'var(--dt-radius-sm)',
        'dt-md': 'var(--dt-radius-md)',
        'dt-lg': 'var(--dt-radius-lg)',
        'dt-pill': 'var(--dt-radius-pill)',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'gradient': 'var(--shadow-gradient)',
        'magical': 'var(--shadow-magical)',
        'primary': 'var(--shadow-primary)',
        'secondary': 'var(--shadow-secondary)',
        // Legacy
        'dt-card': 'var(--dt-shadow-card)',
        'dt-modal': 'var(--dt-shadow-modal)',
        'dt-elevated-dark': 'var(--dt-shadow-elevated-dark)',
        'frost': '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        'ice-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'arctic': '0 8px 32px rgba(30, 58, 138, 0.15)',
      },
      fontFamily: {
        'display': 'var(--font-display)',
        'body': 'var(--font-body)',
        'mono': 'var(--font-mono)',
        // Legacy
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
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
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
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
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
