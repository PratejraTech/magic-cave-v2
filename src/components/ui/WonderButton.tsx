import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'soft' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: Gradient fill with warm colors (OpenAI/Anthropic style)
  primary:
    'bg-gradient-to-r from-primary-peach via-primary-rose to-primary-purple text-white shadow-gradient hover:shadow-xl font-semibold',

  // Secondary: Outline with gradient on hover
  secondary:
    'border-2 border-primary-rose text-primary-rose bg-transparent hover:bg-primary-rose hover:text-white shadow-sm',

  // Ghost: Transparent with subtle hover
  ghost:
    'bg-transparent text-text-primary hover:bg-bg-subtle',

  // Outline: Neutral outlined button
  outline:
    'border border-bg-muted text-text-primary bg-white hover:bg-bg-soft shadow-sm',

  // Soft: Light background with subtle gradient accent
  soft:
    'bg-gradient-to-br from-accent-peach/20 to-accent-lavender/20 text-text-primary hover:from-accent-peach/30 hover:to-accent-lavender/30 shadow-sm',

  // Danger: Error state with gradient
  danger:
    'bg-gradient-to-r from-error to-error text-white shadow-error hover:shadow-lg'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm h-9 px-4 gap-2',
  md: 'text-base h-11 px-6 gap-3',
  lg: 'text-lg h-12 px-8 gap-3'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={rest.type || 'button'}
        whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
        whileTap={disabled || loading ? {} : { scale: 0.98, y: 0 }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1] // --ease-smooth
        }}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-primary-rose disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          loading && 'pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {/* Loading Spinner */}
        {loading && (
          <span className="absolute inset-y-0 left-4 flex items-center">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Left Icon */}
        {!loading && leftIcon && (
          <span className="flex items-center">
            {leftIcon}
          </span>
        )}

        {/* Button Content */}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>

        {/* Right Icon */}
        {!loading && rightIcon && (
          <span className="flex items-center">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'WonderButton';

// Export as WonderButton for backward compatibility
export const WonderButton = Button;
export default Button;
