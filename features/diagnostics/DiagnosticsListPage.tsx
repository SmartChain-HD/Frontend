import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagnosticsList } from '../../src/hooks/useDiagnostics';
import type { DiagnosticStatus, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  WRITING: '작성중',
  SUBMITTED: '제출됨',
  RETURNED: '반려됨',
  APPROVED: '승인됨',
  REVIEWING: '심사중',
  COMPLETED: '완료',
};

const STATUS_STYLES: Record<DiagnosticStatus, string> = {
  WRITING: 'bg-gray-50 text-gray-700 border-gray-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  RETURNED: 'bg-red-50 text-red-700 border-red-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REVIEWING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

type StatusFilter = DiagnosticStatus | 'ALL';

export default function DiagnosticsListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useDiagnosticsList({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    domainCode: domainFilter || undefined,
    page,
    size: 10,
  });

  const diagnostics = data?.content || [];
  const pageInfo = data?.page;
  const totalPages = pageInfo?.totalPages || 0;

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'WRITING', label: '작성중' },
    { key: 'SUBMITTED', label: '제출됨' },
    { key: 'RETURNED', label: '반려됨' },
    { key: 'APPROVED', label: '승인됨' },
    { key: 'REVIEWING', label: '심사중' },
    { key: 'COMPLETED', label: '완료' },
  ];

  const domainOptions: { value: string; label: string }[] = [
    { value: '', label: '전체 도메인' },
    { value: 'ESG', label: DOMAIN_LABELS.ESG },
    { value: 'SAFETY', label: DOMAIN_LABELS.SAFETY },
    { value: 'COMPLIANCE', label: DOMAIN_LABELS.COMPLIANCE },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1200px] mx-auto w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">진단 관리</h1>
          <button
            onClick={() => navigate('/diagnostics/new')}
            className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
          >
            + 새 진단 생성
          </button>
        </div>

        {/* 필터 영역 */}
        <div className="flex flex-wrap items-center gap-[12px]">
          {/* 상태 탭 */}
          <div className="flex flex-wrap gap-[8px]">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setPage(0); }}
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

          {/* 도메인 필터 */}
          <select
            value={domainFilter}
            onChange={(e) => { setDomainFilter(e.target.value); setPage(0); }}
            className="px-[12px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] bg-white"
          >
            {domainOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-gray-50">
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">제목</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">도메인</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">회사명</th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">기간</th>
                <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-[60px]">
                    <div className="inline-block w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={5} className="text-center py-[60px]">
                    <div className="flex flex-col items-center gap-[12px]">
                      <p className="font-body-medium text-[var(--color-state-error-text)]">
                        진단 목록을 불러오는 데 실패했습니다.
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
                      >
                        다시 시도
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && diagnostics.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-[60px]">
                    <p className="font-body-medium text-[var(--color-text-tertiary)]">
                      진단 내역이 없습니다.
                    </p>
                  </td>
                </tr>
              )}

              {diagnostics.map((item) => (
                <tr
                  key={item.diagnosticId}
                  onClick={() => navigate(`/diagnostics/${item.diagnosticId}`)}
                  className="border-b border-[var(--color-border-default)] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-primary)]">
                    {item.summary || item.campaign?.title || '-'}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]">
                    {item.domain?.name || DOMAIN_LABELS[item.domain?.code as DomainCode] || '-'}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]">
                    {item.campaign?.title || '-'}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-tertiary)]">
                    {item.period?.startDate && item.period?.endDate
                      ? `${item.period.startDate} ~ ${item.period.endDate}`
                      : '-'}
                  </td>
                  <td className="px-[16px] py-[14px] text-center">
                    <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${STATUS_STYLES[item.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {item.statusLabel || STATUS_LABELS[item.status] || item.status}
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
