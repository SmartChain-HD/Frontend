import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useDiagnosticDetail } from '../../src/hooks/useDiagnostics';
import { useDiagnosticFiles } from '../../src/hooks/useFiles';
import {
  useAiPreview,
  useSubmitAiRun,
  useAiResult,
  useAiHistory,
} from '../../src/hooks/useAiRun';
import { useRetryJob, parseAiJobError } from '../../src/hooks/useAiJobs';
import type { DomainCode, RiskLevel, ErrorResponse } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import type { SlotStatus, AiAnalysisResultResponse } from '../../src/api/aiRun';
import { AiJobErrorHandler, AiServiceFallback } from '../../shared/components/ai';
import DashboardLayout from '../../shared/layout/DashboardLayout';

type Verdict = 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';

const VERDICT_LABELS: Record<Verdict, string> = {
  PASS: '적합',
  WARN: '경고',
  NEED_CLARIFY: '확인 필요',
  NEED_FIX: '수정 필요',
};

const VERDICT_STYLES: Record<Verdict, string> = {
  PASS: 'bg-green-100 text-green-700 border-green-200',
  WARN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  NEED_CLARIFY: 'bg-orange-100 text-orange-700 border-orange-200',
  NEED_FIX: 'bg-red-100 text-red-700 border-red-200',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: '낮음',
  MEDIUM: '중간',
  HIGH: '높음',
};

const RISK_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-red-50 text-red-700',
};

const DOMAIN_SLOT_COUNTS: Record<DomainCode, number> = {
  ESG: 15,
  SAFETY: 8,
  COMPLIANCE: 7,
};

