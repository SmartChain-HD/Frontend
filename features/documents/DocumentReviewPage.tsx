import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { AlertCircle, ArrowLeft, X, FileText, Download, Bot } from 'lucide-react';
import { useReviewDetail, useSubmitReview } from '../../src/hooks/useReviews';
import { useAiResult } from '../../src/hooks/useAiRun';
import { useDiagnosticHistory } from '../../src/hooks/useDiagnostics';
import type { DomainCode, DiagnosticStatus } from '../../src/types/api.types';
import { DOMAIN_LABELS, DIAGNOSTIC_STATUS_LABELS } from '../../src/types/api.types';
import type { SlotResultDetail } from '../../src/api/aiRun';

interface DocumentReviewPageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

const riskLevelConfig: Record<string, { label: string; cardBg: string; iconBg: string; textColor: string }> = {
  HIGH: {
    label: '고위험',
    cardBg: '#fef2f2',
    iconBg: '#dc2626',
    textColor: '#b91c1c',
  },
  MEDIUM: {
    label: '중위험',
    cardBg: '#fffbeb',
    iconBg: '#f59e0b',
    textColor: '#b45309',
  },
  LOW: {
    label: '저위험',
    cardBg: '#ecfdf5',
    iconBg: '#10b981',
    textColor: '#047857',
  },
};

