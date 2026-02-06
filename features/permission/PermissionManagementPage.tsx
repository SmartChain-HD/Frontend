import { useState } from 'react';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { Search, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, FileText, Eye } from 'lucide-react';
import PermissionModal from './PermissionModal';
import { Button } from '../../shared/components/Button';
import { useRoleApprovalList, useProcessRoleRequest } from '../../src/hooks/useRoles';
import type { RoleApprovalItemDto, RequestStatus } from '../../src/types/api.types';

const STATUS_OPTIONS: { value: RequestStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '승인 대기' },
  { value: 'APPROVED', label: '승인 완료' },
  { value: 'REJECTED', label: '반려' },
];

const STATUS_BADGE_STYLES: Record<RequestStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-[#fff8e1]', text: 'text-[#f57c00]', border: 'border-[#ffb74d]' },
  APPROVED: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', border: 'border-[#81c784]' },
  REJECTED: { bg: 'bg-[#ffebee]', text: 'text-[#c62828]', border: 'border-[#e57373]' },
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인 완료',
  REJECTED: '반려',
};

const ROLE_BADGE_STYLES: Record<string, { text: string; border: string }> = {
  DRAFTER: { text: 'text-[#003087]', border: 'border-[#003087]' },
  APPROVER: { text: 'text-[#e65100]', border: 'border-[#e65100]' },
  REVIEWER: { text: 'text-[#2e7d32]', border: 'border-[#2e7d32]' },
};

const ROLE_LABELS: Record<string, string> = {
  DRAFTER: '기안자',
  APPROVER: '결재자',
  REVIEWER: '수신자',
};

const DOMAIN_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  ESG: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]' },
  SAFETY: { bg: 'bg-[#ffebee]', text: 'text-[#c62828]' },
  COMPLIANCE: { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]' },
};

