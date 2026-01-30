interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Logo({ size = 'medium', className = '' }: LogoProps) {
  const sizeStyles = {
    small: 'text-[23.558px]',
    medium: 'text-[41.034px]',
    large: 'text-[48px]'
  };

  return (
    <div className={`grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0 ${className}`}>
      <p className={`col-1 css-ew64yg font-heading-large leading-[1.35] ml-0 mt-0 not-italic relative row-1 text-[var(--color-primary-main)] ${sizeStyles[size]}`}>
        SmartChain
      </p>
    </div>
  );
}

export function LogoWithSubtitle({ className = '' }: { className?: string }) {
  return (
    <div className={`content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full ${className}`}>
      <Logo size="medium" />
      <p className="css-4hzbpn font-title-medium leading-[1.4] not-italic relative shrink-0 text-[var(--color-text-primary)] text-center w-full">
        현대중공업 협력사 통합관리시스템
      </p>
    </div>
  );
}
