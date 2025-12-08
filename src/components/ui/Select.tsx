import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || `select-${generatedId}`;
    const hasError = Boolean(error);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          {/* Select Element */}
          <select
            id={selectId}
            ref={ref}
            onChange={handleChange}
            className={cn(
              'flex h-11 w-full appearance-none rounded-md border bg-white px-4 py-2 pr-10',
              'text-base text-text-primary',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Placeholder styling
              'invalid:text-text-tertiary',
              // Normal state
              !hasError && 'border-bg-muted focus:border-primary-rose focus:ring-primary-rose/20',
              // Error state
              hasError && 'border-error focus:border-error focus:ring-error/20',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary">
            <ChevronDown className="h-5 w-5" />
          </div>
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

Select.displayName = 'Select';

export { Select };
export default Select;
