import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-tertiary">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-md border bg-white px-4 py-2',
              'text-base text-text-primary placeholder:text-text-tertiary',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Normal state
              !hasError && 'border-bg-muted focus:border-primary-rose focus:ring-primary-rose/20',
              // Error state
              hasError && 'border-error focus:border-error focus:ring-error/20',
              // With icons
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Hint or Error Message */}
        {(hint || error) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error' : 'text-text-secondary'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
