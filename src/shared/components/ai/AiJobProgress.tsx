import { cn } from '@shared/utils/cn';
import type { JobStatus } from '../../../api/aiJobs';

interface AiJobProgressProps {
  status: JobStatus;
  className?: string;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-5 animate-spin text-[var(--color-primary-main)]', className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function AiJobProgress({ status, className }: AiJobProgressProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {status === 'PENDING' && (
        <>
          <Spinner />
          <span className="font-body-medium text-[var(--color-text-secondary)]">
            작업 대기 중...
          </span>
        </>
      )}

      {status === 'RUNNING' && (
        <div className="flex w-full flex-col gap-2">
          <span className="font-body-medium text-[var(--color-text-primary)]">
            AI 분석 진행 중...
          </span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-primary-light)]">
            <div className="h-full animate-pulse rounded-full bg-[var(--color-primary-main)] transition-all duration-500 ease-in-out" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {status === 'SUCCEEDED' && (
        <>
          <svg className="size-5 text-[var(--color-state-success-text)]" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-body-medium text-[var(--color-state-success-text)]">
            분석 완료
          </span>
        </>
      )}

      {status === 'FAILED' && (
        <>
          <svg className="size-5 text-[var(--color-state-error-text)]" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-body-medium text-[var(--color-state-error-text)]">
            분석 실패
          </span>
        </>
      )}
    </div>
  );
}
