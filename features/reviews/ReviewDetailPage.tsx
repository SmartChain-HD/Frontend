import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviewDetail, useSubmitReview, useGenerateReport } from '../../src/hooks/useReviews';
import type { ReviewStatus, RiskLevel, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  REVIEWING: '심사중',
  APPROVED: '승인',
  REVISION_REQUIRED: '보완요청',
};

const STATUS_STYLES: Record<ReviewStatus, string> = {
  REVIEWING: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REVISION_REQUIRED: 'bg-orange-50 text-orange-700 border-orange-200',
};

const RISK_LABELS: Record<string, { label: string; style: string }> = {
  LOW: { label: '낮음', style: 'text-green-600' },
  MEDIUM: { label: '보통', style: 'text-yellow-600' },
  HIGH: { label: '높음', style: 'text-red-600' },
};

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reviewId = Number(id);

  const { data: review, isLoading, isError } = useReviewDetail(reviewId);
  const submitReviewMutation = useSubmitReview();
  const generateReportMutation = useGenerateReport();

  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REVISION_REQUIRED'>('APPROVED');
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [categoryE, setCategoryE] = useState('');
  const [categoryS, setCategoryS] = useState('');
  const [categoryG, setCategoryG] = useState('');

  const handleSubmit = () => {
    submitReviewMutation.mutate(
      {
        id: reviewId,
        data: {
          decision,
          score: score ? Number(score) : undefined,
          comment: comment || undefined,
          categoryCommentE: categoryE || undefined,
          categoryCommentS: categoryS || undefined,
          categoryCommentG: categoryG || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setScore('');
    setComment('');
    setCategoryE('');
    setCategoryS('');
    setCategoryG('');
  };

  const handleGenerateReport = () => {
    generateReportMutation.mutate(reviewId);
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

  if (isError || !review) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <p className="font-body-medium text-[var(--color-state-error-text)]">심사 정보를 불러오는 데 실패했습니다.</p>
          <button onClick={() => navigate('/reviews')} className="font-title-xsmall text-[var(--color-primary-main)] hover:underline">
            목록으로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isReviewing = review.status === 'REVIEWING';
  const risk = review.riskLevel ? RISK_LABELS[review.riskLevel] : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[900px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/reviews')}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>

        {/* 제목 + 상태 */}
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{review.reviewIdLabel || `R-${review.reviewId}`}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[review.status]}`}>
            {STATUS_LABELS[review.status]}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="도메인" value={review.domainName || DOMAIN_LABELS[review.domainCode as DomainCode] || review.domainCode} />
            <InfoRow label="회사명" value={review.company?.companyName || '-'} />
            <InfoRow label="기안코드" value={review.diagnostic?.diagnosticCode || '-'} />
            <InfoRow label="제출일" value={new Date(review.submittedAt).toLocaleDateString('ko-KR')} />
            {risk && <InfoRow label="위험 등급" value={risk.label} valueClassName={risk.style} />}
            {review.score != null && <InfoRow label="점수" value={String(review.score)} />}
          </div>
        </div>

        {/* AI 분석 결과 */}
        {(review.aiVerdict || review.whySummary) && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[16px]">AI 분석 결과</h2>
            {review.aiVerdict && (
              <div className="mb-[12px]">
                <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">AI 판정</p>
                <p className="font-body-medium text-[var(--color-text-primary)]">{review.aiVerdict}</p>
              </div>
            )}
            {review.whySummary && (
              <div>
                <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">판정 근거</p>
                <p className="font-body-medium text-[var(--color-text-primary)] whitespace-pre-wrap">{review.whySummary}</p>
              </div>
            )}
          </div>
        )}

        {/* 카테고리별 코멘트 (이미 제출된 경우) */}
        {(review.categoryCommentE || review.categoryCommentS || review.categoryCommentG) && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <h2 className="font-title-medium text-[var(--color-text-primary)] mb-[16px]">카테고리별 의견</h2>
            <div className="flex flex-col gap-[12px]">
              {review.categoryCommentE && <CategoryComment label="E (환경)" value={review.categoryCommentE} />}
              {review.categoryCommentS && <CategoryComment label="S (사회)" value={review.categoryCommentS} />}
              {review.categoryCommentG && <CategoryComment label="G (지배구조)" value={review.categoryCommentG} />}
            </div>
          </div>
        )}

        {/* 코멘트 */}
        {review.comment && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">심사 코멘트</p>
            <p className="font-body-medium text-[var(--color-text-primary)] whitespace-pre-wrap">{review.comment}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-[12px] justify-end">
          {!isReviewing && (
            <button
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              className="px-[24px] py-[12px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {generateReportMutation.isPending ? '생성 중...' : '리포트 생성'}
            </button>
          )}
          {isReviewing && (
            <>
              <button
                onClick={() => { setDecision('REVISION_REQUIRED'); setShowModal(true); }}
                className="px-[24px] py-[12px] rounded-[8px] border border-orange-300 text-orange-600 font-title-small hover:bg-orange-50 transition-colors"
              >
                보완요청
              </button>
              <button
                onClick={() => { setDecision('APPROVED'); setShowModal(true); }}
                className="px-[24px] py-[12px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
              >
                승인
              </button>
            </>
          )}
        </div>
      </div>

      {/* 심사 결과 제출 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[560px] mx-[16px] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                {decision === 'APPROVED' ? '심사 승인' : '보완 요청'}
              </h2>
            </div>

            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              {/* 점수 */}
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">점수 (선택)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0 ~ 100"
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>

              {/* 코멘트 */}
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">코멘트 (선택)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="코멘트를 입력하세요"
                  rows={3}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>

              {/* 카테고리별 의견 */}
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">E (환경) 의견</label>
                <textarea
                  value={categoryE}
                  onChange={(e) => setCategoryE(e.target.value)}
                  placeholder="환경 관련 의견"
                  rows={2}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">S (사회) 의견</label>
                <textarea
                  value={categoryS}
                  onChange={(e) => setCategoryS(e.target.value)}
                  placeholder="사회 관련 의견"
                  rows={2}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">G (지배구조) 의견</label>
                <textarea
                  value={categoryG}
                  onChange={(e) => setCategoryG(e.target.value)}
                  placeholder="지배구조 관련 의견"
                  rows={2}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-primary-main)]"
                />
              </div>
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitReviewMutation.isPending}
                className={`px-[20px] py-[10px] rounded-[8px] font-title-small text-white transition-colors disabled:opacity-50 ${
                  decision === 'APPROVED'
                    ? 'bg-[var(--color-primary-main)] hover:opacity-90'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {submitReviewMutation.isPending ? '처리 중...' : decision === 'APPROVED' ? '승인' : '보완요청'}
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

function CategoryComment({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-title-xsmall text-[var(--color-text-secondary)] mb-[4px]">{label}</p>
      <p className="font-body-medium text-[var(--color-text-primary)] whitespace-pre-wrap">{value}</p>
    </div>
  );
}
