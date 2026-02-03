import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useDiagnosticDetail,
  useDiagnosticHistory,
  useSubmitDiagnostic,
} from '../../src/hooks/useDiagnostics';
import {
  useAiPreview,
  useSubmitAiRun,
  useAiResultDetail,
  useAiHistory,
} from '../../src/hooks/useAiRun';
import { parseAiJobError } from '../../src/hooks/useAiJobs';
import type { DiagnosticStatus, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import { handleApiError } from '../../src/utils/errorHandler';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../src/types/api.types';
import type { SlotStatus } from '../../src/api/aiRun';
import {
  AiResultSummary,
  SlotResultList,
  ClarificationList,
  AiHistoryTimeline,
  AiJobErrorHandler,
  AiServiceFallback,
} from '../../shared/components/ai';
import type { SlotResult, Clarification, AiHistoryEntry } from '../../shared/components/ai';
import { AiJobProgress } from '../../src/shared/components/ai/AiJobProgress';
import { AiJobNotification } from '../../src/shared/components/ai/AiJobNotification';
import type { JobStatus } from '../../src/api/aiJobs';
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

  const { data: diagnostic, isLoading, isError, error } = useDiagnosticDetail(diagnosticId);
  const { data: history } = useDiagnosticHistory(diagnosticId);
  const submitMutation = useSubmitDiagnostic();

  useEffect(() => {
    if (error) {
      handleApiError(error as AxiosError<ErrorResponse>);
    }
  }, [error]);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approverId, setApproverId] = useState<number | ''>('');
  const [comment, setComment] = useState('');

  // AI 분석 상태
  const previewMutation = useAiPreview();
  const submitAiMutation = useSubmitAiRun();
  const { data: aiResultDetail, isLoading: isDetailLoading, refetch: refetchDetail } = useAiResultDetail(diagnosticId);
  const { data: aiHistory } = useAiHistory(diagnosticId);
  const [aiJobStatus, setAiJobStatus] = useState<JobStatus | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<AxiosError<ErrorResponse> | null>(null);

  // preview 호출
  useEffect(() => {
    if (diagnosticId > 0) {
      previewMutation.mutate({ diagnosticId, fileIds: [] });
    }
  }, [diagnosticId]);

  // 분석 중 폴링: result가 도착하면 완료 처리
  useEffect(() => {
    if (aiJobStatus === 'RUNNING' && aiResultDetail) {
      setAiJobStatus('SUCCEEDED');
    }
  }, [aiResultDetail, aiJobStatus]);

  const handleSubmitAi = () => {
    setAiJobStatus('PENDING');
    setAiAnalysisError(null);
    submitAiMutation.mutate(diagnosticId, {
      onSuccess: () => {
        setAiJobStatus('RUNNING');
        refetchDetail();
      },
      onError: (err) => {
        setAiJobStatus('FAILED');
        setAiAnalysisError(err as AxiosError<ErrorResponse>);
      },
    });
  };

  const handleRetryAi = () => {
    setAiAnalysisError(null);
    handleSubmitAi();
  };

  const isServiceUnavailable = aiAnalysisError
    ? parseAiJobError(aiAnalysisError).type === 'SERVICE_UNAVAILABLE'
    : false;

  const previewData = previewMutation.data;
  const hasMissingRequired = previewData?.missingRequiredSlots && previewData.missingRequiredSlots.length > 0;
  const isAiRunning = aiJobStatus === 'PENDING' || aiJobStatus === 'RUNNING';

  // result detail → shared component 타입 변환
  const slotResults: SlotResult[] = (aiResultDetail?.slotResults ?? []).map((s) => ({
    slotName: s.slotName,
    verdict: s.status === 'VALID' ? 'PASS' : s.status === 'INVALID' ? 'NEED_FIX' : 'WARN',
    reasons: s.message ? [s.message] : [],
    fileIds: [],
    fileNames: [],
  }));

  const clarifications: Clarification[] = (aiResultDetail?.clarifications ?? []).map((c) => ({
    slotName: c.targetSlot,
    message: c.message,
    fileIds: [],
  }));

  const historyEntries: AiHistoryEntry[] = (aiHistory ?? []).map((h) => ({
    id: String(h.resultId),
    verdict: h.verdict as AiHistoryEntry['verdict'],
    riskLevel: h.riskLevel as AiHistoryEntry['riskLevel'],
    whySummary: h.whySummary,
    analyzedAt: h.analyzedAt,
  }));

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
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{diagnostic.campaign?.title || diagnostic.diagnosticCode}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[diagnostic.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {diagnostic.statusLabel || STATUS_LABELS[diagnostic.status] || diagnostic.status}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">기안 정보</h2>
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="도메인" value={diagnostic.domain?.name || DOMAIN_LABELS[diagnostic.domain?.code as DomainCode] || '-'} />
            <InfoRow label="회사명" value={diagnostic.company?.companyName || '-'} />
            <InfoRow label="기안자" value={diagnostic.createdBy?.name || '-'} />
            <InfoRow label="생성일" value={new Date(diagnostic.createdAt).toLocaleDateString('ko-KR')} />
            <InfoRow label="기안 시작일" value={diagnostic.period?.startDate ? new Date(diagnostic.period.startDate).toLocaleDateString('ko-KR') : '-'} />
            <InfoRow label="기안 종료일" value={diagnostic.period?.endDate ? new Date(diagnostic.period.endDate).toLocaleDateString('ko-KR') : '-'} />
            {diagnostic.submittedAt && (
              <InfoRow label="제출일" value={new Date(diagnostic.submittedAt).toLocaleDateString('ko-KR')} />
            )}
          </div>
        </div>

        {/* 이력 */}
        {history && history.length > 0 && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">기안 이력</h2>
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
            className="px-[24px] py-[12px] rounded-[8px] border border-[var(--color-primary-main)] font-title-small text-[var(--color-primary-main)] hover:bg-blue-50 transition-colors"
          >
            파일 관리
          </button>
          <button
            onClick={() => navigate(`/diagnostics/${diagnosticId}/ai-analysis`)}
            className="px-[24px] py-[12px] rounded-[8px] border border-[var(--color-primary-main)] font-title-small text-[var(--color-primary-main)] hover:bg-blue-50 transition-colors"
          >
            AI 분석 상세
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

        {/* AI 분석 섹션 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <div className="flex items-center justify-between mb-[20px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)]">AI 분석</h2>
            <button
              onClick={handleSubmitAi}
              disabled={isAiRunning || hasMissingRequired}
              className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiRunning ? (
                <span className="flex items-center gap-[8px]">
                  <span className="w-[16px] h-[16px] border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                  분석 중...
                </span>
              ) : (
                'AI 분석 실행'
              )}
            </button>
          </div>

          {/* 슬롯 현황 (preview) */}
          {previewMutation.isPending ? (
            <div className="flex items-center justify-center py-[32px]">
              <div className="w-[24px] h-[24px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : previewData?.requiredSlotStatus ? (
            <div className="mb-[20px]">
              <div className="flex items-center justify-between mb-[8px]">
                <span className="font-body-medium text-[var(--color-text-secondary)]">필수 항목</span>
                <span className="font-title-xsmall text-[var(--color-text-primary)]">
                  {previewData.requiredSlotStatus.filter((s: SlotStatus) => s.submitted).length} / {previewData.requiredSlotStatus.length}
                </span>
              </div>
              <div className="h-[6px] bg-gray-200 rounded-full overflow-hidden mb-[12px]">
                <div
                  className="h-full bg-[var(--color-primary-main)] transition-all"
                  style={{
                    width: `${previewData.requiredSlotStatus.length > 0
                      ? (previewData.requiredSlotStatus.filter((s: SlotStatus) => s.submitted).length / previewData.requiredSlotStatus.length) * 100
                      : 0}%`
                  }}
                />
              </div>
              {hasMissingRequired && (
                <p className="font-body-small text-[var(--color-state-error-text)]">
                  필수 항목이 누락되어 AI 분석을 실행할 수 없습니다.
                </p>
              )}
            </div>
          ) : null}

          {/* 진행 상태 */}
          {aiJobStatus && aiJobStatus !== 'SUCCEEDED' && !aiAnalysisError && (
            <div className="py-[24px]">
              <AiJobProgress status={aiJobStatus} />
            </div>
          )}

          {/* 토스트 알림 */}
          {aiJobStatus && (
            <AiJobNotification status={aiJobStatus} jobId={String(diagnosticId)} />
          )}

          {/* 에러 처리 */}
          {isServiceUnavailable ? (
            <AiServiceFallback onRetry={handleRetryAi} isRetrying={submitAiMutation.isPending} />
          ) : aiAnalysisError ? (
            <AiJobErrorHandler
              error={aiAnalysisError}
              onRetry={handleRetryAi}
              isRetrying={submitAiMutation.isPending}
            />
          ) : null}

          {/* 분석 결과 */}
          {!isAiRunning && !aiAnalysisError && aiResultDetail && (
            <div className="space-y-[20px]">
              <AiResultSummary
                verdict={aiResultDetail.verdict as 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX'}
                riskLevel={aiResultDetail.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH'}
                whySummary={aiResultDetail.whySummary}
              />
              <SlotResultList slotResults={slotResults} />
              <ClarificationList clarifications={clarifications} />
            </div>
          )}

          {/* 결과 없음 */}
          {!isAiRunning && !aiAnalysisError && !aiResultDetail && !isDetailLoading && (
            <div className="text-center py-[32px]">
              <p className="font-body-medium text-[var(--color-text-tertiary)]">
                아직 분석 결과가 없습니다. AI 분석을 실행해 주세요.
              </p>
            </div>
          )}
        </div>

        {/* AI 분석 이력 */}
        {historyEntries.length > 0 && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <AiHistoryTimeline history={historyEntries} />
          </div>
        )}
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
