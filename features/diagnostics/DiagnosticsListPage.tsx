import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagnosticsList } from '../../src/hooks/useDiagnostics';
import { useApprovals } from '../../src/hooks/useApprovals';
import { useReviews } from '../../src/hooks/useReviews';
import { useAuthStore } from '../../src/store/authStore';
import { useDomainGuard } from '../../src/hooks/useDomainGuard';
import type { DiagnosticStatus, ApprovalStatus, ReviewStatus } from '../../src/types/api.types';
import { DOMAIN_LABELS, DIAGNOSTIC_STATUS_LABELS, REVIEW_STATUS_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const STATUS_STYLES: Record<DiagnosticStatus, string> = {
  WRITING: 'bg-[#f1f3f5] text-[#495057] border-[#dee2e6]',
  SUBMITTED: 'bg-[#e3f2fd] text-[#002554] border-[#90caf9]',
  RETURNED: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
  APPROVED: 'bg-[#f0fdf4] text-[#008233] border-[#bbf7d0]',
  REVIEWING: 'bg-[#fff3e0] text-[#e65100] border-[#ffcc80]',
  COMPLETED: 'bg-[#f0fdf4] text-[#008233] border-[#bbf7d0]',
};

const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  WAITING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const APPROVAL_STATUS_STYLES: Record<ApprovalStatus, string> = {
  WAITING: 'bg-[#fff3e0] text-[#e65100] border-[#ffcc80]',
  APPROVED: 'bg-[#f0fdf4] text-[#008233] border-[#bbf7d0]',
  REJECTED: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
};

const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  REVIEWING: 'bg-[#e3f2fd] text-[#002554] border-[#90caf9]',
  APPROVED: 'bg-[#f0fdf4] text-[#008233] border-[#bbf7d0]',
  REVISION_REQUIRED: 'bg-[#fff3e0] text-[#e65100] border-[#ffcc80]',
};

type StatusFilter = DiagnosticStatus | 'ALL';
type ApprovalStatusFilter = ApprovalStatus | 'ALL';
type ReviewStatusFilter = ReviewStatus | 'ALL';

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

