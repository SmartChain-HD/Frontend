import { useState } from 'react';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { Search, Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import PermissionModal from './PermissionModal';
import { useRoleApprovalList, useProcessRoleRequest } from '../../src/hooks/useRoles';
import type { RoleApprovalItemDto, RequestStatus } from '../../src/types/api.types';

export default function PermissionManagementPage() {
  const [filterStatus, setFilterStatus] = useState<RequestStatus | undefined>();
  const [page, setPage] = useState(0);

  const { data: approvalData, isLoading } = useRoleApprovalList({ status: filterStatus, page, size: 10 });
  const processRequest = useProcessRoleRequest();

  const [selectedRequest, setSelectedRequest] = useState<RoleApprovalItemDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleManageClick = (request: RoleApprovalItemDto) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleConfirm = (action: 'approve' | 'reject') => {
    if (selectedRequest) {
      processRequest.mutate({
        id: selectedRequest.accessRequestId,
        data: { decision: action === 'approve' ? 'APPROVED' : 'REJECTED' },
      });
    }
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const requests = approvalData?.content || [];

  const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const styles: Record<RequestStatus, string> = {
      PENDING: 'bg-white border border-[#adb5bd] text-[#adb5bd]',
      APPROVED: 'bg-[#f0fdf4] border border-[#009619] text-[#009619]',
      REJECTED: 'bg-[#fff5f5] border border-[#e03131] text-[#e03131]',
    };
    const labels: Record<RequestStatus, string> = {
      PENDING: '승인 대기',
      APPROVED: '승인',
      REJECTED: '반려',
    };

    return (
      <div className={`px-[12px] py-[4px] rounded-[20px] inline-flex items-center justify-center ${styles[status]}`}>
        <span className="font-detail-small">{labels[status]}</span>
      </div>
    );
  };

  const RoleBadge = ({ roleCode }: { roleCode: string }) => {
    const styles: Record<string, string> = {
      DRAFTER: 'border border-[#003087] text-[#003087]',
      APPROVER: 'border border-[#e65100] text-[#e65100]',
      REVIEWER: 'border border-[#008233] text-[#008233]',
    };
    const labels: Record<string, string> = {
      DRAFTER: '기안자',
      APPROVER: '결재자',
      REVIEWER: '수신자',
    };
    return (
      <div className={`px-[12px] py-[4px] rounded-[6px] border inline-flex items-center justify-center ${styles[roleCode] || ''}`}>
        <span className="font-detail-small">{labels[roleCode] || roleCode}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-[32px] w-full bg-[#f8f9fa] min-h-full">
        <h1 className="font-heading-medium text-[#212529] mb-[24px]">권한 관리</h1>

        {/* Filters */}
        <div className="bg-white rounded-[20px] p-[24px] mb-[24px] flex items-end gap-[12px] shadow-sm">
          <div className="flex-1">
            <p className="font-title-medium mb-[12px]">협력사 명</p>
            <div className="relative">
              <input
                type="text"
                placeholder="협력사를 선택해주세요."
                className="w-full h-[56px] pl-[24px] pr-[50px] rounded-[20px] border border-[#dee2e6] text-[14px]"
              />
              <Search className="absolute right-[24px] top-[16px] w-[24px] h-[24px] text-[#212529]" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-title-medium mb-[12px]">상태</p>
            <div className="relative">
              <div className="w-full h-[56px] px-[24px] rounded-[20px] border border-[#dee2e6] flex items-center justify-between cursor-pointer">
                <span className="text-[#adb5bd] text-[14px]">상태를 선택해주세요.</span>
                <ChevronDown className="w-[24px] h-[24px] text-[#212529]" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-title-medium mb-[12px]">요청일</p>
            <div className="relative">
              <div className="w-full h-[56px] px-[24px] rounded-[20px] border border-[#dee2e6] flex items-center justify-between cursor-pointer">
                <span className="text-[#adb5bd] text-[14px]">날짜를 선택해주세요.</span>
                <Calendar className="w-[24px] h-[24px] text-[#212529]" />
              </div>
            </div>
          </div>
          <button className="h-[64px] px-[24px] bg-[#003087] text-white rounded-[20px] font-title-medium">
            적용
          </button>
          <button
            className="h-[64px] px-[24px] bg-white border border-[#212529] text-[#212529] rounded-[20px] font-title-medium"
            onClick={() => { setFilterStatus(undefined); setPage(0); }}
          >
            초기화
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[32px] p-[24px] shadow-sm overflow-hidden">
          <div className="px-[24px] py-[12px] border-b border-[#f1f3f5]">
            <h2 className="font-title-medium">요청 목록</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">Loading...</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-[#eff4fc]">
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">요청 ID</th>
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">이름</th>
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">협력사 명</th>
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">요청일</th>
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">상태</th>
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">요청권한</th>
                    <th className="py-[12px] font-body-small text-[#002554] border-b border-[#b0cbef]">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.accessRequestId} className="hover:bg-gray-50">
                      <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.accessRequestId}</td>
                      <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.user.name}</td>
                      <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.company.companyName}</td>
                      <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.requestedAtLabel}</td>
                      <td className="py-[12px] px-[12px] text-center border-b border-[#dee2e6]">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-[12px] px-[12px] text-center border-b border-[#dee2e6]">
                        <RoleBadge roleCode={req.requestedRole.code} />
                      </td>
                      <td className="py-[12px] px-[12px] text-center border-b border-[#dee2e6]">
                        {req.status === 'PENDING' && (
                          <button onClick={() => handleManageClick(req)} className="p-1 hover:bg-gray-200 rounded-full">
                            <MoreVertical className="w-[20px] h-[20px] text-[#003087]" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {approvalData?.page && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                이전
              </button>
              <span className="font-body-small">{page + 1} / {approvalData.page.totalPages || 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= (approvalData.page.totalPages - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </DashboardLayout>
  );
}
