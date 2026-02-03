import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, ChevronLeft, ChevronRight, Check, X, MoreVertical } from 'lucide-react';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '../../src/hooks/useManagement';
import type { UserListParams } from '../../src/api/management';
import { ROLE_LABELS, type RoleCode } from '../../src/types/api.types';

const ROLE_OPTIONS: { code: RoleCode; label: string }[] = [
  { code: 'GUEST', label: '게스트' },
  { code: 'DRAFTER', label: '기안자' },
  { code: 'APPROVER', label: '결재자' },
  { code: 'REVIEWER', label: '수신자' },
];

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
];

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<UserListParams>({ page: 0, size: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState<number | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState<{ userId: number; currentStatus: string } | null>(null);
  const [showRoleConfirm, setShowRoleConfirm] = useState<{ userId: number; userName: string; newRole: RoleCode; newRoleName: string } | null>(null);

  const { data, isLoading, error } = useUsers(params);
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 0 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRoleFilter = (roleCode: string) => {
    setParams((prev) => ({ ...prev, roleCode: roleCode || undefined, page: 0 }));
  };

  const handleStatusFilter = (status: string) => {
    setParams((prev) => ({
      ...prev,
      status: status ? (status as 'ACTIVE' | 'INACTIVE') : undefined,
      page: 0,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleRoleChange = (userId: number, userName: string, newRole: RoleCode, newRoleName: string) => {
    setShowRoleDropdown(null);
    setShowRoleConfirm({ userId, userName, newRole, newRoleName });
  };

  const confirmRoleChange = () => {
    if (!showRoleConfirm) return;
    updateRoleMutation.mutate(
      { userId: showRoleConfirm.userId, data: { roleCode: showRoleConfirm.newRole } },
      { onSuccess: () => setShowRoleConfirm(null) }
    );
  };

  const handleStatusToggle = (userId: number, currentStatus: string) => {
    setShowStatusConfirm({ userId, currentStatus });
  };

  const confirmStatusToggle = () => {
    if (!showStatusConfirm) return;
    const newStatus = showStatusConfirm.currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateStatusMutation.mutate(
      { userId: showStatusConfirm.userId, data: { status: newStatus } },
      { onSuccess: () => setShowStatusConfirm(null) }
    );
  };

  const getRoleLabel = (roleCode: string): string => {
    return ROLE_LABELS[roleCode as RoleCode] || roleCode;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#e8f5e9] text-[#2e7d32]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
          활성
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#f5f5f5] text-[#757575]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#757575]" />
        비활성
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b border-[#dee2e6] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#495057]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading-small text-[#212529]">사용자 관리</h1>
              <p className="font-detail-small text-[#868e96]">사용자 역할 및 상태를 관리합니다</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-[16px] p-4 mb-6 border border-[#dee2e6]">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[280px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adb5bd]" />
              <input
                type="text"
                placeholder="이름 또는 이메일로 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-[#dee2e6] font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none focus:border-[#003087]"
              />
            </div>

            {/* Role Filter */}
            <select
              value={params.roleCode || ''}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-[8px] border border-[#dee2e6] font-body-medium text-[#212529] focus:outline-none focus:border-[#003087] bg-white"
            >
              <option value="">전체 역할</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.code} value={role.code}>
                  {role.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={params.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-[8px] border border-[#dee2e6] font-body-medium text-[#212529] focus:outline-none focus:border-[#003087] bg-white"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-[#003087] text-white rounded-[8px] font-body-medium hover:bg-[#002266] transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[16px] border border-[#dee2e6] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-[#003087] border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-body-medium text-[#dc3545] mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[#003087] font-body-medium hover:underline"
              >
                새로고침
              </button>
            </div>
          ) : !data?.content.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-12 h-12 text-[#adb5bd] mb-4" />
              <p className="font-body-medium text-[#868e96]">등록된 사용자가 없습니다.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                  <tr>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">사용자</th>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">회사</th>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">역할</th>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">상태</th>
                    <th className="px-6 py-4 text-center font-title-small text-[#495057]">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((user) => (
                    <tr
                      key={user.userId}
                      className={`border-b border-[#dee2e6] last:border-b-0 hover:bg-[#f8f9fa] transition-colors ${
                        selectedUser === user.userId ? 'bg-[#e7f1ff]' : ''
                      }`}
                      onClick={() => setSelectedUser(user.userId)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-body-medium text-[#212529]">{user.name}</p>
                          <p className="font-detail-small text-[#868e96]">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-body-medium text-[#495057]">{user.company || '-'}</p>
                      </td>
                      <td className="px-6 py-4 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRoleDropdown(showRoleDropdown === user.userId ? null : user.userId);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] border border-[#dee2e6] font-body-medium text-[#495057] hover:border-[#003087] hover:text-[#003087] transition-colors"
                        >
                          {getRoleLabel(user.roleCode)}
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {showRoleDropdown === user.userId && (
                          <div className="absolute left-6 top-full mt-1 z-10 bg-white border border-[#dee2e6] rounded-[8px] shadow-lg py-1 min-w-[120px]">
                            {ROLE_OPTIONS.map((role) => (
                              <button
                                key={role.code}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (role.code !== user.roleCode) {
                                    handleRoleChange(user.userId, user.name, role.code, role.label);
                                  } else {
                                    setShowRoleDropdown(null);
                                  }
                                }}
                                className={`w-full px-4 py-2 text-left font-body-medium hover:bg-[#f8f9fa] transition-colors ${
                                  role.code === user.roleCode ? 'text-[#003087] bg-[#e7f1ff]' : 'text-[#495057]'
                                }`}
                              >
                                {role.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusToggle(user.userId, user.status);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title={user.status === 'ACTIVE' ? '비활성화' : '활성화'}
                        >
                          <MoreVertical className="w-5 h-5 text-[#868e96]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data.page && data.page.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#dee2e6]">
                  <p className="font-detail-small text-[#868e96]">
                    총 {data.page.totalElements}명 중 {data.page.number * data.page.size + 1}-
                    {Math.min((data.page.number + 1) * data.page.size, data.page.totalElements)}명
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(data.page.number - 1)}
                      disabled={data.page.number === 0}
                      className="p-2 rounded-[6px] border border-[#dee2e6] hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#495057]" />
                    </button>
                    <span className="font-body-medium text-[#495057] px-3">
                      {data.page.number + 1} / {data.page.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(data.page.number + 1)}
                      disabled={data.page.number >= data.page.totalPages - 1}
                      className="p-2 rounded-[6px] border border-[#dee2e6] hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-[#495057]" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Role Change Confirmation Modal */}
      {showRoleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[20px] p-6 md:p-[32px] w-[calc(100vw-32px)] max-w-[400px] flex flex-col gap-[24px] shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#e7f1ff] rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-[#003087]" />
              </div>
              <h3 className="font-title-large text-[#212529]">역할을 변경하시겠습니까?</h3>
              <p className="font-body-medium text-[#868e96] text-center">
                {showRoleConfirm.userName}님의 역할을
                <br />
                <strong className="text-[#003087]">{showRoleConfirm.newRoleName}</strong>(으)로 변경합니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleConfirm(null)}
                disabled={updateRoleMutation.isPending}
                className="flex-1 py-3 px-4 rounded-[12px] border border-[#dee2e6] font-body-medium text-[#495057] hover:bg-[#f8f9fa] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={updateRoleMutation.isPending}
                className="flex-1 py-3 px-4 rounded-[12px] bg-[#003087] font-body-medium text-white hover:bg-[#002266] transition-colors disabled:opacity-50"
              >
                {updateRoleMutation.isPending ? '처리 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[20px] p-6 md:p-[32px] w-[calc(100vw-32px)] max-w-[400px] flex flex-col gap-[24px] shadow-xl">
            <div className="flex flex-col items-center gap-4">
              {showStatusConfirm.currentStatus === 'ACTIVE' ? (
                <div className="w-16 h-16 bg-[#fff3e0] rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-[#f57c00]" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#2e7d32]" />
                </div>
              )}
              <h3 className="font-title-large text-[#212529]">
                {showStatusConfirm.currentStatus === 'ACTIVE' ? '사용자를 비활성화하시겠습니까?' : '사용자를 활성화하시겠습니까?'}
              </h3>
              <p className="font-body-medium text-[#868e96] text-center">
                {showStatusConfirm.currentStatus === 'ACTIVE'
                  ? '비활성화된 사용자는 서비스에 로그인할 수 없습니다.'
                  : '활성화된 사용자는 다시 서비스를 이용할 수 있습니다.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusConfirm(null)}
                disabled={updateStatusMutation.isPending}
                className="flex-1 py-3 px-4 rounded-[12px] border border-[#dee2e6] font-body-medium text-[#495057] hover:bg-[#f8f9fa] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={confirmStatusToggle}
                disabled={updateStatusMutation.isPending}
                className={`flex-1 py-3 px-4 rounded-[12px] font-body-medium text-white transition-colors disabled:opacity-50 ${
                  showStatusConfirm.currentStatus === 'ACTIVE'
                    ? 'bg-[#f57c00] hover:bg-[#e65100]'
                    : 'bg-[#2e7d32] hover:bg-[#1b5e20]'
                }`}
              >
                {updateStatusMutation.isPending ? '처리 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
