import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'default',
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = "flex gap-[8px] items-center justify-center px-[24px] relative rounded-[var(--radius-default)] transition-colors";

  const variantStyles = {
    primary: "bg-[var(--color-primary-main)] text-white hover:bg-[var(--color-primary-dark)]",
    secondary: "bg-[var(--color-primary-light)] text-[var(--color-primary-text)] border border-[var(--color-primary-border)] hover:bg-[var(--color-primary-border)]"
  };

  const sizeStyles = {
    default: "h-[56px]",
    large: "h-[64px]"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span className="font-body-large leading-[1.6] flex items-center gap-[8px]">{children}</span>
    </button>
  );
}