export default function DiagnosticsListPage() {
  const navigate = useNavigate();
  const { validatedDomainCode: domainCode } = useDomainGuard();
  const { user } = useAuthStore();

  // 현재 도메인에서의 역할 결정 (domainRoles 우선, 없으면 레거시 역할 사용)
  const userRole = useMemo((): 'drafter' | 'approver' | 'reviewer' => {
    // 도메인별 역할 확인
    if (domainCode && user?.domainRoles) {
      const domainRole = user.domainRoles.find((dr) => dr.domainCode === domainCode);
      if (domainRole) {
        if (domainRole.roleCode === 'REVIEWER') return 'reviewer';
        if (domainRole.roleCode === 'APPROVER') return 'approver';
        if (domainRole.roleCode === 'DRAFTER') return 'drafter';
      }
    }
    // 레거시 전역 역할 확인
    if (!user?.role?.code) return 'drafter';
    if (user.role.code === 'APPROVER') return 'approver';
    if (user.role.code === 'REVIEWER') return 'reviewer';
    return 'drafter';
  }, [domainCode, user?.domainRoles, user?.role?.code]);

  // 기안자용 상태
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);

  // 결재자용 상태
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<ApprovalStatusFilter>('ALL');

  // 수신자용 상태
  const [reviewStatusFilter, setReviewStatusFilter] = useState<ReviewStatusFilter>('ALL');

  // 데이터 조회
  const diagnosticsQuery = useDiagnosticsList(
    userRole === 'drafter'
      ? {
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          domainCode: domainCode || undefined,
          keyword: keyword || undefined,
          page,
          size: 10,
        }
      : undefined
  );

  const approvalsQuery = useApprovals(
    userRole === 'approver'
      ? {
          status: approvalStatusFilter === 'ALL' ? undefined : approvalStatusFilter,
          domainCode: domainCode || undefined,
          page,
          size: 10,
        }
      : undefined
  );

  const reviewsQuery = useReviews(
    userRole === 'reviewer'
      ? {
          status: reviewStatusFilter === 'ALL' ? undefined : reviewStatusFilter,
          domainCode: domainCode || undefined,
          page,
          size: 10,
        }
      : undefined
  );

  const isLoading =
    (userRole === 'drafter' && diagnosticsQuery.isLoading) ||
    (userRole === 'approver' && approvalsQuery.isLoading) ||
    (userRole === 'reviewer' && reviewsQuery.isLoading);

  const isError =
    (userRole === 'drafter' && diagnosticsQuery.isError) ||
    (userRole === 'approver' && approvalsQuery.isError) ||
    (userRole === 'reviewer' && reviewsQuery.isError);

  const getPageTitle = () => {
    if (domainCode) {
      return DOMAIN_LABELS[domainCode] || domainCode;
    }
    return '기안 관리';
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'WRITING', label: '작성중' },
    { key: 'SUBMITTED', label: '제출됨' },
    { key: 'RETURNED', label: '반려됨' },
    { key: 'APPROVED', label: '승인됨' },
    { key: 'REVIEWING', label: '심사중' },
    { key: 'COMPLETED', label: '완료' },
  ];

  const approvalStatusTabs: { key: ApprovalStatusFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'WAITING', label: '대기' },
    { key: 'APPROVED', label: '승인' },
    { key: 'REJECTED', label: '반려' },
  ];

  const reviewStatusTabs: { key: ReviewStatusFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'REVIEWING', label: '검토중' },
    { key: 'APPROVED', label: '적합' },
    { key: 'REVISION_REQUIRED', label: '보완필요' },
  ];

  const renderTableHeader = () => {
    if (userRole === 'approver') {
      return (
        <tr className="border-b border-[var(--color-border-default)] bg-gray-50">
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">기안자</th>
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">기안명</th>
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">요청일</th>
          <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">상태</th>
        </tr>
      );
    }

    if (userRole === 'reviewer') {
      return (
        <tr className="border-b border-[var(--color-border-default)] bg-gray-50">
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">제목</th>
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">회사명</th>
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">도메인</th>
          <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">제출일</th>
          <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">상태</th>
        </tr>
      );
    }

    // 기안자
    return (
      <tr className="border-b border-[var(--color-border-default)] bg-gray-50">
        <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">기안명</th>
        <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">캠페인</th>
        <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">기간</th>
        <th className="px-[16px] py-[12px] text-center font-title-xsmall text-[var(--color-text-secondary)]">상태</th>
      </tr>
    );
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={userRole === 'approver' ? 4 : 5} className="text-center py-[60px]">
            <div className="inline-block w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={userRole === 'approver' ? 4 : 5} className="text-center py-[60px]">
            <p className="font-body-medium text-[var(--color-state-error-text)]">
              데이터를 불러오는 데 실패했습니다.
            </p>
          </td>
        </tr>
      );
    }

    if (userRole === 'approver') {
      const items = approvalsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4} className="text-center py-[60px]">
              <p className="font-body-medium text-[var(--color-text-tertiary)]">
                대기 중인 결재가 없습니다.
              </p>
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.approvalId}
          onClick={() => navigate(`/approvals/${item.approvalId}`)}
          className="border-b border-[var(--color-border-default)] hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-primary)]">
            {item.requester?.name || '-'}
          </td>
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]">
            {item.diagnostic?.title || '-'}
          </td>
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-tertiary)]">
            {formatDate(item.requestedAt)}
          </td>
          <td className="px-[16px] py-[14px] text-center">
            <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${APPROVAL_STATUS_STYLES[item.status]}`}>
              {item.statusLabel || APPROVAL_STATUS_LABELS[item.status]}
            </span>
          </td>
        </tr>
      ));
    }

    if (userRole === 'reviewer') {
      const items = reviewsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={5} className="text-center py-[60px]">
              <p className="font-body-medium text-[var(--color-text-tertiary)]">
                심사 대상이 없습니다.
              </p>
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.reviewId}
          onClick={() => navigate(`/dashboard/${item.domainCode.toLowerCase()}/review/${item.reviewId}`)}
          className="border-b border-[var(--color-border-default)] hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-primary)]">
            {item.diagnostic?.title || '-'}
          </td>
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]">
            {item.company?.companyName || '-'}
          </td>
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]">
            {item.domainName || item.domainCode}
          </td>
          <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-tertiary)]">
            {formatDate(item.submittedAt)}
          </td>
          <td className="px-[16px] py-[14px] text-center">
            <span className={`inline-block px-[10px] py-[4px] rounded-full font-title-xsmall border ${REVIEW_STATUS_STYLES[item.status]}`}>
              {REVIEW_STATUS_LABELS[item.status]}
            </span>
          </td>
        </tr>
      ));
    }

    // 기안자
    const items = diagnosticsQuery.data?.content || [];
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="text-center py-[60px]">
            <p className="font-body-medium text-[var(--color-text-tertiary)]">
              기안 내역이 없습니다.
            </p>
          </td>
        </tr>
      );
    }
    return items.map((item) => (
      <tr
        key={item.diagnosticId}
        onClick={() => navigate(`/diagnostics/${item.diagnosticId}`)}
        className="border-b border-[var(--color-border-default)] hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-primary)]">
          {item.title || item.summary || '-'}
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
            {item.statusLabel || DIAGNOSTIC_STATUS_LABELS[item.status] || item.status}
          </span>
        </td>
      </tr>
    ));
  };

  const renderStatusTabs = () => {
    if (userRole === 'approver') {
      return (
        <div className="flex flex-wrap gap-[8px]">
          {approvalStatusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setApprovalStatusFilter(tab.key); setPage(0); }}
              className={`px-[16px] py-[8px] rounded-full font-title-xsmall transition-colors ${
                approvalStatusFilter === tab.key
                  ? 'bg-[var(--color-primary-main)] text-white'
                  : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      );
    }

    if (userRole === 'reviewer') {
      return (
        <div className="flex flex-wrap gap-[8px]">
          {reviewStatusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setReviewStatusFilter(tab.key); setPage(0); }}
              className={`px-[16px] py-[8px] rounded-full font-title-xsmall transition-colors ${
                reviewStatusFilter === tab.key
                  ? 'bg-[var(--color-primary-main)] text-white'
                  : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      );
    }

    // 기안자
    return (
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
    );
  };

  const getTotalPages = () => {
    if (userRole === 'approver') {
      return approvalsQuery.data?.page?.totalPages || 0;
    }
    if (userRole === 'reviewer') {
      return reviewsQuery.data?.page?.totalPages || 0;
    }
    return diagnosticsQuery.data?.page?.totalPages || 0;
  };

  const totalPages = getTotalPages();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1200px] mx-auto w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">{getPageTitle()}</h1>
          {userRole === 'drafter' && (
            <button
              onClick={() => navigate('/diagnostics/new')}
              className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
            >
              + 새 기안 생성
            </button>
          )}
        </div>

        {/* 필터 영역 */}
        <div className="flex flex-wrap items-center gap-[12px]">
          {renderStatusTabs()}

          {/* 검색 (기안자만) */}
          {userRole === 'drafter' && (
            <div className="flex gap-[8px] ml-auto">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { setKeyword(searchInput); setPage(0); }
                }}
                placeholder="검색어를 입력하세요"
                className="px-[12px] py-[8px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] bg-white w-[240px]"
              />
              <button
                onClick={() => { setKeyword(searchInput); setPage(0); }}
                className="px-[16px] py-[8px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-xsmall hover:opacity-90 transition-colors"
              >
                검색
              </button>
            </div>
          )}
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
          <table className="w-full">
            <thead>
              {renderTableHeader()}
            </thead>
            <tbody>
              {renderTableBody()}
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
