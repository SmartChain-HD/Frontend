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
  const baseStyles = "content-stretch flex gap-[4px] items-center justify-center px-[24px] relative rounded-[var(--radius-default)] transition-colors";
  
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
      <div className="css-g0mm18 flex flex-col font-body-large justify-center leading-[0] not-italic relative shrink-0">
        <p className="css-ew64yg leading-[1.6]">{children}</p>
      </div>
    </button>
  );
}
