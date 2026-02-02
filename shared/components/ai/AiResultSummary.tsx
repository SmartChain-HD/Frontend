import type { Verdict, RiskLevel } from './types';

interface AiResultSummaryProps {
  verdict: Verdict;
  riskLevel: RiskLevel;
  whySummary: string;
}

const verdictConfig: Record<Verdict, { label: string; colorClass: string; icon: string }> = {
  PASS: {
    label: '통과',
    colorClass: 'bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)] border-[var(--color-state-success-border)]',
    icon: '✓',
  },
  WARN: {
    label: '주의',
    colorClass: 'bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)] border-[var(--color-state-warning-border)]',
    icon: '!',
  },
  NEED_CLARIFY: {
    label: '보완 필요',
    colorClass: 'bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)] border-[var(--color-state-warning-border)]',
    icon: '?',
  },
  NEED_FIX: {
    label: '수정 필요',
    colorClass: 'bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)] border-[var(--color-state-error-border)]',
    icon: '✕',
  },
};

const riskConfig: Record<RiskLevel, { label: string; colorClass: string }> = {
  LOW: {
    label: '낮음',
    colorClass: 'bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]',
  },
  MEDIUM: {
    label: '보통',
    colorClass: 'bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]',
  },
  HIGH: {
    label: '높음',
    colorClass: 'bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]',
  },
};

export function AiResultSummary({ verdict, riskLevel, whySummary }: AiResultSummaryProps) {
  const vConfig = verdictConfig[verdict];
  const rConfig = riskConfig[riskLevel];

  return (
    <div className="rounded-[var(--radius-small)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-[24px]">
      <div className="flex items-center gap-[16px] mb-[16px]">
        <div
          className={`flex items-center justify-center w-[40px] h-[40px] rounded-full border ${vConfig.colorClass}`}
        >
          <span className="font-label-large">{vConfig.icon}</span>
        </div>
        <div className="flex flex-col gap-[4px]">
          <span className="font-title-medium text-[var(--color-text-primary)]">
            AI 분석 결과
          </span>
          <div className="flex items-center gap-[8px]">
            <span
              className={`inline-flex items-center px-[12px] py-[4px] rounded-[var(--radius-badge)] border font-label-medium ${vConfig.colorClass}`}
            >
              {vConfig.label}
            </span>
            <span
              className={`inline-flex items-center px-[12px] py-[4px] rounded-[var(--radius-badge)] font-label-medium ${rConfig.colorClass}`}
            >
              위험도: {rConfig.label}
            </span>
          </div>
        </div>
      </div>
      <p className="font-body-medium text-[var(--color-text-tertiary)]">{whySummary}</p>
    </div>
  );
}
