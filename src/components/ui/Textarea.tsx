import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, showCharCount, maxLength, id, value, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || `textarea-${generatedId}`;
    const hasError = Boolean(error);
    const [charCount, setCharCount] = React.useState(0);

    React.useEffect(() => {
      if (value) {
        setCharCount(String(value).length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount || maxLength) {
        setCharCount(e.target.value.length);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {/* Label and Character Count */}
        {(label || showCharCount) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <label
                htmlFor={textareaId}
                className="text-sm font-medium text-text-primary"
              >
                {label}
                {props.required && <span className="ml-1 text-error">*</span>}
              </label>
            )}
            {showCharCount && maxLength && (
              <span
                className={cn(
                  'text-xs',
                  charCount > maxLength ? 'text-error' : 'text-text-tertiary'
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Textarea Field */}
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            'flex min-h-[120px] w-full rounded-md border bg-white px-4 py-3',
            'text-base text-text-primary placeholder:text-text-tertiary',
            'transition-all duration-200 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Normal state
            !hasError && 'border-bg-muted focus:border-primary-rose focus:ring-primary-rose/20',
            // Error state
            hasError && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