function StatusBadge({ status }: { status: RequestStatus }) {
  const style = STATUS_BADGE_STYLES[status];
  return (
    <span className={`inline-flex items-center px-[12px] py-[6px] rounded-full font-label-medium font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function RoleBadge({ roleCode }: { roleCode: string }) {
  const style = ROLE_BADGE_STYLES[roleCode] || { text: 'text-[#868e96]', border: 'border-[#dee2e6]' };
  return (
    <span className={`inline-flex items-center px-[10px] py-[4px] rounded-[8px] font-label-medium font-medium border ${style.text} ${style.border}`}>
      {ROLE_LABELS[roleCode] || roleCode}
    </span>
  );
}

function DomainBadge({ domainCode, domainName }: { domainCode: string; domainName?: string }) {
  const style = DOMAIN_BADGE_STYLES[domainCode] || { bg: 'bg-[#f5f5f5]', text: 'text-[#616161]' };
  return (
    <span className={`inline-flex items-center px-[10px] py-[4px] rounded-[8px] font-label-medium font-medium ${style.bg} ${style.text}`}>
      {domainName || domainCode}
    </span>
  );
}

export default function PermissionManagementPage() {
  const [filterStatus, setFilterStatus] = useState<RequestStatus | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const { data: approvalData, isLoading, isError, refetch } = useRoleApprovalList({
    status: filterStatus,
    page,
    size: 10
  });
  const processRequest = useProcessRoleRequest();

  const [selectedRequest, setSelectedRequest] = useState<RoleApprovalItemDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = (request: RoleApprovalItemDto) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleConfirm = (action: 'approve' | 'reject', rejectReason?: string) => {
    if (selectedRequest) {
      processRequest.mutate(
        {
          id: selectedRequest.accessRequestId,
          data: {
            decision: action === 'approve' ? 'APPROVED' : 'REJECTED',
            rejectReason: rejectReason || undefined,
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          },
        }
      );
    }
  };

  const handleReset = () => {
    setFilterStatus(undefined);
    setSearchKeyword('');
    setPage(0);
  };

  const requests = approvalData?.content || [];
  const totalPages = approvalData?.page?.totalPages || 1;
  const totalElements = approvalData?.page?.totalElements || 0;

  // 검색어로 필터링 (클라이언트 사이드)
  const filteredRequests = searchKeyword
    ? requests.filter(
        (req) =>
          req.user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          req.company.companyName.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : requests;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-[32px] w-full bg-[#f8f9fa] min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-[24px]">
          <h1 className="font-heading-medium text-[#212529]">권한 관리</h1>
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            새로고침
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[20px] p-[24px] mb-[24px] shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-[16px]">
            {/* 검색 */}
            <div className="flex-1">
              <p className="font-title-small text-[#212529] mb-[8px]">검색</p>
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="이름 또는 회사명으로 검색"
                  className="w-full h-[48px] pl-[16px] pr-[48px] rounded-[12px] border border-[#dee2e6] text-[14px] focus:outline-none focus:border-[#003087]"
                />
                <Search className="absolute right-[16px] top-[12px] w-[24px] h-[24px] text-[#adb5bd]" />
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="w-full md:w-[200px]">
              <p className="font-title-small text-[#212529] mb-[8px]">상태</p>
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full h-[48px] px-[16px] rounded-[12px] border border-[#dee2e6] flex items-center justify-between bg-white"
                >
                  <span className={`text-[14px] ${filterStatus ? 'text-[#212529]' : 'text-[#adb5bd]'}`}>
                    {filterStatus ? STATUS_LABELS[filterStatus] : '전체'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-[#868e96]" />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#dee2e6] rounded-[12px] overflow-hidden z-10 shadow-lg">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value === 'ALL' ? undefined : option.value);
                          setIsStatusDropdownOpen(false);
                          setPage(0);
                        }}
                        className={`w-full px-[16px] py-[12px] text-left text-[14px] hover:bg-[#f8f9fa] ${
                          (option.value === 'ALL' && !filterStatus) || option.value === filterStatus
                            ? 'bg-[#eff4fc] text-[#003087]'
                            : 'text-[#212529]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 초기화 버튼 */}
            <Button
              variant="secondary"
              className="h-[48px]"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-[24px] py-[16px] border-b border-[#dee2e6] flex items-center justify-between">
            <h2 className="font-title-medium text-[#212529]">
              요청 목록 {totalElements > 0 && <span className="text-[#868e96]">({totalElements}건)</span>}
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-[80px]">
              <div className="w-10 h-10 border-4 border-[#003087] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-body-medium text-[#868e96]">요청 목록을 불러오는 중...</p>
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-[80px]">
              <AlertCircle className="w-12 h-12 text-[#c62828] mb-4" />
              <p className="font-body-medium text-[#868e96] mb-4">요청 목록을 불러오는데 실패했습니다.</p>
              <Button variant="secondary" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[80px]">
              <div className="w-16 h-16 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-[#adb5bd]" />
              </div>
              <p className="font-body-medium text-[#868e96]">
                {searchKeyword || filterStatus
                  ? '검색 조건에 맞는 요청이 없습니다.'
                  : '권한 요청 내역이 없습니다.'}
              </p>
            </div>
          )}

          {/* Table Content */}
          {!isLoading && !isError && filteredRequests.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="py-[14px] px-[16px] text-left font-title-small text-[#495057] border-b border-[#dee2e6]">ID</th>
                      <th className="py-[14px] px-[16px] text-left font-title-small text-[#495057] border-b border-[#dee2e6]">요청자</th>
                      <th className="py-[14px] px-[16px] text-left font-title-small text-[#495057] border-b border-[#dee2e6]">회사명</th>
                      <th className="py-[14px] px-[16px] text-left font-title-small text-[#495057] border-b border-[#dee2e6]">요청 권한</th>
                      <th className="py-[14px] px-[16px] text-left font-title-small text-[#495057] border-b border-[#dee2e6]">도메인</th>
                      <th className="py-[14px] px-[16px] text-left font-title-small text-[#495057] border-b border-[#dee2e6]">요청일</th>
                      <th className="py-[14px] px-[16px] text-center font-title-small text-[#495057] border-b border-[#dee2e6]">상태</th>
                      <th className="py-[14px] px-[16px] text-center font-title-small text-[#495057] border-b border-[#dee2e6]">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.accessRequestId} className="hover:bg-[#f8f9fa] transition-colors">
                        <td className="py-[14px] px-[16px] font-body-small text-[#868e96] border-b border-[#f1f3f5]">
                          #{req.accessRequestId}
                        </td>
                        <td className="py-[14px] px-[16px] border-b border-[#f1f3f5]">
                          <div>
                            <p className="font-body-small text-[#212529]">{req.user.name}</p>
                            <p className="font-detail-small text-[#adb5bd]">{req.user.email}</p>
                          </div>
                        </td>
                        <td className="py-[14px] px-[16px] font-body-small text-[#212529] border-b border-[#f1f3f5]">
                          {req.company.companyName}
                        </td>
                        <td className="py-[14px] px-[16px] border-b border-[#f1f3f5]">
                          <RoleBadge roleCode={req.requestedRole.code} />
                        </td>
                        <td className="py-[14px] px-[16px] border-b border-[#f1f3f5]">
                          {req.domain ? (
                            <DomainBadge domainCode={req.domain.code} domainName={req.domain.name} />
                          ) : (
                            <span className="text-[#adb5bd]">-</span>
                          )}
                        </td>
                        <td className="py-[14px] px-[16px] font-body-small text-[#495057] border-b border-[#f1f3f5]">
                          {req.requestedAtLabel}
                        </td>
                        <td className="py-[14px] px-[16px] text-center border-b border-[#f1f3f5]">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-[14px] px-[16px] text-center border-b border-[#f1f3f5]">
                          <button
                            onClick={() => handleViewClick(req)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-title-small transition-colors ${
                              req.status === 'PENDING'
                                ? 'bg-[#003087] text-white hover:bg-[#002266]'
                                : 'bg-[#f1f3f5] text-[#495057] hover:bg-[#e9ecef]'
                            }`}
                          >
                            <Eye className="w-5 h-5" />
                            {req.status === 'PENDING' ? '처리' : '보기'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#dee2e6]">
                <p className="font-body-small text-[#868e96]">
                  {page * 10 + 1} - {Math.min((page + 1) * 10, totalElements)} / 총 {totalElements}건
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-2 rounded-lg border border-[#dee2e6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f9fa]"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#495057]" />
                  </button>
                  <span className="font-body-small text-[#495057] min-w-[80px] text-center">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-lg border border-[#dee2e6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f9fa]"
                  >
                    <ChevronRight className="w-5 h-5 text-[#495057]" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        request={selectedRequest}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirm}
        isProcessing={processRequest.isPending}
      />
    </DashboardLayout>
  );
}
