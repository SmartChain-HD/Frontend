import type { Clarification } from './types';

interface ClarificationListProps {
  clarifications: Clarification[];
  onReupload?: (slotName: string, fileIds: string[]) => void;
}

export function ClarificationList({ clarifications, onReupload }: ClarificationListProps) {
  if (clarifications.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <h3 className="font-title-small text-[var(--color-text-primary)]">보완 요청 사항</h3>
      <div className="flex flex-col gap-[8px]">
        {clarifications.map((item, index) => (
          <div
            key={`${item.slotName}-${index}`}
            className="rounded-[var(--radius-small)] border border-[var(--color-state-warning-border)] bg-[var(--color-state-warning-bg)] p-[16px]"
          >
            <div className="flex items-start justify-between gap-[16px]">
              <div className="flex-1">
                <div className="flex items-center gap-[8px] mb-[8px]">
                  <span className="font-label-large text-[var(--color-state-warning-icon)]">?</span>
                  <span className="font-title-small text-[var(--color-state-warning-text)]">
                    {item.slotName}
                  </span>
                </div>
                <p className="font-body-small text-[var(--color-state-warning-text)]">
                  {item.message}
                </p>
              </div>
              {item.fileIds.length > 0 && onReupload && (
                <button
                  type="button"
                  onClick={() => onReupload(item.slotName, item.fileIds)}
                  className="flex items-center gap-[4px] px-[12px] py-[8px] rounded-[var(--radius-small)] bg-[var(--color-surface-default)] border border-[var(--color-state-warning-border)] font-label-small text-[var(--color-state-warning-text)] hover:bg-[var(--color-state-warning-border)] transition-colors whitespace-nowrap"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  파일 재업로드
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
