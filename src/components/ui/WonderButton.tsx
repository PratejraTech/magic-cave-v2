import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'frosted';
type ButtonSize = 'sm' | 'md' | 'lg' | 'pill';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-[0_20px_40px_rgba(16,185,129,0.35)] hover:shadow-[0_25px_55px_rgba(16,185,129,0.45)]',
  secondary:
    'bg-white/10 text-white border border-white/30 shadow-[0_10px_40px_rgba(255,255,255,0.12)] hover:bg-white/20',
  ghost:
    'bg-transparent text-white hover:bg-white/10 border border-transparent',
  outline:
    'border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 dark:border-white/30 dark:text-white dark:bg-transparent dark:hover:bg-white/10',
  danger:
    'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_20px_40px_rgba(244,63,94,0.35)] hover:shadow-[0_25px_55px_rgba(244,63,94,0.45)]',
  frosted:
    'bg-white/15 text-white border border-white/30 backdrop-blur-xl hover:bg-white/25'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs h-9 px-4',
  md: 'text-sm h-11 px-5',
  lg: 'text-base h-12 px-6',
  pill: 'text-sm h-12 px-8 rounded-full'
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
  ) => (
    <button
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-white/70 disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-y-0 left-4 flex items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      {!loading && leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
    </button>
  )
);

Button.displayName = 'Button';

