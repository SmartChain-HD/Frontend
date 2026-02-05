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
import type { AiAnalysisResultResponse, SlotResultDetail } from '../../src/api/aiRun';
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

const REASON_LABELS: Record<string, string> = {
  MISSING_SLOT: '필수 슬롯 누락',
  HEADER_MISMATCH: '필수 헤더(컬럼) 누락',
  EMPTY_TABLE: '표/데이터 행이 비어있음',
  OCR_FAILED: 'OCR 판독 불가/텍스트 추출 실패',
  WRONG_YEAR: '문서 대상 연도 불일치',
  PARSE_FAILED: '파싱 실패',
  DATE_MISMATCH: '기간 불일치',
  UNIT_MISSING: '단위 누락',
  EVIDENCE_MISSING: '근거문서 누락',
  SIGNATURE_MISSING: '확인 서명란 미기재',
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
          comment: comment || undefined,
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
  const canSubmit = diagnostic.status === 'WRITING' || diagnostic.status === 'RETURNED';
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
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{diagnostic.title || diagnostic.summary || diagnostic.diagnosticCode}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[diagnostic.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {diagnostic.statusLabel || DIAGNOSTIC_STATUS_LABELS[diagnostic.status] || diagnostic.status}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[20px]">기안 정보</h2>
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="기안명" value={diagnostic.title || diagnostic.summary || diagnostic.diagnosticCode || '-'} />
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

        {/* AI 분석 결과 */}
        {aiResult && (
          <AiResultSection result={aiResult} />
        )}

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
                    {DIAGNOSTIC_STATUS_LABELS[item.status]}
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
          {canSubmit && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-[24px] py-[12px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
            >
              {hasApprovalWorkflow ? '결재자에게 제출' : '심사자에게 제출'}
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
                기안 제출
              </h2>
            </div>

            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              <p className="font-body-medium text-[var(--color-text-secondary)]">
                {hasApprovalWorkflow ? '기안을 결재자에게 제출하시겠습니까?' : '기안을 심사자에게 제출하시겠습니까?'}
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

  return (
    <div className="p-[16px] bg-gray-50 rounded-[12px]">
      <div className="flex items-center justify-between mb-[8px]">
        <span className="font-title-small text-[var(--color-text-primary)]">
          {displayName}
        </span>
        <span className={`px-[10px] py-[4px] rounded text-sm font-medium border ${VERDICT_STYLES[verdict]}`}>
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {result.reasons && result.reasons.length > 0 && (
        <ul className="space-y-[4px] mt-[8px]">
          {result.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-[6px] font-body-small text-[var(--color-text-secondary)]">
              <span className="w-[4px] h-[4px] bg-gray-400 rounded-full mt-[6px] flex-shrink-0" />
              {REASON_LABELS[reason] || reason}
            </li>
          ))}
        </ul>
      )}

      {result.file_names && result.file_names.length > 0 && (
        <div className="mt-[8px] flex flex-wrap gap-[6px]">
          {result.file_names.map((fileName, index) => (
            <span key={index} className="px-[8px] py-[2px] bg-white text-xs text-gray-600 rounded border border-gray-200">
              {fileName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