export default function DiagnosticAiAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const diagnosticId = Number(id);

  const { data: diagnostic, isLoading: isDiagnosticLoading } = useDiagnosticDetail(diagnosticId);
  const { data: files } = useDiagnosticFiles(diagnosticId);
  const previewMutation = useAiPreview();
  const submitMutation = useSubmitAiRun();
  const { data: aiResult, isLoading: isResultLoading, isError: isResultError, error: resultError, refetch: refetchResult } = useAiResult(diagnosticId);
  const { data: aiHistory } = useAiHistory(diagnosticId);
  const retryJobMutation = useRetryJob();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<AxiosError<ErrorResponse> | null>(null);

  // Trigger preview with parsed files only
  const parsedFileIds = files?.filter(f => f.parsingStatus === 'SUCCESS').map(f => f.fileId) || [];

  useEffect(() => {
    if (diagnosticId > 0 && parsedFileIds.length > 0) {
      previewMutation.mutate({ diagnosticId, fileIds: parsedFileIds });
    }
  }, [diagnosticId, parsedFileIds.length]);

  // Poll for result when analyzing
  useEffect(() => {
    if (isAnalyzing && aiResult) {
      setIsAnalyzing(false);
    }
  }, [aiResult, isAnalyzing]);

  const handleSubmitAiRun = () => {
    setShowSubmitModal(false);
    setIsAnalyzing(true);
    setAnalysisError(null);
    submitMutation.mutate(diagnosticId, {
      onError: (error) => {
        setIsAnalyzing(false);
        setAnalysisError(error as AxiosError<ErrorResponse>);
      },
    });
  };

  const handleRetryAnalysis = () => {
    setAnalysisError(null);
    handleSubmitAiRun();
  };

  const handleRefetchResult = () => {
    setAnalysisError(null);
    refetchResult();
  };

  const isServiceUnavailable = analysisError
    ? parseAiJobError(analysisError).type === 'SERVICE_UNAVAILABLE'
    : false;

  const previewData = previewMutation.data;
  const requiredSlotStatus = previewData?.requiredSlotStatus || [];
  const hasMissingRequiredSlots = previewData?.missingRequiredSlots && previewData.missingRequiredSlots.length > 0;

  if (isDiagnosticLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-[120px]">
          <div className="w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!diagnostic) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <p className="font-body-medium text-[var(--color-state-error-text)]">
            기안 정보를 불러올 수 없습니다.
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

  const domainCode = diagnostic.domainCode as DomainCode;
  const totalSlots = DOMAIN_SLOT_COUNTS[domainCode] || 10;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1200px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(`/diagnostics/${diagnosticId}`)}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          기안 상세로 돌아가기
        </button>

        {/* 헤더 */}
        <div className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="font-heading-small text-[var(--color-text-primary)]">AI 분석</h1>
            <p className="font-body-medium text-[var(--color-text-tertiary)] mt-[8px]">
              {diagnostic.title} • {DOMAIN_LABELS[domainCode]}
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isAnalyzing || submitMutation.isPending || hasMissingRequiredSlots}
            className="px-[24px] py-[12px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing || submitMutation.isPending ? (
              <span className="flex items-center gap-[8px]">
                <span className="w-[16px] h-[16px] border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                분석 중...
              </span>
            ) : (
              'AI 분석 실행'
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-[24px]">
          {/* 좌측: 슬롯 현황 + 분석 결과 */}
          <div className="space-y-[24px]">
            {/* 슬롯 현황 */}
            <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border-default)] flex items-center justify-between">
                <h2 className="font-title-medium text-[var(--color-text-primary)]">
                  필수 항목 현황
                </h2>
                <span className="font-body-small text-[var(--color-text-tertiary)]">
                  {DOMAIN_LABELS[domainCode]} - 총 {totalSlots}개 슬롯
                </span>
              </div>

              <div className="p-[20px]">
                {previewMutation.isPending ? (
                  <div className="flex items-center justify-center py-[40px]">
                    <div className="w-[24px] h-[24px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : previewMutation.isError ? (
                  <div className="text-center py-[40px]">
                    <p className="font-body-medium text-red-500 mb-[12px]">
                      슬롯 정보를 불러올 수 없습니다
                    </p>
                    <button
                      onClick={() => previewMutation.mutate({ diagnosticId, fileIds: [] })}
                      className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : previewData ? (
                  <div className="space-y-[16px]">
                    {/* 진행률 */}
                    <div>
                      <div className="flex items-center justify-between mb-[8px]">
                        <span className="font-body-medium text-[var(--color-text-secondary)]">
                          제출 완료
                        </span>
                        <span className="font-title-small text-[var(--color-text-primary)]">
                          {requiredSlotStatus.filter(s => s.submitted).length} / {requiredSlotStatus.length}
                        </span>
                      </div>
                      <div className="h-[8px] bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-primary-main)] transition-all"
                          style={{
                            width: `${requiredSlotStatus.length > 0
                              ? (requiredSlotStatus.filter(s => s.submitted).length / requiredSlotStatus.length) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* 슬롯 목록 */}
                    <div className="space-y-[8px]">
                      {requiredSlotStatus.map((slot: SlotStatus, index: number) => (
                        <SlotItem key={index} slot={slot} />
                      ))}
                    </div>

                    {/* 누락 슬롯 경고 */}
                    {hasMissingRequiredSlots && (
                      <div className="p-[16px] bg-red-50 rounded-[8px] border border-red-200">
                        <div className="flex items-start gap-[12px]">
                          <svg className="w-[20px] h-[20px] text-red-500 flex-shrink-0 mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="font-title-small text-red-700 mb-[4px]">
                              필수 항목 누락
                            </p>
                            <p className="font-body-small text-red-600">
                              AI 분석을 실행하려면 다음 항목을 제출해야 합니다:
                            </p>
                            <ul className="mt-[8px] space-y-[4px]">
                              {previewData.missingRequiredSlots.map((slot: string, index: number) => (
                                <li key={index} className="font-body-small text-red-600 flex items-center gap-[6px]">
                                  <span className="w-[4px] h-[4px] bg-red-500 rounded-full" />
                                  {slot}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-[40px]">
                    <p className="font-body-medium text-[var(--color-text-tertiary)]">
                      슬롯 정보가 없습니다
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 분석 결과 */}
            <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
              <div className="px-[20px] py-[16px] border-b border-[var(--color-border-default)]">
                <h2 className="font-title-medium text-[var(--color-text-primary)]">
                  분석 결과
                </h2>
              </div>

              <div className="p-[20px]">
                {isServiceUnavailable ? (
                  <AiServiceFallback
                    onRetry={handleRefetchResult}
                    isRetrying={isResultLoading}
                  />
                ) : analysisError ? (
                  <AiJobErrorHandler
                    error={analysisError}
                    onRetry={handleRetryAnalysis}
                    isRetrying={submitMutation.isPending}
                  />
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-[60px] gap-[16px]">
                    <div className="w-[48px] h-[48px] border-[4px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                    <p className="font-body-medium text-[var(--color-text-secondary)]">
                      AI가 문서를 분석 중입니다...
                    </p>
                    <p className="font-body-small text-[var(--color-text-tertiary)]">
                      분석에 시간이 걸릴 수 있습니다
                    </p>
                  </div>
                ) : isResultLoading ? (
                  <div className="flex items-center justify-center py-[60px]">
                    <div className="w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isResultError ? (
                  <AiJobErrorHandler
                    error={resultError as AxiosError<ErrorResponse>}
                    onRetry={handleRefetchResult}
                    isRetrying={isResultLoading}
                  />
                ) : !aiResult ? (
                  <div className="text-center py-[60px]">
                    <svg className="w-[48px] h-[48px] mx-auto mb-[16px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="font-body-medium text-[var(--color-text-tertiary)]">
                      아직 분석 결과가 없습니다
                    </p>
                    <p className="font-body-small text-[var(--color-text-tertiary)] mt-[4px]">
                      AI 분석을 실행해 주세요
                    </p>
                  </div>
                ) : (
                  <AiResultCard result={aiResult} />
                )}
              </div>
            </div>
          </div>

          {/* 우측: 분석 이력 */}
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] h-fit">
            <div className="px-[20px] py-[16px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                분석 이력
              </h2>
            </div>

            <div className="p-[20px]">
              {aiHistory && aiHistory.length > 0 ? (
                <div className="space-y-[16px]">
                  {aiHistory.map((item, index) => (
                    <HistoryItem key={item.resultId} item={item} isLatest={index === 0} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-[40px]">
                  <svg className="w-[40px] h-[40px] mx-auto mb-[12px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-body-medium text-[var(--color-text-tertiary)]">
                    분석 이력이 없습니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 분석 실행 확인 모달 */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[480px] mx-[16px] shadow-xl">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                AI 분석 실행
              </h2>
            </div>

            <div className="px-[24px] py-[20px]">
              <p className="font-body-medium text-[var(--color-text-secondary)]">
                업로드된 파일을 기반으로 AI 분석을 실행합니다.
              </p>
              <p className="font-body-small text-[var(--color-text-tertiary)] mt-[8px]">
                분석에는 시간이 걸릴 수 있으며, 완료되면 결과가 표시됩니다.
              </p>

              {files && files.length > 0 && (
                <div className="mt-[16px] p-[12px] bg-gray-50 rounded-[8px]">
                  <p className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px]">
                    분석 대상 ({parsedFileIds.length}개 파일)
                  </p>
                  <div className="space-y-[6px] max-h-[200px] overflow-y-auto">
                    {files.filter(f => f.parsingStatus === 'SUCCESS').map(f => (
                      <div key={f.fileId} className="flex items-center gap-[8px] px-[8px] py-[6px] bg-white rounded-[6px]">
                        <svg className="w-[16px] h-[16px] text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-body-small text-[var(--color-text-primary)] truncate">{f.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmitAiRun}
                className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] font-title-small text-white hover:opacity-90 transition-colors"
              >
                분석 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// 슬롯 아이템 컴포넌트
function SlotItem({ slot }: { slot: SlotStatus }) {
  return (
    <div className="flex items-center justify-between px-[12px] py-[10px] bg-gray-50 rounded-[8px]">
      <div className="flex items-center gap-[10px]">
        {slot.submitted ? (
          <svg className="w-[18px] h-[18px] text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
          </svg>
        )}
        <span className={`font-body-medium ${slot.submitted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}>
          {slot.slotName}
        </span>
      </div>
      <div className="flex items-center gap-[8px]">
        {slot.required && (
          <span className="px-[6px] py-[2px] bg-red-100 text-red-600 text-xs font-medium rounded">
            필수
          </span>
        )}
        <span className={`px-[8px] py-[2px] text-xs font-medium rounded ${
          slot.submitted
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {slot.submitted ? '제출됨' : '미제출'}
        </span>
      </div>
    </div>
  );
}

// 분석 결과 카드 컴포넌트
function AiResultCard({ result }: { result: AiAnalysisResultResponse }) {
  const verdict = result.verdict as Verdict;
  const riskLevel = result.riskLevel as RiskLevel;

  return (
    <div className="space-y-[20px]">
      {/* 판정 결과 */}
      <div className="flex items-center gap-[16px]">
        <div className={`px-[16px] py-[10px] rounded-[8px] border ${VERDICT_STYLES[verdict]}`}>
          <span className="font-title-medium">{VERDICT_LABELS[verdict]}</span>
        </div>
        <div className={`px-[12px] py-[6px] rounded-full ${RISK_STYLES[riskLevel]}`}>
          <span className="font-title-xsmall">위험도: {RISK_LABELS[riskLevel]}</span>
        </div>
      </div>

      {/* 요약 */}
      <div>
        <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">분석 요약</p>
        <p className="font-body-medium text-[var(--color-text-primary)] leading-[1.6]">
          {result.whySummary}
        </p>
      </div>

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
  );
}

// 이력 아이템 컴포넌트
function HistoryItem({ item, isLatest }: { item: AiAnalysisResultResponse; isLatest: boolean }) {
  const verdict = item.verdict as Verdict;
  const riskLevel = item.riskLevel as RiskLevel;

  return (
    <div className={`relative pl-[24px] pb-[16px] border-l-2 ${isLatest ? 'border-[var(--color-primary-main)]' : 'border-gray-200'} last:pb-0`}>
      {/* 타임라인 점 */}
      <div className={`absolute left-[-5px] top-0 w-[8px] h-[8px] rounded-full ${
        isLatest ? 'bg-[var(--color-primary-main)]' : 'bg-gray-300'
      }`} />

      <div className="space-y-[8px]">
        {/* 날짜 */}
        <p className="font-body-small text-[var(--color-text-tertiary)]">
          {new Date(item.analyzedAt).toLocaleString('ko-KR')}
        </p>

        {/* 판정 + 위험도 */}
        <div className="flex items-center gap-[8px]">
          <span className={`px-[8px] py-[2px] rounded text-xs font-medium border ${VERDICT_STYLES[verdict]}`}>
            {VERDICT_LABELS[verdict]}
          </span>
          <span className={`px-[6px] py-[2px] rounded text-xs font-medium ${RISK_STYLES[riskLevel]}`}>
            {RISK_LABELS[riskLevel]}
          </span>
        </div>

        {/* 요약 */}
        <p className="font-body-small text-[var(--color-text-secondary)] line-clamp-2">
          {item.whySummary}
        </p>
      </div>
    </div>
  );
}
