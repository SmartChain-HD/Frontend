import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviews, useBulkReport, useExportReviews } from '../../src/hooks/useReviews';
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

const RISK_STYLES: Record<RiskLevel, string> = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-red-600',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
};

type StatusFilter = ReviewStatus | 'ALL';
type RiskFilter = RiskLevel | 'ALL';

export default function ReviewsListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [domainFilter, setDomainFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading, isError } = useReviews({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    domainCode: domainFilter || undefined,
    riskLevel: riskFilter === 'ALL' ? undefined : riskFilter,
    page,
    size: 10,
  });

  const bulkReportMutation = useBulkReport();
  const exportMutation = useExportReviews();

  const reviews = data?.content || [];
  const totalPages = data?.page?.totalPages || 0;

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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1200px] mx-auto w-full">
        <h1 className="font-heading-small text-[var(--color-text-primary)]">심사 관리</h1>

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

          <select
            value={domainFilter}
            onChange={(e) => { setDomainFilter(e.target.value); setPage(0); }}
            className="px-[12px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] bg-white"
          >
            <option value="">전체 도메인</option>
            <option value="ESG">{DOMAIN_LABELS.ESG}</option>
            <option value="SAFETY">{DOMAIN_LABELS.SAFETY}</option>
            <option value="COMPLIANCE">{DOMAIN_LABELS.COMPLIANCE}</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value as RiskFilter); setPage(0); }}
            className="px-[12px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] bg-white"
          >
            <option value="ALL">전체 위험등급</option>
            <option value="LOW">낮음</option>
            <option value="MEDIUM">보통</option>
            <option value="HIGH">높음</option>
          </select>
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
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">제목</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">도메인</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">회사명</th>
                <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">위험등급</th>
                <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">점수</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">제출일</th>
                <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="text-center py-[60px]">
                    <div className="inline-block w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={8} className="text-center py-[60px]">
                    <p className="font-body-medium text-[var(--color-state-error-text)]">심사 목록을 불러오는 데 실패했습니다.</p>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && reviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-[60px]">
                    <p className="font-body-medium text-[var(--color-text-tertiary)]">심사 내역이 없습니다.</p>
                  </td>
                </tr>
              )}

              {reviews.map((item) => (
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
                    onClick={() => navigate(`/reviews/${item.reviewId}`)}
                  >
                    {item.title}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]" onClick={() => navigate(`/reviews/${item.reviewId}`)}>
                    {DOMAIN_LABELS[item.domainCode as DomainCode] || item.domainCode}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]" onClick={() => navigate(`/reviews/${item.reviewId}`)}>
                    {item.companyName}
                  </td>
                  <td className="px-[16px] py-[14px] text-center" onClick={() => navigate(`/reviews/${item.reviewId}`)}>
                    {item.riskLevel ? (
                      <span className={`font-title-xsmall ${RISK_STYLES[item.riskLevel]}`}>
                        {RISK_LABELS[item.riskLevel]}
                      </span>
                    ) : (
                      <span className="font-body-medium text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="px-[16px] py-[14px] text-center font-body-medium text-[var(--color-text-primary)]" onClick={() => navigate(`/reviews/${item.reviewId}`)}>
                    {item.score != null ? item.score : '-'}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-tertiary)]" onClick={() => navigate(`/reviews/${item.reviewId}`)}>
                    {new Date(item.submittedAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-[16px] py-[14px] text-center" onClick={() => navigate(`/reviews/${item.reviewId}`)}>
                    <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${STATUS_STYLES[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                </tr>
              ))}
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
