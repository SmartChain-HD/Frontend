import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApprovalDetail, useProcessApproval, useSubmitToReviewer } from '../../src/hooks/useApprovals';
import type { ApprovalStatus, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
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

const RISK_LABELS: Record<string, { label: string; style: string }> = {
  LOW: { label: '낮음', style: 'text-green-600' },
  MEDIUM: { label: '보통', style: 'text-yellow-600' },
  HIGH: { label: '높음', style: 'text-red-600' },
};

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const approvalId = Number(id);

  const { data: approval, isLoading, isError } = useApprovalDetail(approvalId);
  const processApprovalMutation = useProcessApproval();
  const submitToReviewerMutation = useSubmitToReviewer();

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
        },
      }
    );
  };

  const handleSubmitToReviewer = () => {
    submitToReviewerMutation.mutate(approvalId);
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
            onClick={() => navigate('/approvals')}
            className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isWaiting = approval.status === 'WAITING';
  const isApproved = approval.status === 'APPROVED';
  const risk = approval.riskLevel ? RISK_LABELS[approval.riskLevel] : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[900px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/approvals')}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>

        {/* 제목 + 상태 */}
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{approval.title}</h1>
          <span className={`shrink-0 inline-block px-[12px] py-[6px] rounded-full font-title-xsmall border ${STATUS_STYLES[approval.status]}`}>
            {STATUS_LABELS[approval.status]}
          </span>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <div className="grid grid-cols-2 gap-[20px]">
            <InfoRow label="도메인" value={DOMAIN_LABELS[approval.domainCode as DomainCode] || approval.domainCode} />
            <InfoRow label="회사명" value={approval.companyName} />
            <InfoRow label="기안자" value={approval.drafterName} />
            <InfoRow label="제출일" value={new Date(approval.submittedAt).toLocaleDateString('ko-KR')} />
            {risk && (
              <InfoRow label="위험 등급" value={risk.label} valueClassName={risk.style} />
            )}
            {approval.aiVerdict && (
              <InfoRow label="AI 판정" value={approval.aiVerdict} />
            )}
          </div>

          {approval.comment && (
            <div className="mt-[20px] pt-[20px] border-t border-[var(--color-border-default)]">
              <p className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px]">코멘트</p>
              <p className="font-body-medium text-[var(--color-text-primary)] whitespace-pre-wrap">{approval.comment}</p>
            </div>
          )}
        </div>

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
              승인
            </button>
          </div>
        )}

        {isApproved && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmitToReviewer}
              disabled={submitToReviewerMutation.isPending}
              className="px-[24px] py-[12px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {submitToReviewerMutation.isPending ? '제출 중...' : '원청에 제출'}
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
                {showModal === 'APPROVED' ? '결재 승인' : '결재 반려'}
              </h2>
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
                disabled={processApprovalMutation.isPending}
                className={`px-[20px] py-[10px] rounded-[8px] font-title-small text-white transition-colors disabled:opacity-50 ${
                  showModal === 'APPROVED'
                    ? 'bg-[var(--color-primary-main)] hover:opacity-90'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processApprovalMutation.isPending ? '처리 중...' : showModal === 'APPROVED' ? '승인' : '반려'}
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
