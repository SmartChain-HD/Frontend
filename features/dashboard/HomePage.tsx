import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { useDiagnosticsList } from '../../src/hooks/useDiagnostics';
import { useApprovals } from '../../src/hooks/useApprovals';
import { useReviewsDashboard, useReviews } from '../../src/hooks/useReviews';
import type { DiagnosticStatus, ApprovalStatus, ReviewStatus } from '../../src/types/api.types';

interface HomePageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

type DomainCode = 'SAFETY' | 'COMPLIANCE' | 'ESG';

const domainTabs: { key: DomainCode; label: string }[] = [
  { key: 'SAFETY', label: '안전보건' },
  { key: 'COMPLIANCE', label: '컴플라이언스' },
  { key: 'ESG', label: 'ESG' },
];

const diagnosticStatusLabels: Record<DiagnosticStatus, string> = {
  WRITING: '작성중',
  SUBMITTED: '제출됨',
  RETURNED: '반려됨',
  APPROVED: '승인',
  REVIEWING: '검토중',
  COMPLETED: '완료',
};

const diagnosticStatusColors: Record<DiagnosticStatus, string> = {
  WRITING: 'text-[#495057] bg-[#f1f3f5]',
  SUBMITTED: 'text-[#002554] bg-[#e3f2fd]',
  RETURNED: 'text-[#b91c1c] bg-[#fef2f2]',
  APPROVED: 'text-[#008233] bg-[#f0fdf4]',
  REVIEWING: 'text-[#e65100] bg-[#fff3e0]',
  COMPLETED: 'text-[#008233] bg-[#f0fdf4]',
};

const approvalStatusLabels: Record<ApprovalStatus, string> = {
  WAITING: '대기중',
  APPROVED: '승인',
  REJECTED: '반려',
};

const approvalStatusColors: Record<ApprovalStatus, string> = {
  WAITING: 'text-[#e65100] bg-[#fff3e0]',
  APPROVED: 'text-[#008233] bg-[#f0fdf4]',
  REJECTED: 'text-[#b91c1c] bg-[#fef2f2]',
};

const reviewStatusLabels: Record<ReviewStatus, string> = {
  REVIEWING: '검토중',
  APPROVED: '적합',
  REVISION_REQUIRED: '보완필요',
};

const reviewStatusColors: Record<ReviewStatus, string> = {
  REVIEWING: 'text-[#002554] bg-[#e3f2fd]',
  APPROVED: 'text-[#008233] bg-[#f0fdf4]',
  REVISION_REQUIRED: 'text-[#e65100] bg-[#fff3e0]',
};

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-gray-500 font-body-medium">{message}</p>
    </div>
  );
}

// Error State Component
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-red-500 font-body-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#003087] text-white rounded-lg hover:bg-[#002554] transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

