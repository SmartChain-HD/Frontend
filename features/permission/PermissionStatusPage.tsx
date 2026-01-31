import { AlertCircle } from 'lucide-react';
import GuestLayout from '../../shared/layout/GuestLayout';
import { useMyRoleRequests } from '../../src/hooks/useRoles';
import { useAuthStore } from '../../src/store/authStore';
import { REQUEST_STATUS_LABELS } from '../../src/types/api.types';

export default function PermissionStatusPage() {
  const { data: requestStatus, isLoading } = useMyRoleRequests();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="flex justify-center items-center h-[500px]">Loading...</div>
      </GuestLayout>
    );
  }

  if (!requestStatus) {
    return (
      <GuestLayout>
        <div className="flex justify-center items-center h-[500px]">
          <p className="font-body-medium text-[#868e96]">권한 요청 내역이 없습니다.</p>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="flex justify-center w-full py-[48px] px-4">
        <div className="bg-white rounded-[32px] p-[48px] w-full max-w-[1392px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] border border-[#b0cbef]">
            <div className="flex flex-col gap-[24px]">
                <h1 className="font-heading-medium text-[#212529]">시스템 권한요청</h1>

                 {/* Info Box */}
                 <div className="bg-[#eff4fc] rounded-[24px] p-[24px] border border-[#b0cbef] flex gap-[10px] items-start">
                    <AlertCircle className="w-[24px] h-[24px] text-[#002554]" />
                    <p className="font-body-medium text-[#002554]">
                        {REQUEST_STATUS_LABELS[requestStatus.status] || '권한요청 승인 대기 중입니다.'}
                    </p>
                </div>

                <p className="font-title-medium text-[#212529]">요청 현황</p>

                {/* Status Box */}
                <div className="bg-white rounded-[20px] p-[24px] border border-[#b0cbef] w-full relative">
                    <div className="flex flex-col gap-[12px]">
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">요청일시</p>
                            <p className="font-body-medium">{requestStatus.requestedAt}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">요청권한</p>
                            <p className="font-body-medium">{requestStatus.requestedRole?.name}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">회사명</p>
                            <p className="font-body-medium">{requestStatus.company?.companyName}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">이름</p>
                            <p className="font-body-medium">{user?.name || '사용자'}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">상태</p>
                            <p className="font-body-medium">{requestStatus.statusLabel}</p>
                        </div>
                        {requestStatus.rejectReason && (
                          <div className="flex flex-col">
                            <p className="font-title-small mb-1">반려 사유</p>
                            <p className="font-body-medium text-red-600">{requestStatus.rejectReason}</p>
                          </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </GuestLayout>
  );
}
