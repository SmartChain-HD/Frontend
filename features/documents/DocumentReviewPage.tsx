import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { AlertCircle, ArrowLeft, X } from 'lucide-react';
import { useReviewDetail, useSubmitReview } from '../../src/hooks/useReviews';

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

function getDomainPath(domainCode?: string): string {
  const domain = domainCode?.toLowerCase() || 'safety';
  return `/dashboard/${domain}`;
}

export default function DocumentReviewPage({ userRole }: DocumentReviewPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id) || 0;

  const { data: review, isLoading, isError } = useReviewDetail(reviewId);
  const submitReview = useSubmitReview();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const domainPath = getDomainPath(review?.domainCode);

  const handleBackToList = () => {
    navigate(domainPath);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleApprove = () => {
    submitReview.mutate(
      { id: reviewId, data: { decision: 'APPROVED' } },
      { onSuccess: () => navigate(domainPath) }
    );
  };

  const handleRequestFix = () => {
    if (!rejectReason.trim()) return;
    submitReview.mutate(
      { id: reviewId, data: { decision: 'REVISION_REQUIRED', comment: rejectReason } },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          navigate(domainPath);
        },
      }
    );
  };

  const handleSubmitToApprover = () => {
    submitReview.mutate(
      { id: reviewId, data: { decision: 'APPROVED' } },
      { onSuccess: () => navigate(domainPath) }
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