// Notification Feed Component
function NotificationFeed() {
  const notifications = [
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
  ];

  return (
    <div className="bg-white rounded-[20px] p-[44px] h-[555px] overflow-auto">
      <p className="font-title-large text-[#212529] mb-[32px]">
        실시간 알림 피드
      </p>
      <div className="relative">
        {notifications.map((notif, index) => (
          <div key={index} className="relative mb-[32px] pl-[28px]">
            {/* Timeline dot */}
            <div className="absolute left-0 top-[2px] w-[16px] h-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="5" fill="#DC2626" />
              </svg>
            </div>
            {/* Timeline line */}
            {index < notifications.length - 1 && (
              <div className="absolute left-[7.5px] top-[18px] w-[1px] h-[32px] bg-[#ADB5BD]" />
            )}
            {/* Content */}
            <div>
              <p className="font-body-small text-[#adb5bd] mb-[8px]">{notif.time}</p>
              <p className="font-body-medium text-[#212529]">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Format date helper
function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

export default function HomePage({ userRole }: HomePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DomainCode>('SAFETY');

  // API calls based on user role
  const diagnosticsQuery = useDiagnosticsList(
    userRole === 'drafter' ? { domainCode: activeTab, size: 10 } : undefined
  );

  const approvalsQuery = useApprovals(
    userRole === 'approver' ? { domainCode: activeTab, size: 10 } : undefined
  );

  const reviewsDashboardQuery = useReviewsDashboard();
  const reviewsListQuery = useReviews(
    userRole === 'receiver' ? { domainCode: activeTab, size: 10 } : undefined
  );

  // Calculate stats for DRAFTER from diagnostics data
  const drafterStats = useMemo(() => {
    const content = diagnosticsQuery.data?.content || [];
    const statusCounts = content.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: '미제출', value: String(statusCounts['WRITING'] || 0), color: 'text-[#b91c1c]' },
      { label: '검토중', value: String((statusCounts['SUBMITTED'] || 0) + (statusCounts['REVIEWING'] || 0)), color: 'text-[#002554]' },
      { label: '보완요청', value: String(statusCounts['RETURNED'] || 0), color: 'text-[#e65100]' },
      { label: '완료', value: String((statusCounts['APPROVED'] || 0) + (statusCounts['COMPLETED'] || 0)), color: 'text-[#008233]' },
    ];
  }, [diagnosticsQuery.data]);

  // Calculate stats for APPROVER from approvals data
  const approverStats = useMemo(() => {
    const content = approvalsQuery.data?.content || [];
    const statusCounts = content.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: '대기중', value: String(statusCounts['WAITING'] || 0), color: 'text-[#e65100]' },
      { label: '승인', value: String(statusCounts['APPROVED'] || 0), color: 'text-[#008233]' },
      { label: '반려', value: String(statusCounts['REJECTED'] || 0), color: 'text-[#b91c1c]' },
    ];
  }, [approvalsQuery.data]);

  // Stats for REVIEWER from dashboard API
  const reviewerStats = useMemo(() => {
    const dashboard = reviewsDashboardQuery.data;
    if (!dashboard) return [];

    return [
      { label: '전체 협력사', value: String(dashboard.totalCompanies || 0), color: 'text-[#212529]' },
      { label: '미제출', value: String(dashboard.notSubmitted || 0), color: 'text-[#b91c1c]' },
      { label: '검토중', value: String(dashboard.reviewing || 0), color: 'text-[#002554]' },
      { label: '보완요청', value: String(dashboard.revisionRequired || 0), color: 'text-[#e65100]' },
      { label: '완료', value: String(dashboard.completed || 0), color: 'text-[#008233]' },
    ];
  }, [reviewsDashboardQuery.data]);

  // Get current stats based on role
  const currentStats = useMemo(() => {
    switch (userRole) {
      case 'drafter':
        return drafterStats;
      case 'approver':
        return approverStats;
      case 'receiver':
        return reviewerStats;
      default:
        return [];
    }
  }, [userRole, drafterStats, approverStats, reviewerStats]);

  // Get loading/error state based on role
  const { isLoading, isError, refetch } = useMemo(() => {
    switch (userRole) {
      case 'drafter':
        return diagnosticsQuery;
      case 'approver':
        return approvalsQuery;
      case 'receiver':
        return reviewsListQuery;
      default:
        return { isLoading: false, isError: false, refetch: () => {} };
    }
  }, [userRole, diagnosticsQuery, approvalsQuery, reviewsListQuery]);

  const handleCreateDraft = () => {
    navigate('/diagnostics/new');
  };

  const handleRowClick = (id: number, domain: string) => {
    const domainPath = domain.toLowerCase();
    navigate(`/dashboard/${domainPath}/review/${id}`);
  };

  // Render table content based on role
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="py-8">
            <LoadingSkeleton />
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={4}>
            <ErrorState message="데이터를 불러오는데 실패했습니다." onRetry={() => refetch()} />
          </td>
        </tr>
      );
    }

    // DRAFTER - Diagnostics
    if (userRole === 'drafter') {
      const items = diagnosticsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4}>
              <EmptyState message="등록된 기안이 없습니다." />
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.diagnosticId}
          className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
          onClick={() => handleRowClick(item.diagnosticId, item.domainCode)}
        >
          <td className="py-[16px] px-[16px] font-body-small text-[#212529]">
            {item.companyName || '-'}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {item.title}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {formatDate(item.submittedAt)}
          </td>
          <td className="py-[16px] px-[16px] text-center">
            <span
              className={`inline-block px-[12px] py-[4px] rounded-[6px] font-title-xsmall ${diagnosticStatusColors[item.status]}`}
            >
              {diagnosticStatusLabels[item.status]}
            </span>
          </td>
        </tr>
      ));
    }

    // APPROVER - Approvals
    if (userRole === 'approver') {
      const items = approvalsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4}>
              <EmptyState message="대기 중인 결재가 없습니다." />
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.approvalId}
          className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
          onClick={() => handleRowClick(item.approvalId, item.domainCode)}
        >
          <td className="py-[16px] px-[16px] font-body-small text-[#212529]">
            {item.companyName || '-'}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {item.title}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {formatDate(item.submittedAt)}
          </td>
          <td className="py-[16px] px-[16px] text-center">
            <span
              className={`inline-block px-[12px] py-[4px] rounded-[6px] font-title-xsmall ${approvalStatusColors[item.status]}`}
            >
              {approvalStatusLabels[item.status]}
            </span>
          </td>
        </tr>
      ));
    }

    // REVIEWER - Reviews
    if (userRole === 'receiver') {
      const items = reviewsListQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4}>
              <EmptyState message="심사 대상이 없습니다." />
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.reviewId}
          className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
          onClick={() => handleRowClick(item.reviewId, item.domainCode)}
        >
          <td className="py-[16px] px-[16px] font-body-small text-[#212529]">
            {item.companyName || '-'}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {item.title}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {formatDate(item.submittedAt)}
          </td>
          <td className="py-[16px] px-[16px] text-center">
            <span
              className={`inline-block px-[12px] py-[4px] rounded-[6px] font-title-xsmall ${reviewStatusColors[item.status]}`}
            >
              {reviewStatusLabels[item.status]}
            </span>
          </td>
        </tr>
      ));
    }

    return null;
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8 w-full">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="font-heading-medium text-[#212529]">대시보드</h1>
          {userRole === 'drafter' && (
            <button
              onClick={handleCreateDraft}
              className="bg-[#003087] text-white px-[24px] py-[12px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
            >
              + 새 기안 생성
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-[20px] p-6 md:p-11 flex flex-wrap gap-8 md:gap-[100px] justify-between md:justify-start">
          {(userRole === 'receiver' && reviewsDashboardQuery.isLoading) ||
          (userRole === 'drafter' && diagnosticsQuery.isLoading) ||
          (userRole === 'approver' && approvalsQuery.isLoading) ? (
            <div className="w-full">
              <LoadingSkeleton />
            </div>
          ) : currentStats.length > 0 ? (
            currentStats.map((stat, index) => (
              <div key={index} className="min-w-[120px]">
                <p className="font-title-medium text-[#212529] mb-[16px]">
                  {stat.label}
                </p>
                <p className={`font-heading-medium ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">통계 데이터가 없습니다.</p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,600px] gap-8">
          {/* Left: Submission List with Tabs */}
          <div className="bg-white rounded-[20px] p-6 md:p-11 overflow-hidden">
            <h2 className="font-title-large text-[#212529] mb-[32px]">
              {userRole === 'receiver' && '협력사 리스크 현황'}
              {userRole === 'drafter' && '내 진단 목록'}
              {userRole === 'approver' && '결재 대기 목록'}
            </h2>

            {/* Tabs */}
            <div className="flex gap-[8px] mb-[24px] border-b border-[#dee2e6] overflow-x-auto">
              {domainTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-[24px] py-[12px] font-title-small border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#003087] text-[#003087]'
                      : 'border-transparent text-[#adb5bd] hover:text-[#212529]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#dee2e6]">
                    <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                      {userRole === 'drafter' ? '회사명' : '협력사 명'}
                    </th>
                    <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                      {userRole === 'drafter' ? '기안명' : '기간'}
                    </th>
                    <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                      제출일
                    </th>
                    <th className="text-center py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableContent()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Notification Feed */}
          <NotificationFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}