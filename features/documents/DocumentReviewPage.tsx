import { useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { AlertCircle, FileText, Image as ImageIcon, ArrowLeft, X } from 'lucide-react';

interface DocumentReviewPageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

interface FileAnalysis {
  fileName: string;
  type: 'pdf' | 'image';
  aiResult: 'pass' | 'need_fix' | 'fail';
  resultLabel: string;
  issues: string;
}

const mockData = {
  period: '2026년 01월',
  refNumber: 'PKG_VENDOR123_SITE1_2026-01',
  companyName: '(주)ABC건설',
  submittedDate: '2026년 01월 09일',
  riskLevel: 'high',
  riskLabel: '고위험 (HIGH)',
  aiEvaluation: 'need_fix',
  aiLabel: '보완 필요 (NEED FIX)',
  keyIssue: '필수 항목 누락 + 재출된 문서에서 핵심 정보 확인 필요',
  files: [
    {
      fileName: 'TBM 활동 일지 (safety.tbm)',
      type: 'pdf' as const,
      aiResult: 'need_fix' as const,
      resultLabel: '결함 발견 (NEED_FIX)',
      issues: '서명 식별 불가 (SIGNATURE_UNCLEAR)',
    },
    {
      fileName: '소방 점검표 (safety.fire.inspection)',
      type: 'image' as const,
      aiResult: 'pass' as const,
      resultLabel: '적합 (PASS)',
      issues: '특이사항 없음 (No Issues)',
    },
  ],
};

const fileTypeIcons = {
  pdf: FileText,
  image: ImageIcon,
};

const aiResultColors = {
  pass: 'text-[#008233] bg-[#f0fdf4]',
  need_fix: 'text-[#e65100] bg-[#fff3e0]',
  fail: 'text-[#b91c1c] bg-[#fef2f2]',
};

export default function DocumentReviewPage({ userRole }: DocumentReviewPageProps) {
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleBackToList = () => {
    navigate('/dashboard/safety');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleApprove = () => {
    alert('원청 제출이 완료되었습니다.');
    navigate('/dashboard/safety');
  };

  const handleRequestFix = () => {
    if (!rejectReason.trim()) {
      alert('사유를 입력해주세요.');
      return;
    }
    alert('보완 요청이 전송되었습니다.');
    setShowRejectModal(false);
    navigate('/dashboard/safety');
  };

  const handleSubmitToApprover = () => {
    alert('결재자에게 제출되었습니다.');
    navigate('/dashboard/safety');
  };

  return (
    <DashboardLayout>
      <div className="p-[32px]">
        <div className="max-w-[1468px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-[24px]">
            <div>
              <div className="flex items-center gap-[16px] mb-[8px]">
                <h1 className="font-heading-medium text-[#212529]">
                  {mockData.period} 제출 결과 조회
                </h1>
              </div>
              <div className="flex items-center gap-[16px]">
                <div className="flex items-center gap-[8px]">
                  <span className="font-body-small text-[#868e96]">협력사:</span>
                  <span className="font-title-small text-[#212529]">
                    {mockData.companyName}
                  </span>
                </div>
                <div className="w-[1px] h-[16px] bg-[#dee2e6]"></div>
                <div className="flex items-center gap-[8px]">
                  <span className="font-body-small text-[#868e96]">제출일:</span>
                  <span className="font-title-small text-[#212529]">
                    {mockData.submittedDate}
                  </span>
                </div>
              </div>
              <p className="font-body-small text-[#868e96] mt-[8px]">
                Ref: {mockData.refNumber}
              </p>
            </div>
          </div>

          {/* Risk Alert Box */}
          <div className="bg-[#dc2626] rounded-[16px] p-[32px] mb-[32px]">
            <div className="flex items-start gap-[16px]">
              <AlertCircle className="w-[32px] h-[32px] text-white flex-shrink-0 mt-[4px]" />
              <div className="flex-1">
                <div className="flex items-center gap-[12px] mb-[12px]">
                  <h2 className="font-heading-small text-white">
                    🔴 {mockData.riskLabel}
                  </h2>
                  <span className="inline-block px-[12px] py-[6px] bg-[#fff3e0] rounded-[8px] font-title-small text-[#e65100]">
                    ⚠️ {mockData.aiLabel}
                  </span>
                </div>
                <p className="font-body-medium text-white">
                  Key 이슈: {mockData.keyIssue}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div className="bg-white rounded-[20px] p-[44px] mb-[24px]">
            <h2 className="font-title-large text-[#212529] mb-[32px]">
              항목별 상세 분석 (Detailed Slot Analysis)
            </h2>

            <div className="grid grid-cols-2 gap-[24px]">
              {mockData.files.map((file, index) => {
                const Icon = fileTypeIcons[file.type];
                return (
                  <div
                    key={index}
                    className="bg-[#1e293b] rounded-[12px] p-[24px] border border-[#334155]"
                  >
                    <div className="flex items-start gap-[16px] mb-[16px]">
                      <Icon className="w-[24px] h-[24px] text-white flex-shrink-0 mt-[2px]" />
                      <div className="flex-1">
                        <p className="font-title-small text-white mb-[8px]">
                          {file.fileName}
                        </p>
                        <div className="flex items-center gap-[8px]">
                          <div
                            className={`w-[12px] h-[12px] rounded-full ${
                              file.aiResult === 'pass'
                                ? 'bg-[#00ad1d]'
                                : file.aiResult === 'need_fix'
                                ? 'bg-[#e65100]'
                                : 'bg-[#dc2626]'
                            }`}
                          />
                          <span
                            className={`font-title-xsmall ${
                              file.aiResult === 'pass'
                                ? 'text-[#00ad1d]'
                                : file.aiResult === 'need_fix'
                                ? 'text-[#e65100]'
                                : 'text-[#dc2626]'
                            }`}
                          >
                            {file.resultLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[#334155] pt-[16px]">
                      <p className="font-body-small text-[#94a3b8]">
                        {file.issues}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-[12px] justify-end">
            {userRole === 'drafter' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-[32px] py-[14px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors flex items-center gap-[8px]"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                  목록으로 (Back to List)
                </button>
                <button
                  onClick={handleSubmitToApprover}
                  className="px-[32px] py-[14px] bg-[#003087] text-white rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
                >
                  결재자에게 제출 (Submit to Approver)
                </button>
              </>
            )}

            {userRole === 'approver' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-[32px] py-[14px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors flex items-center gap-[8px]"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                  목록으로 (Back to List)
                </button>
                <button
                  onClick={handleReject}
                  className="px-[32px] py-[14px] bg-[#dc2626] text-white rounded-[8px] font-title-small hover:bg-[#b91c1c] transition-colors"
                >
                  반려 및 보완 요청 (Reject & Request Fix)
                </button>
                <button
                  onClick={handleApprove}
                  className="px-[32px] py-[14px] bg-[#00ad1d] text-white rounded-[8px] font-title-small hover:bg-[#008a18] transition-colors"
                >
                  원청 제출 (Submit to Client)
                </button>
              </>
            )}

            {userRole === 'receiver' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-[32px] py-[14px] bg-[#6c757d] text-white rounded-[8px] font-title-small hover:bg-[#5a6268] transition-colors flex items-center gap-[8px]"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                  목록으로 (Back to List)
                </button>
                <button
                  onClick={handleReject}
                  className="px-[32px] py-[14px] bg-[#e65100] text-white rounded-[8px] font-title-small hover:bg-[#d84a00] transition-colors"
                >
                  재제출 요청 (Request Resubmission)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[32px] w-[600px] max-w-[90%]">
            <div className="flex items-center justify-between mb-[24px]">
              <h3 className="font-heading-small text-[#212529]">
                보완 요청 사유 입력
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-[8px] hover:bg-[#f1f3f5] rounded-[8px] transition-colors"
              >
                <X className="w-[24px] h-[24px] text-[#868e96]" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="보완이 필요한 사항을 상세히 입력해주세요..."
              className="w-full h-[200px] border border-[#dee2e6] rounded-[12px] p-[16px] font-body-medium resize-none focus:outline-none focus:border-[#003087] mb-[24px]"
            />
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-[24px] py-[12px] bg-[#e9ecef] text-[#495057] rounded-[8px] font-title-small hover:bg-[#dee2e6] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRequestFix}
                className="px-[24px] py-[12px] bg-[#dc2626] text-white rounded-[8px] font-title-small hover:bg-[#b91c1c] transition-colors"
              >
                보완 요청 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}