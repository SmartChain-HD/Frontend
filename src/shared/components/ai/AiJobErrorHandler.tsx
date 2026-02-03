import { cn } from '../../utils/cn';
import { useRetryJob } from '../../../hooks/useAiJobs';

interface AiJobErrorHandlerProps {
  jobId: string;
  error?: string;
  className?: string;
}

export function AiJobErrorHandler({ jobId, error, className }: AiJobErrorHandlerProps) {
  const { mutate: retry, isPending } = useRetryJob();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-default)] border border-[var(--color-state-error-border)] bg-[var(--color-state-error-bg)] p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <svg className="size-5 shrink-0 text-[var(--color-state-error-text)]" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-body-medium text-[var(--color-state-error-text)]">
          AI 분석 중 오류가 발생했습니다.
        </span>
      </div>

      {error && (
        <p className="font-detail-small text-[var(--color-text-secondary)]">{error}</p>
      )}

      <button
        type="button"
        onClick={() => retry(jobId)}
        disabled={isPending}
        className={cn(
          'inline-flex w-fit items-center gap-2 rounded-[var(--radius-default)] bg-[var(--color-primary-main)] px-4 py-2 font-body-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50',
        )}
      >
        {isPending ? '재시도 중...' : '재시도'}
      </button>
    </div>
  );
}
