import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { AlertCircle, ArrowLeft, X, FileText, Download } from 'lucide-react';
import { useReviewDetail, useSubmitReview } from '../../src/hooks/useReviews';
import { useAiResult } from '../../src/hooks/useAiRun';
import type { DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import type { SlotResultDetail } from '../../src/api/aiRun';

interface DocumentReviewPageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

const riskLevelLabels: Record<string, string> = {
  HIGH: '고위험 (HIGH)',
  MEDIUM: '중위험 (MEDIUM)',
  LOW: '저위험 (LOW)',
};

const riskLevelColors: Record<string, string> = {
  HIGH: 'bg-[#dc2626]',
  MEDIUM: 'bg-[#e65100]',
  LOW: 'bg-[#008233]',
};

const aiVerdictLabels: Record<string, string> = {
  PASS: '적합 (PASS)',
  NEED_FIX: '보완 필요 (NEED FIX)',
  FAIL: '부적합 (FAIL)',
};

const aiVerdictBadgeColors: Record<string, string> = {
  PASS: 'bg-[#f0fdf4] text-[#008233]',
  NEED_FIX: 'bg-[#fff3e0] text-[#e65100]',
  FAIL: 'bg-[#fef2f2] text-[#b91c1c]',
};

const aiVerdictEmoji: Record<string, string> = {
  PASS: '🟢',
  NEED_FIX: '⚠️',
  FAIL: '🔴',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
}

function formatPeriod(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월`;
}

const DOMAIN_TO_DASHBOARD: Record<string, string> = {
  SAFETY: '/dashboard/safety',
  ESG: '/dashboard/esg',
  COMPLIANCE: '/dashboard/compliance',
};

function getListPath(userRole: string, domainCode?: string): string {
  if (userRole === 'receiver') {
    return '/reviews';
  }
  if (userRole === 'approver') {
    // 전체 결재 목록 페이지가 제거되어 도메인별 대시보드로 이동 (#276)
    return domainCode ? DOMAIN_TO_DASHBOARD[domainCode] || '/dashboard' : '/dashboard';
  }
  const domain = domainCode?.toUpperCase() || 'ESG';
  return `/diagnostics?domainCode=${domain}`;
}

export default function DocumentReviewPage({ userRole }: DocumentReviewPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id) || 0;

  const { data: review, isLoading, isError } = useReviewDetail(reviewId);
  const diagnosticId = review?.diagnostic?.diagnosticId ?? 0;
  const { data: aiResult } = useAiResult(diagnosticId);
  const submitReview = useSubmitReview();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [categoryCommentE, setCategoryCommentE] = useState('');
  const [categoryCommentS, setCategoryCommentS] = useState('');
  const [categoryCommentG, setCategoryCommentG] = useState('');

  const isESGDomain = review?.domainCode === 'ESG';

  const listPath = getListPath(userRole, review?.domainCode);

  const handleBackToList = () => {
    navigate(listPath);
  };

  const handleReject = () => {
    // AI 분석 결과의 clarifications를 초안으로 사용
    const clarifications = aiResult?.details?.clarifications;
    if (clarifications && clarifications.length > 0) {
      const draft = clarifications
        .map((c) => c.message)
        .join('\n\n---\n\n');
      setRejectReason(draft);
    }
    setShowRejectModal(true);
  };

  const handleApprove = () => {
    if (isESGDomain) {
      setShowApproveModal(true);
    } else {
      submitReview.mutate(
        { id: reviewId, data: { decision: 'APPROVED' } },
        { onSuccess: () => navigate(listPath) }
      );
    }
  };

  const handleApproveWithComments = () => {
    submitReview.mutate(
      {
        id: reviewId,
        data: {
          decision: 'APPROVED',
          categoryCommentE: categoryCommentE || undefined,
          categoryCommentS: categoryCommentS || undefined,
          categoryCommentG: categoryCommentG || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          navigate(listPath);
        },
      }
    );
  };

  const handleRequestFix = () => {
    if (!rejectReason.trim()) return;
    submitReview.mutate(
      { id: reviewId, data: { decision: 'REVISION_REQUIRED', comment: rejectReason } },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          navigate(listPath);
        },
      }
    );
  };

  const handleSubmitToApprover = () => {
    submitReview.mutate(
      { id: reviewId, data: { decision: 'APPROVED' } },
      { onSuccess: () => navigate(listPath) }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-[32px] w-[32px] border-b-2 border-[#003087]" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !review) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[400px] gap-[16px]">
          <AlertCircle className="w-[48px] h-[48px] text-[#dc2626]" />
          <p className="font-title-medium text-[#212529]">데이터를 불러올 수 없습니다.</p>
          <button
            onClick={handleBackToList}
            className="px-[24px] py-[12px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const riskLevel = review.riskLevel ?? 'MEDIUM';
  const riskLabel = riskLevelLabels[riskLevel] ?? riskLevel;
  const riskColor = riskLevelColors[riskLevel] ?? 'bg-[#e65100]';
  const aiVerdict = review.aiVerdict ?? 'NEED_FIX';
  const aiLabel = aiVerdictLabels[aiVerdict] ?? aiVerdict;
  const aiBadgeColor = aiVerdictBadgeColors[aiVerdict] ?? 'bg-[#fff3e0] text-[#e65100]';
  const aiEmoji = aiVerdictEmoji[aiVerdict] ?? '⚠️';
  const isMutating = submitReview.isPending;

  return (
    <DashboardLayout>
      <div className="p-[32px]">
        <div className="max-w-[1468px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-[24px]">
            <div>
              <div className="flex items-center gap-[16px] mb-[8px]">
                <h1 className="font-heading-medium text-[#212529]">
                  {formatPeriod(review.submittedAt)} 제출 결과 조회
                </h1>
              </div>
              <div className="flex items-center gap-[16px]">
                <div className="flex items-center gap-[8px]">
                  <span className="font-body-small text-[#868e96]">협력사:</span>
                  <span className="font-title-small text-[#212529]">
                    {review.company?.companyName || '-'}
                  </span>
                </div>
                <div className="w-[1px] h-[16px] bg-[#dee2e6]"></div>
                <div className="flex items-center gap-[8px]">
                  <span className="font-body-small text-[#868e96]">제출일:</span>
                  <span className="font-title-small text-[#212529]">
                    {formatDate(review.submittedAt)}
                  </span>
                </div>
              </div>
              <p className="font-body-small text-[#868e96] mt-[8px]">
                Ref: {review.reviewIdLabel || review.diagnostic?.diagnosticCode || '-'}
              </p>
            </div>
          </div>

          {/* Risk Alert Box */}
          <div className={`${riskColor} rounded-[16px] p-[32px] mb-[32px]`}>
            <div className="flex items-start gap-[16px]">
              <AlertCircle className="w-[32px] h-[32px] text-white flex-shrink-0 mt-[4px]" />
              <div className="flex-1">
                <div className="flex items-center gap-[12px] mb-[12px]">
                  <h2 className="font-heading-small text-white">
                    🔴 {riskLabel}
                  </h2>
                  <span className={`inline-block px-[12px] py-[6px] rounded-[8px] font-title-small ${aiBadgeColor}`}>
                    {aiEmoji} {aiLabel}
                  </span>
                </div>
                {review.whySummary && (
                  <p className="font-body-medium text-white">
                    Key 이슈: {review.whySummary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 기안 정보 */}
          <div className="bg-white rounded-[16px] border border-[#dee2e6] p-[24px] mb-[24px]">
            <h2 className="font-title-medium text-[#212529] mb-[16px]">기안 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
              <div>
                <p className="font-body-small text-[#868e96] mb-[4px]">기안명</p>
                <p className="font-title-small text-[#212529]">{review.diagnostic?.title || '-'}</p>
              </div>
              <div>
                <p className="font-body-small text-[#868e96] mb-[4px]">기안코드</p>
                <p className="font-title-small text-[#212529]">{review.diagnostic?.diagnosticCode || '-'}</p>
              </div>
              <div>
                <p className="font-body-small text-[#868e96] mb-[4px]">도메인</p>
                <p className="font-title-small text-[#212529]">{review.domainName || DOMAIN_LABELS[review.domainCode as DomainCode] || review.domainCode}</p>
              </div>
              <div>
                <p className="font-body-small text-[#868e96] mb-[4px]">점수</p>
                <p className="font-title-small text-[#212529]">{review.score !== null ? `${review.score}점` : '-'}</p>
              </div>
              <div>
                <p className="font-body-small text-[#868e96] mb-[4px]">상태</p>
                <p className="font-title-small text-[#212529]">{review.statusLabel || review.status}</p>
              </div>
              <div>
                <p className="font-body-small text-[#868e96] mb-[4px]">담당자</p>
                <p className="font-title-small text-[#212529]">{review.assignedTo?.name || '-'}</p>
              </div>
            </div>
          </div>

          {/* AI 분석 결과 상세 */}
          {aiResult && (
            <div className="bg-white rounded-[16px] border border-[#dee2e6] p-[24px] mb-[24px]">
              <h2 className="font-title-medium text-[#212529] mb-[16px]">AI 분석 결과 상세</h2>

              <div className="mb-[16px]">
                <p className="font-body-small text-[#868e96] mb-[8px]">분석 요약</p>
                <p className="font-body-medium text-[#212529] leading-[1.6]">{aiResult.whySummary}</p>
              </div>

              {aiResult.details?.slot_results && aiResult.details.slot_results.length > 0 && (
                <div>
                  <p className="font-body-small text-[#868e96] mb-[12px]">슬롯별 분석 결과</p>
                  <div className="space-y-[12px]">
                    {aiResult.details.slot_results.map((slotResult: SlotResultDetail, index: number) => (
                      <SlotResultCard key={index} result={slotResult} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-[16px] pt-[16px] border-t border-[#dee2e6]">
                <p className="font-body-small text-[#868e96]">
                  분석 일시: {new Date(aiResult.analyzedAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          )}

          {/* 파일 다운로드 */}
          {(review.files.hasDiagnosticPdf || review.files.hasDataPackage || review.files.hasModificationLog || review.files.hasAiReport) && (
            <div className="bg-white rounded-[16px] border border-[#dee2e6] p-[24px] mb-[24px]">
              <h2 className="font-title-medium text-[#212529] mb-[16px]">관련 파일</h2>
              <div className="flex flex-wrap gap-[12px]">
                {review.files.hasDiagnosticPdf && review.files.diagnosticPdfUrl && (
                  <a
                    href={review.files.diagnosticPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[8px] px-[16px] py-[10px] bg-[#f8f9fa] rounded-[8px] font-body-medium text-[#212529] hover:bg-[#e9ecef] transition-colors"
                  >
                    <FileText className="w-[18px] h-[18px] text-[#868e96]" />
                    진단 PDF
                    <Download className="w-[16px] h-[16px] text-[#868e96]" />
                  </a>
                )}
                {review.files.hasDataPackage && review.files.dataPackageUrl && (
                  <a
                    href={review.files.dataPackageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[8px] px-[16px] py-[10px] bg-[#f8f9fa] rounded-[8px] font-body-medium text-[#212529] hover:bg-[#e9ecef] transition-colors"
                  >
                    <FileText className="w-[18px] h-[18px] text-[#868e96]" />
                    데이터 패키지
                    <Download className="w-[16px] h-[16px] text-[#868e96]" />
                  </a>
                )}
                {review.files.hasModificationLog && review.files.modificationLogUrl && (
                  <a
                    href={review.files.modificationLogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[8px] px-[16px] py-[10px] bg-[#f8f9fa] rounded-[8px] font-body-medium text-[#212529] hover:bg-[#e9ecef] transition-colors"
                  >
                    <FileText className="w-[18px] h-[18px] text-[#868e96]" />
                    수정 이력
                    <Download className="w-[16px] h-[16px] text-[#868e96]" />
                  </a>
                )}
                {review.files.hasAiReport && review.files.aiReportUrl && (
                  <a
                    href={review.files.aiReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[8px] px-[16px] py-[10px] bg-[#f8f9fa] rounded-[8px] font-body-medium text-[#212529] hover:bg-[#e9ecef] transition-colors"
                  >
                    <FileText className="w-[18px] h-[18px] text-[#868e96]" />
                    AI 분석 리포트
                    <Download className="w-[16px] h-[16px] text-[#868e96]" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-[12px] justify-end">
            {userRole === 'drafter' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-[32px] py-[14px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors flex items-center gap-[8px]"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                  목록으로 (Back to List)
                </button>
                <button
                  onClick={handleSubmitToApprover}
                  disabled={isMutating}
                  className="px-[32px] py-[14px] bg-[#003087] text-white rounded-[8px] font-title-small hover:bg-[#002554] transition-colors disabled:opacity-50"
                >
                  결재자에게 제출 (Submit to Approver)
                </button>
              </>
            )}

            {userRole === 'approver' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-[32px] py-[14px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors flex items-center gap-[8px]"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                  목록으로 (Back to List)
                </button>
                <button
                  onClick={handleReject}
                  className="px-[32px] py-[14px] bg-[#dc2626] text-white rounded-[8px] font-title-small hover:bg-[#b91c1c] transition-colors"
                >
                  반려 및 보완 요청 (Reject & Request Fix)
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isMutating}
                  className="px-[32px] py-[14px] bg-[#00ad1d] text-white rounded-[8px] font-title-small hover:bg-[#008a18] transition-colors disabled:opacity-50"
                >
                  원청 제출 (Submit to Client)
                </button>
              </>
            )}

            {userRole === 'receiver' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-[32px] py-[14px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors flex items-center gap-[8px]"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                  목록으로 (Back to List)
                </button>
                <button
                  onClick={handleReject}
                  className="px-[32px] py-[14px] bg-[#e65100] text-white rounded-[8px] font-title-small hover:bg-[#d84a00] transition-colors"
                >
                  재제출 요청 (Request Resubmission)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ESG Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[32px] w-[700px] max-w-[90%]">
            <div className="flex items-center justify-between mb-[24px]">
              <h3 className="font-heading-small text-[#212529]">
                ESG 심사 승인
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="p-[8px] hover:bg-[#f1f3f5] rounded-[8px] transition-colors"
              >
                <X className="w-[24px] h-[24px] text-[#868e96]" />
              </button>
            </div>

            <div className="space-y-[16px] mb-[24px]">
              <div>
                <label className="block font-title-small text-[#212529] mb-[8px]">
                  환경(E) 관련 의견 <span className="text-[#868e96] font-body-small">(선택)</span>
                </label>
                <textarea
                  value={categoryCommentE}
                  onChange={(e) => setCategoryCommentE(e.target.value)}
                  placeholder="환경 관련 의견을 입력해주세요..."
                  className="w-full h-[80px] border border-[#dee2e6] rounded-[12px] p-[12px] font-body-medium resize-none focus:outline-none focus:border-[#003087]"
                />
              </div>

              <div>
                <label className="block font-title-small text-[#212529] mb-[8px]">
                  사회(S) 관련 의견 <span className="text-[#868e96] font-body-small">(선택)</span>
                </label>
                <textarea
                  value={categoryCommentS}
                  onChange={(e) => setCategoryCommentS(e.target.value)}
                  placeholder="사회 관련 의견을 입력해주세요..."
                  className="w-full h-[80px] border border-[#dee2e6] rounded-[12px] p-[12px] font-body-medium resize-none focus:outline-none focus:border-[#003087]"
                />
              </div>

              <div>
                <label className="block font-title-small text-[#212529] mb-[8px]">
                  지배구조(G) 관련 의견 <span className="text-[#868e96] font-body-small">(선택)</span>
                </label>
                <textarea
                  value={categoryCommentG}
                  onChange={(e) => setCategoryCommentG(e.target.value)}
                  placeholder="지배구조 관련 의견을 입력해주세요..."
                  className="w-full h-[80px] border border-[#dee2e6] rounded-[12px] p-[12px] font-body-medium resize-none focus:outline-none focus:border-[#003087]"
                />
              </div>
            </div>

            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-[24px] py-[12px] bg-[#e9ecef] text-[#495057] rounded-[8px] font-title-small hover:bg-[#dee2e6] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleApproveWithComments}
                disabled={isMutating}
                className="px-[24px] py-[12px] bg-[#00ad1d] text-white rounded-[8px] font-title-small hover:bg-[#008a18] transition-colors disabled:opacity-50"
              >
                승인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[32px] w-[600px] max-w-[90%]">
            <div className="flex items-center justify-between mb-[24px]">
              <h3 className="font-heading-small text-[#212529]">
                보완 요청 사유 입력
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-[8px] hover:bg-[#f1f3f5] rounded-[8px] transition-colors"
              >
                <X className="w-[24px] h-[24px] text-[#868e96]" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="보완이 필요한 사항을 상세히 입력해주세요..."
              className="w-full h-[200px] border border-[#dee2e6] rounded-[12px] p-[16px] font-body-medium resize-none focus:outline-none focus:border-[#003087] mb-[24px]"
            />
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-[24px] py-[12px] bg-[#e9ecef] text-[#495057] rounded-[8px] font-title-small hover:bg-[#dee2e6] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRequestFix}
                disabled={isMutating || !rejectReason.trim()}
                className="px-[24px] py-[12px] bg-[#dc2626] text-white rounded-[8px] font-title-small hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
              >
                보완 요청 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

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

function SlotResultCard({ result }: { result: SlotResultDetail }) {
  const verdict = result.verdict as Verdict;
  const displayName = result.display_name || result.slot_name;

  return (
    <div className="p-[16px] bg-[#f8f9fa] rounded-[12px]">
      <div className="flex items-center justify-between mb-[8px]">
        <span className="font-title-small text-[#212529]">{displayName}</span>
        <span className={`px-[10px] py-[4px] rounded text-sm font-medium border ${VERDICT_STYLES[verdict]}`}>
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {result.reasons && result.reasons.length > 0 && (
        <ul className="space-y-[4px] mt-[8px]">
          {result.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-[6px] font-body-small text-[#868e96]">
              <span className="w-[4px] h-[4px] bg-[#adb5bd] rounded-full mt-[6px] flex-shrink-0" />
              {REASON_LABELS[reason] || reason}
            </li>
          ))}
        </ul>
      )}

      {result.file_names && result.file_names.length > 0 && (
        <div className="mt-[8px] flex flex-wrap gap-[6px]">
          {result.file_names.map((fileName, index) => (
            <span key={index} className="px-[8px] py-[2px] bg-white text-xs text-[#495057] rounded border border-[#dee2e6]">
              {fileName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
