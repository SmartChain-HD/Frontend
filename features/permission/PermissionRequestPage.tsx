import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ClipboardList, CheckSquare, ChevronDown, AlertCircle, Leaf, HardHat, FileText } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import GuestLayout from '../../shared/layout/GuestLayout';
import { useRoleRequestPage, useCreateRoleRequest } from '../../src/hooks/useRoles';
import type { RoleCode, DomainCode } from '../../src/types/api.types';

export default function PermissionRequestPage() {
  const navigate = useNavigate();
  const { data: pageData, isLoading } = useRoleRequestPage();
  const createRequest = useCreateRoleRequest();

  const [selectedRole, setSelectedRole] = useState<RoleCode | null>('DRAFTER');
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const companies = pageData?.availableCompanies || [];
  const selectedCompany = companies.find((c) => c.companyId === selectedCompanyId);

  const handleSubmit = () => {
    if (!selectedRole) {
      alert('역할을 선택해주세요.');
      return;
    }
    if (!selectedDomain) {
      alert('도메인을 선택해주세요.');
      return;
    }
    if (!selectedCompanyId) {
      alert('회사를 선택해주세요.');
      return;
    }
    
    const tempDomainIdMap: Record<string, number> = {
      'ESG': 1,        // 실제 DB ID가 1이어야 함
      'SAFETY': 2,     // 실제 DB ID가 2이어야 함
      'COMPLIANCE': 3, // 실제 DB ID가 3이어야 함
    };

    const numericId = tempDomainIdMap[selectedDomain];

    createRequest.mutate(
      {
        requestedRole: selectedRole,
        domainId: numericId as any,
        companyId: selectedCompanyId,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate('/permission/status');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="flex justify-center items-center h-[500px]">Loading...</div>
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
                        현재 권한: {pageData?.currentRole?.name || '게스트'} 권한입니다. 역할을 선택해주세요.
                    </p>
                </div>

                {/* Pending Request Warning */}
                {pageData?.pendingRequest && (
                  <div className="bg-[#fff3e0] rounded-[24px] p-[24px] border border-[#e65100] flex gap-[10px] items-start">
                    <AlertCircle className="w-[24px] h-[24px] text-[#e65100]" />
                    <p className="font-body-medium text-[#e65100]">
                      이미 대기 중인 권한 요청이 있습니다. 상태 페이지에서 확인해주세요.
                    </p>
                  </div>
                )}

                {/* Role Selection */}
                <div className="flex justify-center w-full py-[24px]">
                    <div className="flex gap-[24px]">
                        {/* Drafter Card */}
                        <div
                            onClick={() => setSelectedRole('DRAFTER')}
                            className={`cursor-pointer w-[240px] h-[240px] rounded-[20px] p-[12px] flex flex-col relative border transition-all ${
                                selectedRole === 'DRAFTER'
                                ? 'bg-[#f0fdf4] border-[#86efac]'
                                : 'bg-[#f8f9fa] border-[#adb5bd]'
                            }`}
                        >
                            <div className="flex justify-end w-full">
                                {selectedRole === 'DRAFTER' ? (
                                    <CheckCircle className="w-[24px] h-[24px] text-[#009619]" />
                                ) : (
                                    <Circle className="w-[24px] h-[24px] text-[#adb5bd]" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
                                <ClipboardList className={`w-[70px] h-[80px] ${selectedRole === 'DRAFTER' ? 'text-[#009619]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small ${selectedRole === 'DRAFTER' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>기안자</p>
                                <div className={`font-detail-small text-center ${selectedRole === 'DRAFTER' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>
                                    <p>ESG 진단표 작성</p>
                                    <p>기안 관리</p>
                                </div>
                            </div>
                        </div>

                        {/* Approver Card */}
                        <div
                            onClick={() => setSelectedRole('APPROVER')}
                            className={`cursor-pointer w-[240px] h-[240px] rounded-[20px] p-[12px] flex flex-col relative border transition-all ${
                                selectedRole === 'APPROVER'
                                ? 'bg-[#f0fdf4] border-[#86efac]'
                                : 'bg-[#f8f9fa] border-[#adb5bd]'
                            }`}
                        >
                             <div className="flex justify-end w-full">
                                {selectedRole === 'APPROVER' ? (
                                    <CheckCircle className="w-[24px] h-[24px] text-[#009619]" />
                                ) : (
                                    <Circle className="w-[24px] h-[24px] text-[#adb5bd]" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
                                <CheckSquare className={`w-[80px] h-[80px] ${selectedRole === 'APPROVER' ? 'text-[#009619]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small ${selectedRole === 'APPROVER' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>결재자</p>
                                <div className={`font-detail-small text-center ${selectedRole === 'APPROVER' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>
                                    <p>ESG 진단표 검토</p>
                                    <p>협력사 내 권한 관리</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Domain Selection */}
                <div className="flex flex-col gap-[12px]">
                    <p className="font-title-medium text-[#212529]">서비스 도메인</p>
                    <div className="flex justify-center w-full py-[16px]">
                        <div className="flex gap-[16px]">
                            {/* ESG Card */}
                            <div
                                onClick={() => setSelectedDomain('ESG')}
                                className={`cursor-pointer w-[180px] h-[140px] rounded-[16px] p-[12px] flex flex-col items-center justify-center gap-[8px] border transition-all ${
                                    selectedDomain === 'ESG'
                                    ? 'bg-[#ecfdf5] border-[#10b981]'
                                    : 'bg-[#f8f9fa] border-[#adb5bd]'
                                }`}
                            >
                                <Leaf className={`w-[40px] h-[40px] ${selectedDomain === 'ESG' ? 'text-[#10b981]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small font-semibold ${selectedDomain === 'ESG' ? 'text-[#047857]' : 'text-[#6b7280]'}`}>ESG 실사</p>
                                <p className={`font-detail-small text-center ${selectedDomain === 'ESG' ? 'text-[#047857]' : 'text-[#9ca3af]'}`}>증빙 파싱 및 리포트</p>
                            </div>

                            {/* Safety Card */}
                            <div
                                onClick={() => setSelectedDomain('SAFETY')}
                                className={`cursor-pointer w-[180px] h-[140px] rounded-[16px] p-[12px] flex flex-col items-center justify-center gap-[8px] border transition-all ${
                                    selectedDomain === 'SAFETY'
                                    ? 'bg-[#fef2f2] border-[#ef4444]'
                                    : 'bg-[#f8f9fa] border-[#adb5bd]'
                                }`}
                            >
                                <HardHat className={`w-[40px] h-[40px] ${selectedDomain === 'SAFETY' ? 'text-[#ef4444]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small font-semibold ${selectedDomain === 'SAFETY' ? 'text-[#b91c1c]' : 'text-[#6b7280]'}`}>안전보건</p>
                                <p className={`font-detail-small text-center ${selectedDomain === 'SAFETY' ? 'text-[#b91c1c]' : 'text-[#9ca3af]'}`}>TBM 자동 검증</p>
                            </div>

                            {/* Compliance Card */}
                            <div
                                onClick={() => setSelectedDomain('COMPLIANCE')}
                                className={`cursor-pointer w-[180px] h-[140px] rounded-[16px] p-[12px] flex flex-col items-center justify-center gap-[8px] border transition-all ${
                                    selectedDomain === 'COMPLIANCE'
                                    ? 'bg-[#eff6ff] border-[#3b82f6]'
                                    : 'bg-[#f8f9fa] border-[#adb5bd]'
                                }`}
                            >
                                <FileText className={`w-[40px] h-[40px] ${selectedDomain === 'COMPLIANCE' ? 'text-[#3b82f6]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small font-semibold ${selectedDomain === 'COMPLIANCE' ? 'text-[#1d4ed8]' : 'text-[#6b7280]'}`}>컴플라이언스</p>
                                <p className={`font-detail-small text-center ${selectedDomain === 'COMPLIANCE' ? 'text-[#1d4ed8]' : 'text-[#9ca3af]'}`}>계약서 자동 검토</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Dropdown */}
                <div className="flex flex-col gap-[12px]">
                    <p className="font-title-medium text-[#212529]">회사명</p>
                    <div className="relative w-full">
                        <div
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            className="bg-white border border-[#dee2e6] rounded-[20px] px-[24px] py-[18px] flex items-center justify-between cursor-pointer"
                        >
                            <p className={`font-body-small ${selectedCompany ? 'text-[#212529]' : 'text-[#adb5bd]'}`}>
                                {selectedCompany?.companyName || '회사를 선택해주세요.'}
                            </p>
                            <ChevronDown className="w-[24px] h-[24px] text-[#212529]" />
                        </div>

                        {isCompanyDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[20px] overflow-hidden z-10 shadow-lg max-h-[200px] overflow-y-auto">
                                {companies.map((company) => (
                                    <div
                                        key={company.companyId}
                                        onClick={() => {
                                            setSelectedCompanyId(company.companyId);
                                            setIsCompanyDropdownOpen(false);
                                        }}
                                        className="px-[24px] py-[12px] hover:bg-[#eff4fc] cursor-pointer"
                                    >
                                        <p className="font-body-small text-[#212529]">{company.companyName}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reason Input */}
                <div className="flex flex-col gap-[12px]">
                    <p className="font-title-medium text-[#212529]">요청 사유 <span className="font-body-small text-[#adb5bd]">(선택)</span></p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="권한 요청 사유를 입력해주세요."
                        maxLength={500}
                        className="bg-white border border-[#dee2e6] rounded-[20px] px-[24px] py-[18px] font-body-small text-[#212529] placeholder:text-[#adb5bd] resize-none h-[120px] focus:outline-none focus:border-[#003087]"
                    />
                    <p className="font-detail-small text-[#adb5bd] text-right">{reason.length}/500</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        variant="primary"
                        size="large"
                        className="w-full h-[64px] rounded-[20px] text-[18px] bg-[#003087]"
                        onClick={handleSubmit}
                        disabled={createRequest.isPending || !!pageData?.pendingRequest || !selectedRole || !selectedDomain || !selectedCompanyId}
                    >
                        {createRequest.isPending ? '요청 중...' : '권한요청'}
                    </Button>
                </div>

            </div>
        </div>
      </div>
    </GuestLayout>
  );
}
