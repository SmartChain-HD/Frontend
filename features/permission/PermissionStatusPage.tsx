import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle, XCircle, RefreshCw, ArrowLeft, User, Building2, Shield, Calendar, FileText } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import GuestLayout from '../../shared/layout/GuestLayout';
import { useMyRoleRequests } from '../../src/hooks/useRoles';
import { useAuthStore } from '../../src/store/authStore';
import type { RequestStatus } from '../../src/types/api.types';

const STATUS_CONFIG: Record<RequestStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
}> = {
  PENDING: {
    label: '승인 대기중',
    bgColor: 'bg-[#fff8e1]',
    textColor: 'text-[#f57c00]',
    borderColor: 'border-[#ffb74d]',
    icon: <Clock className="w-5 h-5" />,
    description: '관리자가 요청을 검토 중입니다. 승인까지 1-2일 정도 소요될 수 있습니다.',
  },
  APPROVED: {
    label: '승인 완료',
    bgColor: 'bg-[#e8f5e9]',
    textColor: 'text-[#2e7d32]',
    borderColor: 'border-[#81c784]',
    icon: <CheckCircle className="w-5 h-5" />,
    description: '권한이 승인되었습니다. 이제 해당 기능을 사용할 수 있습니다.',
  },
  REJECTED: {
    label: '승인 반려',
    bgColor: 'bg-[#ffebee]',
    textColor: 'text-[#c62828]',
    borderColor: 'border-[#e57373]',
    icon: <XCircle className="w-5 h-5" />,
    description: '요청이 반려되었습니다. 반려 사유를 확인하고 다시 요청해 주세요.',
  },
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body-small ${config.bgColor} ${config.textColor}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function PermissionStatusPage() {
  const navigate = useNavigate();
  const { data: requestStatus, isLoading, isError, refetch } = useMyRoleRequests();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="flex justify-center items-center h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
            <p className="font-body-medium text-[#868e96]">요청 상태를 불러오는 중...</p>
          </div>
        </div>
      </GuestLayout>
    );
  }

  if (isError) {
    return (
      <GuestLayout>
        <div className="flex justify-center items-center h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-[#c62828]" />
            <p className="font-body-medium text-[#868e96]">요청 상태를 불러오는데 실패했습니다.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          </div>
        </div>
      </GuestLayout>
    );
  }

  if (!requestStatus) {
    return (
      <GuestLayout>
        <div className="flex justify-center w-full py-[48px] px-4">
          <div className="bg-white rounded-[32px] p-[48px] w-full max-w-[800px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] border border-[#b0cbef]">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-[#adb5bd]" />
              </div>
              <div className="text-center">
                <h2 className="font-title-large text-[#212529] mb-2">권한 요청 내역이 없습니다</h2>
                <p className="font-body-medium text-[#868e96]">
                  시스템 기능을 사용하려면 먼저 권한을 요청해 주세요.
                </p>
              </div>
              <Button
                variant="primary"
                size="large"
                className="mt-4"
                onClick={() => navigate('/permission/request')}
              >
                권한 요청하기
              </Button>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[requestStatus.status];

  return (
    <GuestLayout>
      <div className="flex justify-center w-full py-[48px] px-4">
        <div className="bg-white rounded-[32px] p-[48px] w-full max-w-[800px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] border border-[#b0cbef]">
          <div className="flex flex-col gap-[32px]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="font-heading-medium text-[#212529]">권한 요청 현황</h1>
              <StatusBadge status={requestStatus.status} />
            </div>

            {/* Status Description */}
            <div className={`rounded-[16px] p-[20px] border ${statusConfig.bgColor} ${statusConfig.borderColor} flex gap-[12px] items-start`}>
              <div className={statusConfig.textColor}>
                {statusConfig.icon}
              </div>
              <p className={`font-body-medium ${statusConfig.textColor}`}>
                {statusConfig.description}
              </p>
            </div>

            {/* Request Details Card */}
            <div className="bg-[#f8f9fa] rounded-[20px] p-[28px] border border-[#dee2e6]">
              <h3 className="font-title-medium text-[#212529] mb-[20px]">요청 상세 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                {/* 요청자 정보 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                    <User className="w-5 h-5 text-[#868e96]" />
                  </div>
                  <div>
                    <p className="font-detail-small text-[#868e96]">요청자</p>
                    <p className="font-body-medium text-[#212529]">{user?.maskedName || '사용자'}</p>
                  </div>
                </div>

                {/* 회사 정보 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                    <Building2 className="w-5 h-5 text-[#868e96]" />
                  </div>
                  <div>
                    <p className="font-detail-small text-[#868e96]">회사명</p>
                    <p className="font-body-medium text-[#212529]">{requestStatus.company?.companyName || '-'}</p>
                  </div>
                </div>

                {/* 요청 권한 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                    <Shield className="w-5 h-5 text-[#868e96]" />
                  </div>
                  <div>
                    <p className="font-detail-small text-[#868e96]">요청 권한</p>
                    <p className="font-body-medium text-[#212529]">{requestStatus.requestedRole?.name || '-'}</p>
                  </div>
                </div>

                {/* 도메인 정보 */}
                {requestStatus.domain && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                      <FileText className="w-5 h-5 text-[#868e96]" />
                    </div>
                    <div>
                      <p className="font-detail-small text-[#868e96]">서비스 도메인</p>
                      <p className="font-body-medium text-[#212529]">{requestStatus.domain.name}</p>
                    </div>
                  </div>
                )}

                {/* 요청일 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                    <Calendar className="w-5 h-5 text-[#868e96]" />
                  </div>
                  <div>
                    <p className="font-detail-small text-[#868e96]">요청일시</p>
                    <p className="font-body-medium text-[#212529]">{formatDate(requestStatus.requestedAt)}</p>
                  </div>
                </div>

                {/* 처리일 */}
                {requestStatus.processedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                      <CheckCircle className="w-5 h-5 text-[#868e96]" />
                    </div>
                    <div>
                      <p className="font-detail-small text-[#868e96]">처리일시</p>
                      <p className="font-body-medium text-[#212529]">{formatDate(requestStatus.processedAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 요청 사유 */}
              {requestStatus.reason && (
                <div className="mt-[20px] pt-[20px] border-t border-[#dee2e6]">
                  <p className="font-detail-small text-[#868e96] mb-2">요청 사유</p>
                  <p className="font-body-medium text-[#212529] bg-white rounded-[12px] p-[16px] border border-[#dee2e6]">
                    {requestStatus.reason}
                  </p>
                </div>
              )}

              {/* 반려 사유 */}
              {requestStatus.status === 'REJECTED' && requestStatus.rejectReason && (
                <div className="mt-[20px] pt-[20px] border-t border-[#dee2e6]">
                  <p className="font-detail-small text-[#c62828] mb-2">반려 사유</p>
                  <p className="font-body-medium text-[#c62828] bg-[#ffebee] rounded-[12px] p-[16px] border border-[#e57373]">
                    {requestStatus.rejectReason}
                  </p>
                </div>
              )}

              {/* 처리자 정보 */}
              {requestStatus.processedBy && (
                <div className="mt-[20px] pt-[20px] border-t border-[#dee2e6]">
                  <p className="font-detail-small text-[#868e96]">
                    처리자: {requestStatus.processedBy.maskedName}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="large"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
              </Button>

              {requestStatus.status === 'REJECTED' && (
                <Button
                  variant="primary"
                  size="large"
                  className="flex-1"
                  onClick={() => navigate('/permission/request')}
                >
                  다시 요청하기
                </Button>
              )}

              {requestStatus.status === 'APPROVED' && (
                <Button
                  variant="primary"
                  size="large"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                >
                  대시보드로 이동
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
