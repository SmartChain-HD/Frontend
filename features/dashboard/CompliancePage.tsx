import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { useDiagnosticsList } from '../../src/hooks/useDiagnostics';
import { useApprovals } from '../../src/hooks/useApprovals';
import { useReviews } from '../../src/hooks/useReviews';
import type { DiagnosticStatus, ApprovalStatus, ReviewStatus } from '../../src/types/api.types';

interface CompliancePageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

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

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

export default function CompliancePage({ userRole }: CompliancePageProps) {
  const navigate = useNavigate();

  const diagnosticsQuery = useDiagnosticsList(
    userRole === 'drafter' ? { domainCode: 'COMPLIANCE' } : undefined
  );
  const approvalsQuery = useApprovals(
    userRole === 'approver' ? { domainCode: 'COMPLIANCE' } : undefined
  );
  const reviewsQuery = useReviews(
    userRole === 'receiver' ? { domainCode: 'COMPLIANCE' } : undefined
  );

  const handleUpload = () => {
    navigate('/diagnostics/new');
  };

  const handleRowClick = (id: number) => {
    navigate(`/dashboard/compliance/review/${id}`);
  };

  const isLoading =
    (userRole === 'drafter' && diagnosticsQuery.isLoading) ||
    (userRole === 'approver' && approvalsQuery.isLoading) ||
    (userRole === 'receiver' && reviewsQuery.isLoading);

  const isError =
    (userRole === 'drafter' && diagnosticsQuery.isError) ||
    (userRole === 'approver' && approvalsQuery.isError) ||
    (userRole === 'receiver' && reviewsQuery.isError);

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="py-[48px] text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-[32px] w-[32px] border-b-2 border-[#003087]" />
            </div>
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={4} className="py-[48px] text-center text-[#b91c1c] font-body-medium">
            데이터를 불러오는데 실패했습니다.
          </td>
        </tr>
      );
    }

    if (userRole === 'drafter') {
      const items = diagnosticsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4} className="py-[48px] text-center text-[#868e96] font-body-medium">
              등록된 기안이 없습니다.
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.diagnosticId}
          className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
          onClick={() => handleRowClick(item.diagnosticId)}
        >
          <td className="py-[16px] px-[16px] font-body-small text-[#212529]">
            {item.summary || '-'}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {item.campaign?.title || '-'}
          </td>
          <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
            {formatDate(item.createdAt)}
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

    if (userRole === 'approver') {
      const items = approvalsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4} className="py-[48px] text-center text-[#868e96] font-body-medium">
              대기 중인 결재가 없습니다.
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.approvalId}
          className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
          onClick={() => handleRowClick(item.approvalId)}
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

    if (userRole === 'receiver') {
      const items = reviewsQuery.data?.content || [];
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={4} className="py-[48px] text-center text-[#868e96] font-body-medium">
              심사 대상이 없습니다.
            </td>
          </tr>
        );
      }
      return items.map((item) => (
        <tr
          key={item.reviewId}
          className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
          onClick={() => handleRowClick(item.reviewId)}
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
      <div className="p-[32px]">
        <div className="bg-white rounded-[20px] p-[44px] min-h-[600px]">
          <div className="flex items-center justify-between mb-[32px]">
            <h1 className="font-heading-medium text-[#212529]">
              컴플라이언스
            </h1>
            {userRole === 'drafter' && (
              <button
                onClick={handleUpload}
                className="bg-[#003087] text-white px-[24px] py-[12px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
              >
                + 새 기안 생성
              </button>
            )}
          </div>

          {/* Submission List */}
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#dee2e6]">
                  <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    협력사 명
                  </th>
                  <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    기간
                  </th>
                  <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    제출일
                  </th>
                  <th className="text-center py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    결과
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderTableBody()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
