interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ label, checked = false, onChange, className = '' }: CheckboxProps) {
  return (
    <div 
      className={`content-stretch flex gap-[10px] items-center justify-center relative shrink-0 cursor-pointer ${className}`}
      onClick={() => onChange?.(!checked)}
    >
      <div className="relative shrink-0 size-[24px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g>
            <mask height="24" id="mask0_checkbox" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
              <rect fill="var(--color-primary-main)" height="24" width="24" />
            </mask>
            <g mask="url(#mask0_checkbox)">
              {checked ? (
                <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--color-primary-main)" />
              ) : (
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="var(--color-primary-main)" />
              )}
            </g>
          </g>
        </svg>
      </div>
      <p className="css-ew64yg font-body-medium leading-[1.5] not-italic relative shrink-0 text-[var(--color-state-info-text)]">
        {label}
      </p>
    </div>
  );
}

interface RadioButtonProps {
  label: string;
  checked?: boolean;
  onChange?: () => void;
  name?: string;
  className?: string;
}

export function RadioButton({ label, checked = false, onChange, name, className = '' }: RadioButtonProps) {
  return (
    <div 
      className={`content-stretch flex gap-[10px] items-center justify-center relative shrink-0 cursor-pointer ${className}`}
      onClick={onChange}
    >
      <div className="relative shrink-0 size-[24px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g>
            <mask height="24" id={`mask0_radio_${name}`} maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
              <rect fill="#D9D9D9" height="24" width="24" />
            </mask>
            <g mask={`url(#mask0_radio_${name})`}>
              {checked ? (
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="var(--color-primary-main)" />
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="var(--color-primary-main)" />
              )}
            </g>
          </g>
        </svg>
      </div>
      <p className="css-ew64yg font-body-medium leading-[1.5] not-italic relative shrink-0 text-[var(--color-state-info-text)]">
        {label}
      </p>
    </div>
  );
}
