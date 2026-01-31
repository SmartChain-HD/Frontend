import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useDiagnosticDetail,
  useDiagnosticHistory,
  useSubmitDiagnostic,
} from '../../src/hooks/useDiagnostics';
import type { DiagnosticStatus, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  WRITING: '작성중',
  SUBMITTED: '제출됨',
  RETURNED: '반려됨',
  APPROVED: '승인됨',
  REVIEWING: '심사중',
  COMPLETED: '완료',
};

const STATUS_STYLES: Record<DiagnosticStatus, string> = {
  WRITING: 'bg-gray-50 text-gray-700 border-gray-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  RETURNED: 'bg-red-50 text-red-700 border-red-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REVIEWING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function DiagnosticDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const diagnosticId = Number(id);

  const { data: diagnostic, isLoading, isError } = useDiagnosticDetail(diagnosticId);
  const { data: history } = useDiagnosticHistory(diagnosticId);
  const submitMutation = useSubmitDiagnostic();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approverId, setApproverId] = useState<number | ''>('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!approverId) return;
    submitMutation.mutate(
      {
        id: diagnosticId,
        data: {
          approverId: Number(approverId),
          comment: comment || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowSubmitModal(false);
          setApproverId('');
          setComment('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-[120px]">
          <div className="w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !diagnostic) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <p className="font-body-medium text-[var(--color-state-error-text)]">
            진단 정보를 불러오는 데 실패했습니다.
          </p>
          <button
            onClick={() => navigate('/diagnostics')}
            className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const canSubmit = diagnostic.status === 'WRITING' || diagnostic.status === 'RETURNED';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[900px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/diagnostics')}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>

        {/* 제목 + 상태 */}
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{diagnostic.title}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[diagnostic.status]}`}>
            {STATUS_LABELS[diagnostic.status]}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">진단 정보</h2>
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="도메인" value={DOMAIN_LABELS[diagnostic.domainCode as DomainCode] || diagnostic.domainCode} />
            <InfoRow label="회사명" value={diagnostic.company.companyName} />
            <InfoRow label="기안자" value={diagnostic.drafter.name} />
            <InfoRow label="생성일" value={new Date(diagnostic.createdAt).toLocaleDateString('ko-KR')} />
            <InfoRow label="진단 시작일" value={new Date(diagnostic.periodStartDate).toLocaleDateString('ko-KR')} />
            <InfoRow label="진단 종료일" value={new Date(diagnostic.periodEndDate).toLocaleDateString('ko-KR')} />
            {diagnostic.submittedAt && (
              <InfoRow label="제출일" value={new Date(diagnostic.submittedAt).toLocaleDateString('ko-KR')} />
            )}
          </div>
        </div>

        {/* 이력 */}
        {history && history.length > 0 && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">진단 이력</h2>
            <div className="space-y-[16px]">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-[12px] pb-[16px] border-b border-[var(--color-border-default)] last:border-b-0 last:pb-0"
                >
                  <span className={`shrink-0 inline-block px-[8px] py-[2px] rounded-full font-title-xsmall border ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-medium text-[var(--color-text-primary)]">
                      {item.changedBy}
                    </p>
                    {item.comment && (
                      <p className="font-body-small text-[var(--color-text-tertiary)] mt-[4px]">
                        {item.comment}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-body-small text-[var(--color-text-tertiary)]">
                    {new Date(item.changedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-[12px]">
          <button
            onClick={() => navigate(`/diagnostics/${diagnosticId}/files`)}
            className="px-[24px] py-[12px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
          >
            파일 관리
          </button>
          {canSubmit && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-[24px] py-[12px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
            >
              결재자에게 제출
            </button>
          )}
        </div>
      </div>

      {/* 제출 모달 */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[480px] mx-[16px] shadow-xl">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                진단 제출
              </h2>
            </div>

            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                  결재자 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={approverId}
                  onChange={(e) => setApproverId(e.target.value ? Number(e.target.value) : '')}
                  placeholder="결재자 ID를 입력하세요"
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>

              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                  코멘트 (선택)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="코멘트를 입력하세요"
                  rows={3}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => { setShowSubmitModal(false); setApproverId(''); setComment(''); }}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!approverId || submitMutation.isPending}
                className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] font-title-small text-white hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {submitMutation.isPending ? '제출 중...' : '제출'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div>
      <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">{label}</p>
      <p className={`font-body-medium ${valueClassName || 'text-[var(--color-text-primary)]'}`}>{value}</p>
    </div>
  );
}
