import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReviews, useBulkReport, useExportReviews } from '../../src/hooks/useReviews';
import type { ReviewStatus, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS, REVIEW_STATUS_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const STATUS_STYLES: Record<ReviewStatus, string> = {
  REVIEWING: 'text-[#002554] bg-[#e3f2fd]',
  APPROVED: 'text-[#008233] bg-[#f0fdf4]',
  REVISION_REQUIRED: 'text-[#e65100] bg-[#fff3e0]',
};

const RISK_BADGE_STYLES: Record<string, string> = {
  red: 'text-[#b91c1c] bg-[#fef2f2]',
  yellow: 'text-[#e65100] bg-[#fff3e0]',
  green: 'text-[#008233] bg-[#f0fdf4]',
};

type StatusFilter = ReviewStatus | 'ALL';

export default function ReviewsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const domainFilter = searchParams.get('domainCode') || '';
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading, isError } = useReviews({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    domainCode: domainFilter || undefined,
    page,
    size: 10,
  });

  const bulkReportMutation = useBulkReport();
  const exportMutation = useExportReviews();

  const reviews = data?.content || [];
  const totalPages = data?.page?.totalPages || 0;
  const dashboardData = data?.summary;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r.reviewId));
    }
  };

  const handleBulkReport = () => {
    if (selectedIds.length === 0) return;
    bulkReportMutation.mutate(selectedIds);
  };

  const handleExport = (format: 'EXCEL' | 'CSV') => {
    const ids = selectedIds.length > 0 ? selectedIds : reviews.map((r) => r.reviewId);
    exportMutation.mutate({ format, reviewIds: ids });
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'REVIEWING', label: '심사중' },
    { key: 'APPROVED', label: '승인' },
    { key: 'REVISION_REQUIRED', label: '보완요청' },
  ];

  const domainLabel = domainFilter ? (DOMAIN_LABELS[domainFilter as DomainCode] || domainFilter) : '';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1200px] mx-auto w-full">
        <h1 className="font-heading-small text-[var(--color-text-primary)]">
          {domainLabel ? `${domainLabel} 심사 관리` : '심사 관리'}
        </h1>

        {/* 대시보드 통계 */}
        {dashboardData && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-[16px]">
            {/* 총 협력사 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#dbeafe] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">총 협력사</p>
              <p className="font-title-large text-[#111827]">{dashboardData.totalCompanies}</p>
            </div>

            {/* 완료 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">완료</p>
              <p className="font-title-large text-[#16a34a]">{dashboardData.completedCount}</p>
            </div>

            {/* 진행중 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#dbeafe] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">진행중</p>
              <p className="font-title-large text-[#2563eb]">{dashboardData.inProgressCount}</p>
            </div>

            {/* 대기 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#f3f4f6] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">대기</p>
              <p className="font-title-large text-[#6b7280]">{dashboardData.pendingCount}</p>
            </div>

            {/* 고위험 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#fee2e2] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">고위험</p>
              <p className="font-title-large text-[#dc2626]">{dashboardData.highRiskCount}</p>
            </div>

            {/* 중위험 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#fef3c7] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">중위험</p>
              <p className="font-title-large text-[#d97706]">{dashboardData.mediumRiskCount}</p>
            </div>

            {/* 저위험 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm">
              <div className="w-[40px] h-[40px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">저위험</p>
              <p className="font-title-large text-[#16a34a]">{dashboardData.lowRiskCount}</p>
            </div>
          </div>
        )}

        {/* 필터 */}
        <div className="flex flex-wrap items-center gap-[12px]">
          <div className="flex gap-[8px]">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setPage(0); setSelectedIds([]); }}
                className={`px-[16px] py-[8px] rounded-full font-title-xsmall transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-[var(--color-primary-main)] text-white'
                    : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 액션 바 */}
        <div className="flex items-center justify-between">
          <p className="font-body-medium text-[var(--color-text-tertiary)]">
            {selectedIds.length > 0 ? `${selectedIds.length}건 선택됨` : ''}
          </p>
          <div className="flex gap-[8px]">
            <button
              onClick={handleBulkReport}
              disabled={selectedIds.length === 0 || bulkReportMutation.isPending}
              className="px-[16px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-title-xsmall text-[var(--color-text-secondary)] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {bulkReportMutation.isPending ? '생성 중...' : '일괄 리포트'}
            </button>
            <button
              onClick={() => handleExport('EXCEL')}
              disabled={exportMutation.isPending}
              className="px-[16px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-title-xsmall text-[var(--color-text-secondary)] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Excel
            </button>
            <button
              onClick={() => handleExport('CSV')}
              disabled={exportMutation.isPending}
              className="px-[16px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-title-xsmall text-[var(--color-text-secondary)] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              CSV
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-gray-50">
                <th className="px-[16px] py-[12px] w-[48px]">
                  <input
                    type="checkbox"
                    checked={reviews.length > 0 && selectedIds.length === reviews.length}
                    onChange={toggleSelectAll}
                    className="w-[16px] h-[16px] cursor-pointer"
                  />
                </th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">기안명</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">회사명</th>
                <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">위험등급</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">제출일</th>
                <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-[60px]">
                    <div className="inline-block w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6} className="text-center py-[60px]">
                    <p className="font-body-medium text-[var(--color-state-error-text)]">심사 목록을 불러오는 데 실패했습니다.</p>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-[60px]">
                    <p className="font-body-medium text-[var(--color-text-tertiary)]">심사 내역이 없습니다.</p>
                  </td>
                </tr>
              )}

              {reviews.map((item) => {
                const riskStyle = item.riskColorClass ? RISK_BADGE_STYLES[item.riskColorClass] : 'bg-gray-100 text-gray-600 border-gray-200';
                return (
                  <tr
                    key={item.reviewId}
                    className="border-b border-[var(--color-border-default)] hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-[16px] py-[14px]" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.reviewId)}
                        onChange={() => toggleSelect(item.reviewId)}
                        className="w-[16px] h-[16px] cursor-pointer"
                      />
                    </td>
                    <td
                      className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-primary)]"
                      onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}
                    >
                      {item.diagnostic?.title || item.reviewIdLabel || `R-${item.reviewId}`}
                    </td>
                    <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]" onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}>
                      {item.company?.companyName || '-'}
                    </td>
                    <td className="px-[16px] py-[14px] text-center" onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}>
                      {item.riskLevelLabel ? (
                        <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${riskStyle}`}>
                          {item.riskLevelLabel}
                        </span>
                      ) : (
                        <span className="font-body-medium text-[var(--color-text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-tertiary)]" onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}>
                      {new Date(item.submittedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-[16px] py-[14px] text-center" onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}>
                      <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${STATUS_STYLES[item.status]}`}>
                        {REVIEW_STATUS_LABELS[item.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] pt-[16px]">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-[12px] py-[8px] rounded-[8px] font-body-medium text-[var(--color-text-secondary)] hover:bg-gray-100 disabled:opacity-40"
            >
              이전
            </button>
            <span className="font-body-medium text-[var(--color-text-primary)]">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-[12px] py-[8px] rounded-[8px] font-body-medium text-[var(--color-text-secondary)] hover:bg-gray-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
