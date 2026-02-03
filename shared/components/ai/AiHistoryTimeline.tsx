import type { AiHistoryEntry, Verdict, RiskLevel } from './types';

interface AiHistoryTimelineProps {
  history: AiHistoryEntry[];
  onSelect?: (entry: AiHistoryEntry) => void;
  selectedId?: string;
}

const verdictConfig: Record<Verdict, { label: string; dotColor: string; textColor: string }> = {
  PASS: {
    label: '통과',
    dotColor: 'bg-[var(--color-state-success-icon)]',
    textColor: 'text-[var(--color-state-success-text)]',
  },
  WARN: {
    label: '주의',
    dotColor: 'bg-[var(--color-state-warning-icon)]',
    textColor: 'text-[var(--color-state-warning-text)]',
  },
  NEED_CLARIFY: {
    label: '보완 필요',
    dotColor: 'bg-[var(--color-state-warning-icon)]',
    textColor: 'text-[var(--color-state-warning-text)]',
  },
  NEED_FIX: {
    label: '수정 필요',
    dotColor: 'bg-[var(--color-state-error-icon)]',
    textColor: 'text-[var(--color-state-error-text)]',
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AiHistoryTimeline({ history, onSelect, selectedId }: AiHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-[24px] text-[var(--color-text-secondary)] font-body-medium">
        분석 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <h3 className="font-title-small text-[var(--color-text-primary)]">AI 분석 이력</h3>
      <div className="relative">
        <div className="absolute left-[11px] top-[24px] bottom-[24px] w-[2px] bg-[var(--color-border-default)]" />
        <div className="flex flex-col gap-[4px]">
          {history.map((entry, index) => {
            const vConfig = verdictConfig[entry.verdict];
            const rConfig = riskConfig[entry.riskLevel];
            const isSelected = selectedId === entry.id;
            const isLatest = index === 0;

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect?.(entry)}
                className={`relative flex items-start gap-[16px] p-[12px] rounded-[var(--radius-small)] text-left transition-colors ${
                  isSelected
                    ? 'bg-[var(--color-surface-primary)] border border-[var(--color-primary-border)]'
                    : 'hover:bg-[var(--color-page-bg)] border border-transparent'
                }`}
              >
                <div
                  className={`relative z-10 w-[24px] h-[24px] rounded-full flex items-center justify-center ${vConfig.dotColor}`}
                >
                  <div className="w-[12px] h-[12px] rounded-full bg-[var(--color-surface-default)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    <span className={`font-label-medium ${vConfig.textColor}`}>
                      {vConfig.label}
                    </span>
                    <span
                      className={`inline-flex items-center px-[6px] py-[2px] rounded-[var(--radius-badge)] font-label-xsmall ${rConfig.colorClass}`}
                    >
                      {rConfig.label}
                    </span>
                    {isLatest && (
                      <span className="inline-flex items-center px-[6px] py-[2px] rounded-[var(--radius-badge)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)] font-label-xsmall">
                        최신
                      </span>
                    )}
                  </div>
                  <p className="font-body-small text-[var(--color-text-tertiary)] truncate">
                    {entry.whySummary}
                  </p>
                  <span className="font-detail-small text-[var(--color-text-secondary)]">
                    {formatDate(entry.analyzedAt)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