const aiVerdictConfig: Record<string, { label: string; cardBg: string; iconBg: string; textColor: string; icon: string }> = {
  PASS: {
    label: '적합',
    cardBg: '#ecfdf5',
    iconBg: '#10b981',
    textColor: '#047857',
    icon: '✓',
  },
  NEED_FIX: {
    label: '보완 필요',
    cardBg: '#fffbeb',
    iconBg: '#f59e0b',
    textColor: '#b45309',
    icon: '!',
  },
  FAIL: {
    label: '부적합',
    cardBg: '#fef2f2',
    iconBg: '#dc2626',
    textColor: '#b91c1c',
    icon: '✕',
  },
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

function getListPath(userRole: string, domainCode?: string): string {
  const domain = domainCode?.toUpperCase() || 'ESG';
  if (userRole === 'receiver') {
    return `/reviews?domainCode=${domain}`;
  }
  return `/diagnostics?domainCode=${domain}`;
}

export default function DocumentReviewPage({ userRole }: DocumentReviewPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id) || 0;

  const { data: review, isLoading, isError } = useReviewDetail(reviewId);
  const diagnosticId = review?.diagnostic?.diagnosticId ?? 0;
  const { data: aiResult } = useAiResult(diagnosticId);
  const { data: history } = useDiagnosticHistory(diagnosticId);
  const submitReview = useSubmitReview();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showConfirmApproveModal, setShowConfirmApproveModal] = useState(false);
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
      setShowConfirmApproveModal(true);
    }
  };

  const handleConfirmApprove = () => {
    setShowConfirmApproveModal(false);
    submitReview.mutate(
      { id: reviewId, data: { decision: 'APPROVED' } },
      { onSuccess: () => navigate(listPath) }
    );
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

  // AI 분석 결과에서 riskLevel과 verdict 가져오기 (aiResult 우선, 없으면 review에서)
  const riskLevel = aiResult?.riskLevel ?? review.riskLevel ?? 'MEDIUM';
  const riskConfig = riskLevelConfig[riskLevel] ?? riskLevelConfig.MEDIUM;
  const aiVerdict = aiResult?.verdict ?? review.aiVerdict ?? 'NEED_FIX';
  const verdictConfig = aiVerdictConfig[aiVerdict] ?? aiVerdictConfig.NEED_FIX;
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

          {/* AI 분석 결과 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[24px]">
            {/* 위험등급 카드 */}
            <div
              className="relative overflow-hidden rounded-[20px] p-[24px] shadow-sm"
              style={{ backgroundColor: riskConfig.cardBg }}
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] -mr-[40px] -mt-[40px] rounded-full bg-white/40"></div>
              <div className="relative">
                <div
                  className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center mb-[16px]"
                  style={{ backgroundColor: riskConfig.iconBg, boxShadow: `0 8px 16px ${riskConfig.iconBg}40` }}
                >
                  <AlertCircle className="w-[24px] h-[24px] text-white" />
                </div>
                <p className="font-body-small text-[#6b7280] mb-[4px]">위험등급</p>
                <p className="font-heading-medium" style={{ color: riskConfig.textColor }}>{riskConfig.label}</p>
              </div>
            </div>

            {/* AI 판정 카드 */}
            <div
              className="relative overflow-hidden rounded-[20px] p-[24px] shadow-sm"
              style={{ backgroundColor: verdictConfig.cardBg }}
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] -mr-[40px] -mt-[40px] rounded-full bg-white/40"></div>
              <div className="relative">
                <div
                  className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center mb-[16px]"
                  style={{ backgroundColor: verdictConfig.iconBg, boxShadow: `0 8px 16px ${verdictConfig.iconBg}40` }}
                >
                  <span className="font-title-large text-white">{verdictConfig.icon}</span>
                </div>
                <p className="font-body-small text-[#6b7280] mb-[4px]">AI 판정</p>
                <p className="font-heading-medium" style={{ color: verdictConfig.textColor }}>{verdictConfig.label}</p>
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

          {/* 기안 이력 타임라인 */}
          {history && history.length > 0 && (
            <div className="bg-white rounded-[16px] border border-[#dee2e6] p-[24px] mb-[24px]">
              <h2 className="font-title-medium text-[#212529] mb-[20px]">기안 이력</h2>
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
                        <span className="font-title-small text-[#212529]">{DIAGNOSTIC_STATUS_LABELS[item.newStatus]}</span>
                        {isLatest && <span className="px-[6px] py-[1px] font-label-xsmall font-semibold rounded-full bg-[#dbeafe] text-[#1d4ed8]">최신</span>}
                      </h3>
                      <p className="font-body-small text-[#868e96]">{item.performedBy.name}</p>
                      {item.comment && (
                        <div className="p-[12px] mt-[8px] rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb]">
                          <p className="font-body-small text-[#495057] whitespace-pre-wrap">{item.comment}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
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
                {review.domainCode === 'COMPLIANCE' && (
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/compliance/review/${reviewId}/ai-analysis?diagnosticId=${diagnosticId}&domain=compliance`
                      )
                    }
                    className="px-[32px] py-[14px] bg-[#003087] text-white rounded-[8px] font-title-small hover:bg-[#002554] transition-colors flex items-center gap-[8px]"
                  >
                    <Bot className="w-[20px] h-[20px]" />
                    AI 문서 분석
                  </button>
                )}
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

      {/* Confirm Approve Modal (SAFETY/COMPLIANCE) */}
      {showConfirmApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[32px] w-[480px] max-w-[90%]">
            <h3 className="font-heading-small text-[#212529] mb-[16px]">
              승인 확인
            </h3>
            <p className="font-body-medium text-[#495057] mb-[24px]">
              이 문서를 승인하시겠습니까? 승인 후에는 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setShowConfirmApproveModal(false)}
                className="px-[24px] py-[12px] bg-[#e9ecef] text-[#495057] rounded-[8px] font-title-small hover:bg-[#dee2e6] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmApprove}
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
    <div className="p-[20px] bg-[#f8f9fa] rounded-[12px]">
      <div className="flex items-center justify-between mb-[12px]">
        <span className="font-title-medium text-[#212529]">{displayName}</span>
        <span className={`px-[12px] py-[6px] rounded-[6px] font-title-small border ${VERDICT_STYLES[verdict]}`}>
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {result.reasons && result.reasons.length > 0 && (
        <ul className="space-y-[8px] mt-[12px]">
          {result.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-[8px] font-body-medium text-[#868e96]">
              <span className="w-[5px] h-[5px] bg-[#adb5bd] rounded-full mt-[10px] flex-shrink-0" />
              {REASON_LABELS[reason] || reason}
            </li>
          ))}
        </ul>
      )}

      {result.file_names && result.file_names.length > 0 && (
        <div className="mt-[12px] flex flex-wrap gap-[8px]">
          {result.file_names.map((fileName, index) => (
            <span key={index} className="px-[12px] py-[6px] bg-white font-body-medium text-[#495057] rounded-[6px] border border-[#dee2e6]">
              {fileName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
