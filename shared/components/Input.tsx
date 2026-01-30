import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`content-stretch flex flex-col gap-[8px] items-start relative shrink-0 ${containerClassName}`}>
        {label && (
          <div className="content-stretch flex gap-[2px] items-start relative shrink-0">
            <label className="css-ew64yg font-title-small text-[var(--color-text-primary)]">
              {label}
            </label>
          </div>
        )}
        <div className="bg-white content-stretch flex gap-[8px] h-[56px] items-center px-[16px] relative rounded-[var(--radius-default)] shrink-0 w-full">
          <div aria-hidden="true" className="absolute border border-[var(--color-border-input)] border-solid inset-0 pointer-events-none rounded-[var(--radius-default)]" />
          <input
            ref={ref}
            className={`css-4hzbpn flex-[1_0_0] font-body-medium leading-[1.5] min-h-px min-w-px not-italic relative text-[var(--color-text-primary)] bg-transparent border-none outline-none placeholder:text-[var(--color-text-secondary)] ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="font-detail-small text-[var(--color-state-error-text)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
