import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  description?: string;
  onChange?: (checked: boolean) => void;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, id, checked, onChange, disabled, ...props }, ref) => {
    const toggleId = id || `toggle-${React.useId()}`;
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      if (onChange) {
        onChange(newChecked);
      }
    };

    return (
      <div className={cn('flex items-start gap-3', className)}>
        {/* Toggle Switch */}
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={toggleId}
            className={cn(
              'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full',
              'transition-colors duration-200 ease-in-out',
              'focus-within:ring-2 focus-within:ring-primary-rose focus-within:ring-offset-2',
              // Unchecked state
              'bg-bg-muted',
              // Checked state
              'peer-checked:bg-gradient-to-r peer-checked:from-primary-peach peer-checked:via-primary-rose peer-checked:to-primary-purple',
              // Disabled state
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
            )}
          >
            <motion.span
              layout
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }}
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition',
                isChecked ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </label>
        </div>

        {/* Label and Description */}
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={toggleId}
                className={cn(
                  'text-sm font-medium text-text-primary',
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                )}
              >
                {label}
                {props.required && <span className="ml-1 text-error">*</span>}
              </label>
            )}
            {description && (
              <p className={cn('text-sm text-text-secondary', disabled && 'opacity-50')}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
export default Toggle;
