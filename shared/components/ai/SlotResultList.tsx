import type { SlotResult, Verdict } from './types';

interface SlotResultListProps {
  slotResults: SlotResult[];
  onFileClick?: (fileId: string) => void;
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

export function SlotResultList({ slotResults, onFileClick }: SlotResultListProps) {
  if (slotResults.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <h3 className="font-title-small text-[var(--color-text-primary)]">슬롯별 검증 결과</h3>
      <div className="flex flex-col gap-[8px]">
        {slotResults.map((slot, index) => {
          const vConfig = verdictConfig[slot.verdict];
          return (
            <div
              key={`${slot.slotName}-${index}`}
              className={`rounded-[var(--radius-small)] border p-[16px] ${vConfig.colorClass}`}
            >
              <div className="flex items-center justify-between mb-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="font-label-large">{vConfig.icon}</span>
                  <span className="font-title-small">{slot.slotName}</span>
                </div>
                <span
                  className={`inline-flex items-center px-[8px] py-[2px] rounded-[var(--radius-badge)] font-label-small border ${vConfig.colorClass}`}
                >
                  {vConfig.label}
                </span>
              </div>
              {slot.reasons.length > 0 && (
                <ul className="list-disc list-inside mb-[8px] font-body-small">
                  {slot.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              )}
              {slot.fileNames.length > 0 && (
                <div className="flex flex-wrap gap-[8px]">
                  {slot.fileNames.map((fileName, idx) => (
                    <button
                      key={slot.fileIds[idx]}
                      type="button"
                      onClick={() => onFileClick?.(slot.fileIds[idx])}
                      className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-[var(--radius-small)] bg-[var(--color-surface-default)] border border-[var(--color-border-default)] font-label-small text-[var(--color-text-tertiary)] hover:border-[var(--color-primary-border)] transition-colors"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {fileName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
