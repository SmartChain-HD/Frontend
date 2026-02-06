import { X, CheckCircle, XCircle, User, Building2, Shield, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { useState } from 'react';
import type { RoleApprovalItemDto } from '../../src/types/api.types';

interface PermissionModalProps {
  isOpen: boolean;
  request: RoleApprovalItemDto | null;
  onClose: () => void;
  onConfirm: (action: 'approve' | 'reject', rejectReason?: string) => void;
  isProcessing?: boolean;
}

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

export default function PermissionModal({ isOpen, request, onClose, onConfirm, isProcessing }: PermissionModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onConfirm(action, action === 'reject' ? rejectReason : undefined);
    setShowConfirm(false);
    setRejectReason('');
    setAction('approve');
  };

  const handleClose = () => {
    setShowConfirm(false);
    setRejectReason('');
    setAction('approve');
    onClose();
  };

  // 확인 다이얼로그
  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-[20px] p-[32px] w-[400px] flex flex-col gap-[24px] shadow-xl">
          <div className="flex flex-col items-center gap-4">
            {action === 'approve' ? (
              <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#2e7d32]" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-[#ffebee] rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-[#c62828]" />
              </div>
            )}
            <h3 className="font-title-large text-[#212529]">
              {action === 'approve' ? '권한을 승인하시겠습니까?' : '권한을 반려하시겠습니까?'}
            </h3>
            <p className="font-body-medium text-[#868e96] text-center">
              {request.user.maskedName}님의 {request.requestedRole.name} 권한 요청을
              {action === 'approve' ? ' 승인' : ' 반려'}합니다.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="large"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="large"
              className={`flex-1 ${action === 'reject' ? 'bg-[#c62828] hover:bg-[#b71c1c]' : ''}`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? '처리 중...' : '확인'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-[24px] p-[32px] w-[560px] flex flex-col gap-[24px] shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-heading-small text-[#212529]">권한 요청 상세</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#868e96]" />
          </button>
        </div>

        {/* Request Details */}
        <div className="bg-[#f8f9fa] rounded-[16px] p-[24px] border border-[#dee2e6]">
          <div className="grid grid-cols-2 gap-[16px]">
            {/* 요청자 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                <User className="w-4 h-4 text-[#868e96]" />
              </div>
              <div>
                <p className="font-detail-small text-[#868e96]">요청자</p>
                <p className="font-body-medium text-[#212529]">{request.user.maskedName}</p>
                <p className="font-detail-small text-[#adb5bd]">{request.user.email}</p>
              </div>
            </div>

            {/* 회사 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                <Building2 className="w-4 h-4 text-[#868e96]" />
              </div>
              <div>
                <p className="font-detail-small text-[#868e96]">회사명</p>
                <p className="font-body-medium text-[#212529]">{request.company.companyName}</p>
              </div>
            </div>

            {/* 요청 권한 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                <Shield className="w-4 h-4 text-[#868e96]" />
              </div>
              <div>
                <p className="font-detail-small text-[#868e96]">요청 권한</p>
                <p className="font-body-medium text-[#212529]">{request.requestedRole.name}</p>
              </div>
            </div>

            {/* 도메인 */}
            {request.domain && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                  <FileText className="w-4 h-4 text-[#868e96]" />
                </div>
                <div>
                  <p className="font-detail-small text-[#868e96]">서비스 도메인</p>
                  <p className="font-body-medium text-[#212529]">{request.domain.name}</p>
                </div>
              </div>
            )}

            {/* 요청일 */}
            <div className="flex items-start gap-3 col-span-2">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#dee2e6]">
                <Calendar className="w-4 h-4 text-[#868e96]" />
              </div>
              <div>
                <p className="font-detail-small text-[#868e96]">요청일시</p>
                <p className="font-body-medium text-[#212529]">{formatDate(request.requestedAt)}</p>
              </div>
            </div>
          </div>

          {/* 요청 사유 */}
          {request.reason && (
            <div className="mt-[16px] pt-[16px] border-t border-[#dee2e6]">
              <p className="font-detail-small text-[#868e96] mb-2">요청 사유</p>
              <p className="font-body-medium text-[#212529] bg-white rounded-[8px] p-[12px] border border-[#dee2e6]">
                {request.reason}
              </p>
            </div>
          )}
        </div>

        {/* Action Selection */}
        <div className="flex flex-col gap-[16px]">
          <p className="font-title-medium text-[#212529]">처리 결정</p>
          <div className="flex gap-[12px]">
            <button
              className={`flex-1 p-[16px] rounded-[12px] border-2 transition-all flex items-center justify-center gap-2 ${
                action === 'approve'
                  ? 'border-[#2e7d32] bg-[#e8f5e9]'
                  : 'border-[#dee2e6] bg-white hover:border-[#81c784]'
              }`}
              onClick={() => setAction('approve')}
            >
              <CheckCircle className={`w-5 h-5 ${action === 'approve' ? 'text-[#2e7d32]' : 'text-[#adb5bd]'}`} />
              <span className={`font-body-medium ${action === 'approve' ? 'text-[#2e7d32]' : 'text-[#868e96]'}`}>
                승인
              </span>
            </button>

            <button
              className={`flex-1 p-[16px] rounded-[12px] border-2 transition-all flex items-center justify-center gap-2 ${
                action === 'reject'
                  ? 'border-[#c62828] bg-[#ffebee]'
                  : 'border-[#dee2e6] bg-white hover:border-[#e57373]'
              }`}
              onClick={() => setAction('reject')}
            >
              <XCircle className={`w-5 h-5 ${action === 'reject' ? 'text-[#c62828]' : 'text-[#adb5bd]'}`} />
              <span className={`font-body-medium ${action === 'reject' ? 'text-[#c62828]' : 'text-[#868e96]'}`}>
                반려
              </span>
            </button>
          </div>
        </div>

        {/* Reject Reason */}
        {action === 'reject' && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f57c00]" />
              <p className="font-title-small text-[#212529]">반려 사유</p>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력해주세요. (선택)"
              maxLength={500}
              className="w-full h-[100px] p-[16px] rounded-[12px] border border-[#dee2e6] font-body-medium text-[#212529] placeholder:text-[#adb5bd] resize-none focus:outline-none focus:border-[#c62828]"
            />
            <p className="font-detail-small text-[#adb5bd] text-right">{rejectReason.length}/500</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          variant="primary"
          size="large"
          className={`w-full h-[56px] rounded-[16px] ${
            action === 'reject' ? 'bg-[#c62828] hover:bg-[#b71c1c]' : 'bg-[#003087]'
          }`}
          onClick={handleSubmit}
        >
          {action === 'approve' ? '승인하기' : '반려하기'}
        </Button>
      </div>
    </div>
  );
}
