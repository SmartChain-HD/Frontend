import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useDiagnosticDetail,
  useDiagnosticHistory,
  useSubmitDiagnostic,
  useDeleteDiagnostic,
} from '../../src/hooks/useDiagnostics';
import { useAiResult } from '../../src/hooks/useAiRun';
import type { DiagnosticStatus, DomainCode, RiskLevel } from '../../src/types/api.types';
import { DOMAIN_LABELS, DIAGNOSTIC_STATUS_LABELS } from '../../src/types/api.types';
import type { AiAnalysisResultResponse, SlotResultDetail, CrossValidationResult } from '../../src/api/aiRun';
import DashboardLayout from '../../shared/layout/DashboardLayout';


type Verdict = 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';

const VERDICT_LABELS: Record<Verdict, string> = {
  PASS: '적합',
  WARN: '경고',
  NEED_CLARIFY: '확인 필요',
  NEED_FIX: '수정 필요',
};

// 슬롯 카드 배경 (연한 색)
const VERDICT_CARD_BG: Record<Verdict, React.CSSProperties> = {
  PASS: { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' },
  WARN: { backgroundColor: '#fef9c3', borderColor: '#fde047' },
  NEED_CLARIFY: { backgroundColor: '#fef9c3', borderColor: '#fde047' },
  NEED_FIX: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
};

// 슬롯 verdict 뱃지 (솔리드 색)
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

const STATUS_STYLES: Record<DiagnosticStatus, string> = {
  WRITING: 'bg-gray-50 text-gray-700 border-gray-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  RETURNED: 'bg-red-50 text-red-700 border-red-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REVIEWING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const TIMELINE_STATUS_CONFIG: Record<DiagnosticStatus, { iconBg: string; textColor: string; bgColor: string; borderColor: string }> = {
  WRITING: {
    iconBg: '#6b7280',
    textColor: '#374151',
    bgColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  SUBMITTED: {
    iconBg: '#2563eb',
    textColor: '#1d4ed8',
    bgColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  RETURNED: {
    iconBg: '#dc2626',
    textColor: '#b91c1c',
    bgColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  APPROVED: {
    iconBg: '#16a34a',
    textColor: '#15803d',
    bgColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  REVIEWING: {
    iconBg: '#ca8a04',
    textColor: '#a16207',
    bgColor: '#fef9c3',
    borderColor: '#fef08a',
  },
  COMPLETED: {
    iconBg: '#059669',
    textColor: '#047857',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
};

function StatusIcon({ status }: { status: DiagnosticStatus }) {
  const iconClass = "w-[16px] h-[16px] text-white";

  switch (status) {
    case 'WRITING':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    case 'SUBMITTED':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
    case 'RETURNED':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    case 'APPROVED':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'REVIEWING':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'COMPLETED':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function DiagnosticDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const diagnosticId = Number(id);

  const { data: diagnostic, isLoading, isError } = useDiagnosticDetail(diagnosticId);
  const { data: history } = useDiagnosticHistory(diagnosticId);
  const { data: aiResult } = useAiResult(diagnosticId);
  const submitMutation = useSubmitDiagnostic();
  const deleteMutation = useDeleteDiagnostic();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    submitMutation.mutate(
      {
        id: diagnosticId,
        data: {
          submitComment: comment || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowSubmitModal(false);
          setComment('');
        },
      }
    );
  };

  const handleDelete = () => {
    const domainCode = diagnostic?.domain?.code;
    deleteMutation.mutate(diagnosticId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        navigate(domainCode ? `/diagnostics?domainCode=${domainCode}` : '/diagnostics');
      },
    });
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
            기안 정보를 불러오는 데 실패했습니다.
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

  // ESG 도메인만 결재자 워크플로우 존재
  const hasApprovalWorkflow = diagnostic.domain?.code === 'ESG';
  const isSubmittableStatus = diagnostic.status === 'WRITING' || diagnostic.status === 'RETURNED';
  const canSubmit = isSubmittableStatus && !!aiResult;
  const canDelete = diagnostic.status === 'WRITING';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[900px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(diagnostic.domain?.code ? `/diagnostics?domainCode=${diagnostic.domain.code}` : '/diagnostics')}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>

        {/* 제목 + 상태 */}
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{diagnostic.title || diagnostic.summary || '제목 없음'}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[diagnostic.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {diagnostic.statusLabel || DIAGNOSTIC_STATUS_LABELS[diagnostic.status] || diagnostic.status}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">기안 정보</h2>
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="기안명" value={diagnostic.title || diagnostic.summary || '-'} />
            <InfoRow label="도메인" value={diagnostic.domain?.name || DOMAIN_LABELS[diagnostic.domain?.code as DomainCode] || '-'} />
            <InfoRow label="회사명" value={diagnostic.company?.companyName || '-'} />
            <InfoRow label="기안자" value={diagnostic.createdBy?.maskedName || '-'} />
            <InfoRow label="생성일" value={new Date(diagnostic.createdAt).toLocaleDateString('ko-KR')} />
            <InfoRow label="기안 시작일" value={diagnostic.period?.startDate ? new Date(diagnostic.period.startDate).toLocaleDateString('ko-KR') : '-'} />
            <InfoRow label="기안 종료일" value={diagnostic.period?.endDate ? new Date(diagnostic.period.endDate).toLocaleDateString('ko-KR') : '-'} />
            {diagnostic.submittedAt && (
              <InfoRow label="제출일" value={new Date(diagnostic.submittedAt).toLocaleDateString('ko-KR')} />
            )}
          </div>
        </div>

        {/* AI 분석 결과 */}
        {aiResult && (
          <AiResultSection result={aiResult} />
        )}

        {/* 이력 타임라인 */}
        {history && history.length > 0 && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[24px]">기안 이력</h2>
            <div className="max-h-[400px] overflow-y-auto pl-[20px] pr-[8px]">
            <ol className="relative border-l-[2px] border-[#e5e7eb]">
              {history.map((item, index) => {
                const isLatest = index === 0;
                const statusConfig = TIMELINE_STATUS_CONFIG[item.newStatus] || TIMELINE_STATUS_CONFIG.WRITING;

                return (
                  <li key={item.historyId} className={`ml-[24px] ${index !== history.length - 1 ? 'pb-[32px]' : ''}`}>
                    {/* 타임라인 아이콘 */}
                    <span
                      className="absolute flex items-center justify-center w-[32px] h-[32px] rounded-full -left-[17px]"
                      style={{ backgroundColor: statusConfig.iconBg, boxShadow: `0 0 0 4px white, 0 0 0 5px ${statusConfig.borderColor}` }}
                    >
                      <StatusIcon status={item.newStatus} />
                    </span>

                    {/* 날짜 뱃지 */}
                    <time className="inline-flex items-center px-[10px] py-[4px] mb-[8px] font-detail-small rounded-full"
                      style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}>
                      {new Date(item.timestamp).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>

                    {/* 상태 + 변경자 */}
                    <h3 className="flex items-center gap-[8px] mt-[8px] mb-[4px]">
                      <span className="font-title-small text-[var(--color-text-primary)]">
                        {DIAGNOSTIC_STATUS_LABELS[item.newStatus]}
                      </span>
                      {isLatest && (
                        <span className="px-[8px] py-[2px] font-label-xsmall font-semibold rounded-full bg-[#dbeafe] text-[#1d4ed8]">
                          최신
                        </span>
                      )}
                    </h3>
                    <p className="font-body-small text-[var(--color-text-secondary)] mb-[8px]">
                      {item.performedBy.name}
                      {item.performedBy.role && (
                        <span className="ml-[6px] text-[var(--color-text-tertiary)]">({{ DRAFTER: '기안자', APPROVER: '결재자', REVIEWER: '수신자' }[item.performedBy.role] || item.performedBy.role})</span>
                      )}
                    </p>

                    {/* 코멘트 */}
                    {item.comment && (
                      <div className="p-[16px] mt-[8px] rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb]">
                        <p className="font-body-medium text-[var(--color-text-primary)] leading-[1.6] whitespace-pre-wrap">
                          {item.comment}
                        </p>
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
            onClick={() => navigate(diagnostic.domain?.code ? `/diagnostics?domainCode=${diagnostic.domain.code}` : '/diagnostics')}
            className="flex items-center gap-[4px] px-[24px] py-[12px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            목록으로
          </button>
          <div className="flex gap-[12px]">
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-[24px] py-[12px] rounded-[8px] border border-[var(--color-state-error-icon)] font-title-small text-[var(--color-state-error-icon)] hover:bg-[var(--color-state-error-bg)] transition-colors"
              >
                삭제
              </button>
            )}
            <button
              onClick={() => navigate(`/diagnostics/${diagnosticId}/files`)}
              className="px-[24px] py-[12px] rounded-[8px] border border-[var(--color-primary-main)] font-title-small text-[var(--color-primary-main)] hover:bg-blue-50 transition-colors"
            >
              파일 관리 및 AI 분석
            </button>
            {isSubmittableStatus && (
              <div className="relative group">
                <button
                  onClick={canSubmit ? () => setShowSubmitModal(true) : undefined}
                  disabled={!canSubmit}
                  className={`px-[24px] py-[12px] rounded-[8px] font-title-small transition-colors ${
                    canSubmit
                      ? 'bg-[var(--color-primary-main)] text-white hover:opacity-90 cursor-pointer'
                      : 'bg-[var(--color-primary-main)]/40 text-white cursor-not-allowed'
                  }`}
                >
                  {hasApprovalWorkflow ? '결재자에게 제출' : '수신자에게 제출'}
                </button>
                {!canSubmit && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[8px] px-[12px] py-[8px] bg-[var(--color-text-primary)] text-white font-body-small rounded-[8px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                    AI 분석을 완료해야 제출할 수 있습니다
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[var(--color-text-primary)]" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 제출 모달 */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[480px] mx-[16px] shadow-xl">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                기안 제출
              </h2>
            </div>

            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              <p className="font-body-medium text-[var(--color-text-secondary)]">
                {hasApprovalWorkflow ? '기안을 결재자에게 제출하시겠습니까?' : '기안을 수신자에게 제출하시겠습니까?'}
              </p>

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
                onClick={() => { setShowSubmitModal(false); setComment(''); }}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] font-title-small text-white hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {submitMutation.isPending ? '제출 중...' : '제출'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[400px] mx-[16px] shadow-xl">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                기안 삭제
              </h2>
            </div>

            <div className="px-[24px] py-[20px]">
              <p className="font-body-medium text-[var(--color-text-primary)]">
                이 기안을 삭제하시겠습니까? 삭제된 기안은 복구할 수 없습니다.
              </p>
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-state-error-icon)] font-title-small text-white hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
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
        {/* 슬롯별 결과 */}
        {details?.slot_results && details.slot_results.length > 0 && (
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[12px]">
              슬롯별 분석 결과
            </p>
            <div className="space-y-[12px]">
              {details.slot_results.map((slotResult, index) => {
                const clarification = details.clarifications?.find(
                  (c) => c.slot_name === slotResult.slot_name
                );
                return (
                  <SlotResultCard
                    key={index}
                    result={slotResult}
                    clarificationMessage={clarification?.message}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 교차검증 결과 */}
        {details?.crossValidations && details.crossValidations.length > 0 && (
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[12px]">
              교차검증 결과
            </p>
            <div className="space-y-[12px]">
              {details.crossValidations.map((cv, index) => (
                <CrossValidationCard key={index} result={cv} />
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

function CrossValidationCard({ result }: { result: CrossValidationResult }) {
  const verdict = result.verdict as Verdict;
  const title = result.displayNames.join(' × ');

  return (
    <div className="rounded-[12px] border overflow-hidden" style={VERDICT_CARD_BG[verdict]}>
      <div className="flex items-center px-[20px] py-[16px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px]">
            <svg className="w-[16px] h-[16px] text-[var(--color-text-tertiary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="font-title-medium text-[var(--color-text-primary)]">
              {title}
            </span>
          </div>
        </div>
        <span
          className="px-[20px] py-[8px] rounded-[8px] font-title-medium flex-shrink-0 ml-[16px]"
          style={VERDICT_BADGE[verdict]}
        >
          {VERDICT_LABELS[verdict]}
        </span>
      </div>
      {(() => {
        const summaryText = verdict === 'PASS'
          ? (result.extras?.success_points as string | undefined)
          : (result.extras?.issue_points as string | undefined);
        return summaryText ? (
          <div className="px-[20px] pb-[16px]">
            <p className="font-body-small text-[var(--color-text-secondary)] leading-[1.6] whitespace-pre-line">{summaryText}</p>
          </div>
        ) : null;
      })()}
    </div>
  );
}

function SlotResultCard({ result, clarificationMessage }: { result: SlotResultDetail; clarificationMessage?: string }) {
  const verdict = result.verdict as Verdict;
  const displayName = result.display_name || result.slot_name;
  const strippedMessage = clarificationMessage?.replace(/^안녕하세요[^\n]*\n\n/, '').trim();
  const [clarifyOpen, setClarifyOpen] = useState(false);

  return (
    <div className="rounded-[12px] border overflow-hidden" style={VERDICT_CARD_BG[verdict]}>
      <div className="flex items-center px-[20px] py-[16px]">
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
      </div>
      {(() => {
        const summaryText = verdict === 'PASS'
          ? result.extras?.success_points
          : result.extras?.issue_points;
        return summaryText ? (
          <div className="px-[20px] pb-[16px]">
            <p className="font-body-small text-[var(--color-text-secondary)] leading-[1.6] whitespace-pre-line">{summaryText}</p>
          </div>
        ) : null;
      })()}
      {strippedMessage && (
        <div className="border-t border-[var(--color-border-default)]">
          <button
            type="button"
            onClick={() => setClarifyOpen(prev => !prev)}
            className="flex items-center gap-[6px] w-full px-[20px] py-[10px] font-label-small text-[var(--color-state-warning-text)] hover:bg-black/[0.03] transition-colors"
          >
            <svg
              className={`w-[14px] h-[14px] flex-shrink-0 transition-transform ${clarifyOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            보완 요청 사항
          </button>
          {clarifyOpen && (
            <div className="px-[20px] pb-[16px]">
              <p className="font-body-small text-[var(--color-state-warning-text)] leading-[1.6] whitespace-pre-line">
                {strippedMessage}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
