import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReviews } from '../../src/hooks/useReviews';
import type { ReviewStatus, RiskLevel, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const STATUS_STYLES: Record<ReviewStatus, string> = {
  REVIEWING: 'text-[#002554] bg-[#e3f2fd]',
  APPROVED: 'text-[#008233] bg-[#f0fdf4]',
  REVISION_REQUIRED: 'text-[#e65100] bg-[#fff3e0]',
};

const RISK_LEVEL_CONFIG: Record<string, { label: string; style: string }> = {
  HIGH: { label: '고위험', style: 'text-[#b91c1c] bg-[#fef2f2]' },
  MEDIUM: { label: '중위험', style: 'text-[#e65100] bg-[#fff3e0]' },
  LOW: { label: '저위험', style: 'text-[#008233] bg-[#f0fdf4]' },
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  REVIEWING: '심사중',
  APPROVED: '승인됨',
  REVISION_REQUIRED: '보완됨',
};

type StatusFilter = ReviewStatus | 'ALL';

export default function ReviewsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');
  const urlRiskLevel = searchParams.get('riskLevel');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    if (urlStatus && ['REVIEWING', 'APPROVED', 'REVISION_REQUIRED'].includes(urlStatus)) {
      return urlStatus as ReviewStatus;
    }
    return 'ALL';
  });
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskLevel | undefined>(() => {
    if (urlRiskLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(urlRiskLevel)) {
      return urlRiskLevel as RiskLevel;
    }
    return undefined;
  });
  const domainFilter = searchParams.get('domainCode') || '';
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading, isError } = useReviews({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    riskLevel: riskLevelFilter,
    domainCode: domainFilter || undefined,
    page,
    size: 10,
  });

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

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'REVIEWING', label: '심사중' },
    { key: 'APPROVED', label: '승인됨' },
    { key: 'REVISION_REQUIRED', label: '보완됨' },
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
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

            {/* 심사중 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setStatusFilter('REVIEWING'); setPage(0); setSelectedIds([]); }}>
              <div className="w-[40px] h-[40px] rounded-full bg-[#dbeafe] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">심사중</p>
              <p className="font-title-large text-[#2563eb]">{dashboardData.inProgressCount}</p>
            </div>

            {/* 승인됨 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setStatusFilter('APPROVED'); setPage(0); setSelectedIds([]); }}>
              <div className="w-[40px] h-[40px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">승인됨</p>
              <p className="font-title-large text-[#16a34a]">{dashboardData.completedCount}</p>
            </div>

            {/* 보완됨 */}
            <div className="bg-white rounded-[16px] p-[20px] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setStatusFilter('REVISION_REQUIRED'); setPage(0); setSelectedIds([]); }}>
              <div className="w-[40px] h-[40px] rounded-full bg-[#fff3e0] flex items-center justify-center mb-[12px]">
                <svg className="w-[20px] h-[20px] text-[#e65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="font-body-small text-[#6b7280] mb-[4px]">보완됨</p>
              <p className="font-title-large text-[#e65100]">{dashboardData.pendingCount}</p>
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

          {/* 위험등급 드롭다운 */}
          <select
            value={riskLevelFilter || ''}
            onChange={(e) => { setRiskLevelFilter((e.target.value || undefined) as RiskLevel | undefined); setPage(0); setSelectedIds([]); }}
            className="px-[12px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-title-xsmall text-[var(--color-text-secondary)] bg-white"
          >
            <option value="">위험등급: 전체</option>
            <option value="HIGH">고위험</option>
            <option value="MEDIUM">중위험</option>
            <option value="LOW">저위험</option>
          </select>
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
                const riskConfig = item.riskLevel ? RISK_LEVEL_CONFIG[item.riskLevel] : null;
                const riskLabel = riskConfig?.label || item.riskLevelLabel;
                const riskStyle = riskConfig?.style || (item.riskColorClass ? `text-[#6b7280] bg-gray-100` : '');
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
                      {riskLabel ? (
                        <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${riskStyle}`}>
                          {riskLabel}
                        </span>
                      ) : (
                        <span className="font-body-medium text-[var(--color-text-tertiary)]">미분석</span>
                      )}
                    </td>
                    <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-tertiary)]" onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}>
                      {new Date(item.submittedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-[16px] py-[14px] text-center" onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}>
                      <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${STATUS_STYLES[item.status]}`}>
                        {STATUS_LABELS[item.status]}
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
