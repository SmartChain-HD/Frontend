import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApprovalDetail, useProcessApproval, useSubmitToReviewer } from '../../src/hooks/useApprovals';
import { useAiResult } from '../../src/hooks/useAiRun';
import type { ApprovalStatus, DomainCode, RiskLevel } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import { handleApiError } from '../../src/utils/errorHandler';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../src/types/api.types';
import type { AiAnalysisResultResponse, SlotResultDetail } from '../../src/api/aiRun';
import DashboardLayout from '../../shared/layout/DashboardLayout';

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
  LOW: 'bg-[#dcfce7] text-[#15803d]',
  MEDIUM: 'bg-[#fef9c3] text-[#a16207]',
  HIGH: 'bg-[#fee2e2] text-[#dc2626]',
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

const DOMAIN_TO_LIST: Record<string, string> = {
  SAFETY: '/diagnostics?domainCode=SAFETY',
  ESG: '/diagnostics?domainCode=ESG',
  COMPLIANCE: '/diagnostics?domainCode=COMPLIANCE',
};

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const approvalId = Number(id);

  const { data: approval, isLoading, isError, error } = useApprovalDetail(approvalId);
  const diagnosticId = approval?.diagnostic?.diagnosticId ?? 0;
  const { data: aiResult } = useAiResult(diagnosticId);
  const processApprovalMutation = useProcessApproval();
  const submitToReviewerMutation = useSubmitToReviewer();

  useEffect(() => {
    if (error) {
      handleApiError(error as AxiosError<ErrorResponse>);
    }
  }, [error]);

  const [showModal, setShowModal] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleProcess = () => {
    if (!showModal) return;
    processApprovalMutation.mutate(
      {
        id: approvalId,
        data: {
          decision: showModal,
          comment: comment || undefined,
          rejectReason: showModal === 'REJECTED' ? rejectReason || undefined : undefined,
        },
      },
      {
        onSuccess: () => {
          setShowModal(null);
          setComment('');
          setRejectReason('');

          // 승인인 경우 자동으로 원청에 제출
          if (showModal === 'APPROVED') {
            submitToReviewerMutation.mutate(approvalId, {
              onSuccess: () => {
                navigate(approval?.domainCode ? DOMAIN_TO_LIST[approval.domainCode] || '/dashboard' : '/dashboard');
              },
            });
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

        {/* 액션 버튼 */}
        {isWaiting && (
          <div className="flex gap-[12px] justify-end">
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

              {showModal === 'REJECTED' && (
                <div>
                  <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                    반려 사유
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                    rows={3}
                    className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                  />
                </div>
              )}
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => { setShowModal(null); setComment(''); setRejectReason(''); }}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleProcess}
                disabled={processApprovalMutation.isPending || submitToReviewerMutation.isPending}
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
          <div className={`px-[16px] py-[10px] rounded-[8px] border ${VERDICT_STYLES[verdict]}`}>
            <span className="font-title-medium">{VERDICT_LABELS[verdict]}</span>
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

  return (
    <div className="p-[20px] bg-gray-50 rounded-[12px]">
      <div className="flex items-center justify-between mb-[12px]">
        <span className="font-title-medium text-[var(--color-text-primary)]">
          {displayName}
        </span>
        <span className={`px-[12px] py-[6px] rounded-[6px] text-base font-semibold border ${VERDICT_STYLES[verdict]}`}>
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {result.reasons && result.reasons.length > 0 && (
        <ul className="space-y-[8px] mt-[12px]">
          {result.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-[8px] text-[17px] text-[var(--color-text-secondary)]">
              <span className="w-[5px] h-[5px] bg-gray-400 rounded-full mt-[10px] flex-shrink-0" />
              {REASON_LABELS[reason] || reason}
            </li>
          ))}
        </ul>
      )}

      {result.file_names && result.file_names.length > 0 && (
        <div className="mt-[12px] flex flex-wrap gap-[8px]">
          {result.file_names.map((fileName, index) => (
            <span key={index} className="px-[12px] py-[6px] bg-white text-base text-gray-700 rounded-[6px] border border-gray-200">
              {fileName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
