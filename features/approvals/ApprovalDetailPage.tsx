import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApprovalDetail, useProcessApproval, useSubmitToReviewer } from '../../src/hooks/useApprovals';
import { useAiResult } from '../../src/hooks/useAiRun';
import { useDiagnosticHistory } from '../../src/hooks/useDiagnostics';
import type { ApprovalStatus, DomainCode, RiskLevel, DiagnosticStatus } from '../../src/types/api.types';
import { DOMAIN_LABELS, DIAGNOSTIC_STATUS_LABELS } from '../../src/types/api.types';
import { handleApiError } from '../../src/utils/errorHandler';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../src/types/api.types';
import type { AiAnalysisResultResponse, SlotResultDetail } from '../../src/api/aiRun';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { REASON_LABELS } from '../../src/constants/reasonLabels';

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  WAITING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  WAITING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

type Verdict = 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';

const VERDICT_LABELS: Record<Verdict, string> = {
  PASS: '적합',
  WARN: '경고',
  NEED_CLARIFY: '확인 필요',
  NEED_FIX: '수정 필요',
};

const VERDICT_CARD_BG: Record<Verdict, React.CSSProperties> = {
  PASS: { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' },
  WARN: { backgroundColor: '#fef9c3', borderColor: '#fde047' },
  NEED_CLARIFY: { backgroundColor: '#fef9c3', borderColor: '#fde047' },
  NEED_FIX: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
};

const VERDICT_BADGE: Record<Verdict, React.CSSProperties> = {
  PASS: { backgroundColor: '#22c55e', color: '#fff' },
  WARN: { backgroundColor: '#eab308', color: '#fff' },
  NEED_CLARIFY: { backgroundColor: '#eab308', color: '#fff' },
  NEED_FIX: { backgroundColor: '#ef4444', color: '#fff' },
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: '낮음',
  MEDIUM: '중간',
  HIGH: '높음',
};

const RISK_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-[#dcfce7] text-[#15803d]',
  MEDIUM: 'bg-[#fef9c3] text-[#a16207]',
  HIGH: 'bg-[#fee2e2] text-[#dc2626]',
};

const DOMAIN_TO_LIST: Record<string, string> = {
  SAFETY: '/diagnostics?domainCode=SAFETY',
  ESG: '/diagnostics?domainCode=ESG',
  COMPLIANCE: '/diagnostics?domainCode=COMPLIANCE',
};

const TIMELINE_STATUS_CONFIG: Record<DiagnosticStatus, { iconBg: string; textColor: string; bgColor: string; borderColor: string }> = {
  WRITING: { iconBg: '#6b7280', textColor: '#374151', bgColor: '#f3f4f6', borderColor: '#e5e7eb' },
  SUBMITTED: { iconBg: '#2563eb', textColor: '#1d4ed8', bgColor: '#dbeafe', borderColor: '#bfdbfe' },
  RETURNED: { iconBg: '#dc2626', textColor: '#b91c1c', bgColor: '#fee2e2', borderColor: '#fecaca' },
  APPROVED: { iconBg: '#16a34a', textColor: '#15803d', bgColor: '#dcfce7', borderColor: '#bbf7d0' },
  REVIEWING: { iconBg: '#ca8a04', textColor: '#a16207', bgColor: '#fef9c3', borderColor: '#fef08a' },
  COMPLETED: { iconBg: '#059669', textColor: '#047857', bgColor: '#d1fae5', borderColor: '#a7f3d0' },
};

function TimelineIcon({ status }: { status: DiagnosticStatus }) {
  const iconClass = "w-[14px] h-[14px] text-white";
  switch (status) {
    case 'WRITING':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
    case 'SUBMITTED':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
    case 'RETURNED':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
    case 'APPROVED':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
    case 'REVIEWING':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
    case 'COMPLETED':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    default:
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
}

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const approvalId = Number(id);

  const { data: approval, isLoading, isError, error } = useApprovalDetail(approvalId);
  const diagnosticId = approval?.diagnostic?.diagnosticId ?? 0;
  const { data: aiResult } = useAiResult(diagnosticId);
  const { data: history } = useDiagnosticHistory(diagnosticId);
  const processApprovalMutation = useProcessApproval();
  const submitToReviewerMutation = useSubmitToReviewer();

  useEffect(() => {
    if (error) {
      handleApiError(error as AxiosError<ErrorResponse>);
    }
  }, [error]);

  const [showModal, setShowModal] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [comment, setComment] = useState('');

  const handleProcess = () => {
    if (!showModal) return;
    // 반려 시 코멘트 필수
    if (showModal === 'REJECTED' && !comment.trim()) return;

    const decision = showModal;
    const listPath = approval?.domainCode ? DOMAIN_TO_LIST[approval.domainCode] || '/dashboard' : '/dashboard';

    processApprovalMutation.mutate(
      {
        id: approvalId,
        data: {
          decision,
          comment: comment || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowModal(null);
          setComment('');

          if (decision === 'APPROVED') {
            // 승인인 경우 자동으로 원청에 제출
            submitToReviewerMutation.mutate(approvalId, {
              onSuccess: () => {
                navigate(listPath);
              },
              onError: () => {
                toast.error('승인은 완료되었으나 원청 제출에 실패했습니다. 다시 시도해주세요.');
              },
            });
          } else {
            // 반려인 경우 목록으로 이동
            navigate(listPath);
          }
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

  if (isError || !approval) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <p className="font-body-medium text-[var(--color-state-error-text)]">
            결재 정보를 불러오는 데 실패했습니다.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isWaiting = approval.status === 'WAITING';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[900px] mx-auto w-full">
        {/* 뒤로가기 - 도메인별 대시보드로 이동 */}
        <button
          onClick={() => navigate(approval.domainCode ? DOMAIN_TO_LIST[approval.domainCode] || '/dashboard' : '/dashboard')}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>

        {/* 제목 + 상태 */}
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{approval.diagnostic?.title || '-'}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[approval.status]}`}>
            {approval.statusLabel || STATUS_LABELS[approval.status]}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="도메인" value={approval.domainName || DOMAIN_LABELS[approval.domainCode as DomainCode] || approval.domainCode} />
            <InfoRow label="기안코드" value={approval.diagnostic?.diagnosticCode || '-'} />
            <InfoRow label="기안자" value={approval.requester?.maskedName || '-'} />
            <InfoRow label="기안자 이메일" value={approval.requester?.email || '-'} />
            <InfoRow label="요청일" value={approval.requestedAt ? new Date(approval.requestedAt).toLocaleDateString('ko-KR') : '-'} />
            {approval.processedAt && (
              <InfoRow label="처리일" value={new Date(approval.processedAt).toLocaleDateString('ko-KR')} />
            )}
          </div>

          {approval.requestComment && (
            <div className="mt-[20px] pt-[20px] border-t border-[var(--color-border-default)]">
              <p className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px]">요청 코멘트</p>
              <p className="font-body-medium text-[var(--color-text-primary)] whitespace-pre-wrap">{approval.requestComment}</p>
            </div>
          )}

          {approval.approverComment && (
            <div className="mt-[20px] pt-[20px] border-t border-[var(--color-border-default)]">
              <p className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px]">결재자 코멘트</p>
              <p className="font-body-medium text-[var(--color-text-primary)] whitespace-pre-wrap">{approval.approverComment}</p>
            </div>
          )}
        </div>

        {/* AI 분석 결과 */}
        {aiResult && (
          <AiResultSection result={aiResult} />
        )}

        {/* 기안 이력 타임라인 */}
        {history && history.length > 0 && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">기안 이력</h2>
            <div className="max-h-[400px] overflow-y-auto pl-[18px] pr-[8px]">
            <ol className="relative border-l-[2px] border-[#e5e7eb]">
              {history.map((item, index) => {
                const isLatest = index === 0;
                const statusConfig = TIMELINE_STATUS_CONFIG[item.newStatus] || TIMELINE_STATUS_CONFIG.WRITING;
                return (
                  <li key={item.historyId} className={`ml-[20px] ${index !== history.length - 1 ? 'pb-[24px]' : ''}`}>
                    <span
                      className="absolute flex items-center justify-center w-[28px] h-[28px] rounded-full -left-[15px]"
                      style={{ backgroundColor: statusConfig.iconBg, boxShadow: `0 0 0 3px white, 0 0 0 4px ${statusConfig.borderColor}` }}
                    >
                      <TimelineIcon status={item.newStatus} />
                    </span>
                    <time className="inline-flex items-center px-[8px] py-[3px] mb-[6px] font-label-xsmall rounded-full"
                      style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}>
                      {new Date(item.timestamp).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                    <h3 className="flex items-center gap-[6px] mt-[6px] mb-[2px]">
                      <span className="font-title-small text-[var(--color-text-primary)]">{DIAGNOSTIC_STATUS_LABELS[item.newStatus]}</span>
                      {isLatest && <span className="px-[6px] py-[1px] font-label-xsmall font-semibold rounded-full bg-[#dbeafe] text-[#1d4ed8]">최신</span>}
                    </h3>
                    <p className="font-body-small text-[var(--color-text-secondary)]">{item.performedBy.name}</p>
                    {item.comment && (
                      <div className="p-[12px] mt-[8px] rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb]">
                        <p className="font-body-small text-[var(--color-text-primary)] whitespace-pre-wrap">{item.comment}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(approval.domainCode ? DOMAIN_TO_LIST[approval.domainCode] || '/dashboard' : '/dashboard')}
            className="flex items-center gap-[4px] px-[24px] py-[12px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            목록으로
          </button>
          {isWaiting && (
            <div className="flex gap-[12px]">
              <button
                onClick={() => setShowModal('REJECTED')}
                className="px-[24px] py-[12px] rounded-[8px] border border-red-300 text-red-600 font-title-small hover:bg-red-50 transition-colors"
              >
                반려
              </button>
              <button
                onClick={() => setShowModal('APPROVED')}
                className="px-[24px] py-[12px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
              >
                원청에 제출
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 승인/반려 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[480px] mx-[16px] shadow-xl">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                {showModal === 'APPROVED' ? '원청에 제출' : '결재 반려'}
              </h2>
              {showModal === 'APPROVED' && (
                <p className="font-body-small text-[var(--color-text-tertiary)] mt-[4px]">
                  승인 후 자동으로 원청에 제출됩니다.
                </p>
              )}
            </div>

            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                  {showModal === 'REJECTED' ? (
                    <>반려 사유 <span className="text-[#dc2626]">*</span></>
                  ) : (
                    '코멘트 (선택)'
                  )}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={showModal === 'REJECTED' ? '반려 사유를 입력하세요' : '코멘트를 입력하세요'}
                  rows={4}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => { setShowModal(null); setComment(''); }}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleProcess}
                disabled={processApprovalMutation.isPending || submitToReviewerMutation.isPending || (showModal === 'REJECTED' && !comment.trim())}
                className={`px-[20px] py-[10px] rounded-[8px] font-title-small text-white transition-colors disabled:opacity-50 ${
                  showModal === 'APPROVED'
                    ? 'bg-[var(--color-primary-main)] hover:opacity-90'
                    : 'bg-[#dc2626] hover:bg-[#b91c1c]'
                }`}
              >
                {processApprovalMutation.isPending || submitToReviewerMutation.isPending
                  ? '처리 중...'
                  : showModal === 'APPROVED' ? '원청에 제출' : '반려'}
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

function AiResultSection({ result }: { result: AiAnalysisResultResponse }) {
  const verdict = result.verdict as Verdict;
  const riskLevel = result.riskLevel as RiskLevel;
  const details = result.details;

  return (
    <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
      <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
        <h2 className="font-title-medium text-[var(--color-text-primary)]">
          AI 분석 결과
        </h2>
      </div>

      <div className="p-[24px] space-y-[24px]">
        {/* 판정 결과 */}
        <div className="flex items-center gap-[16px]">
          <div className="px-[20px] py-[12px] rounded-[8px]" style={VERDICT_BADGE[verdict]}>
            <span className="font-heading-small">{VERDICT_LABELS[verdict]}</span>
          </div>
          <div className={`px-[14px] py-[8px] rounded-full ${RISK_STYLES[riskLevel]}`}>
            <span className="font-title-small font-semibold">위험도: {RISK_LABELS[riskLevel]}</span>
          </div>
        </div>

        {/* 요약 */}
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">분석 요약</p>
          <p className="font-body-medium text-[var(--color-text-primary)] leading-[1.6]">
            {result.whySummary}
          </p>
        </div>

        {/* 슬롯별 결과 */}
        {details?.slot_results && details.slot_results.length > 0 && (
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[12px]">
              슬롯별 분석 결과
            </p>
            <div className="space-y-[12px]">
              {details.slot_results.map((slotResult, index) => (
                <SlotResultCard key={index} result={slotResult} />
              ))}
            </div>
          </div>
        )}

        {/* 분석 정보 */}
        <div className="grid grid-cols-2 gap-[16px] pt-[16px] border-t border-[var(--color-border-default)]">
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">도메인</p>
            <p className="font-body-medium text-[var(--color-text-primary)]">
              {DOMAIN_LABELS[result.domainCode as DomainCode] || result.domainCode}
            </p>
          </div>
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">분석 일시</p>
            <p className="font-body-medium text-[var(--color-text-primary)]">
              {new Date(result.analyzedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotResultCard({ result }: { result: SlotResultDetail }) {
  const verdict = result.verdict as Verdict;
  const displayName = result.display_name || result.slot_name;
  const hasReasons = result.reasons && result.reasons.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[12px] border overflow-hidden" style={VERDICT_CARD_BG[verdict]}>
      <div
        className={`flex items-center px-[20px] py-[16px] ${hasReasons ? 'cursor-pointer' : ''}`}
        onClick={() => hasReasons && setOpen(prev => !prev)}
      >
        <div className="flex-1 min-w-0">
          <span className="font-title-medium text-[var(--color-text-primary)]">
            {displayName}
          </span>
          {result.file_names && result.file_names.length > 0 && (
            <p className="font-body-small text-[var(--color-text-tertiary)] mt-[4px] truncate">
              {result.file_names.join(', ')}
            </p>
          )}
        </div>
        <span
          className="px-[20px] py-[8px] rounded-[8px] font-title-medium flex-shrink-0 ml-[16px]"
          style={VERDICT_BADGE[verdict]}
        >
          {VERDICT_LABELS[verdict]}
        </span>
        {hasReasons && (
          <svg
            className={`w-[20px] h-[20px] ml-[8px] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      {hasReasons && open && (
        <div className="px-[20px] pb-[16px]">
          <ul className="space-y-[6px]">
            {result.reasons!.map((reason, index) => (
              <li key={index} className="flex items-start gap-[8px] font-body-small text-[var(--color-text-secondary)]">
                <span className="w-[4px] h-[4px] bg-gray-500 rounded-full mt-[8px] flex-shrink-0" />
                {REASON_LABELS[reason] || reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
