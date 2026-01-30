import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, Circle, ClipboardList, CheckSquare, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import GuestLayout from '../../shared/layout/GuestLayout';

export default function PermissionRequestPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'drafter' | 'approver' | null>('drafter'); // Default to drafter as per design
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const companies = [
    '리스트 1',
    '리스트 2',
    '리스트 3',
    '리스트 4'
  ];

  const handleSubmit = () => {
    if (!selectedRole || !selectedCompany) {
        alert('역할과 회사를 선택해주세요.');
        return;
    }
    // Logic to transition to "Pending" state
    // For demo, we just navigate to the status page
    localStorage.setItem('permissionStatus', 'pending');
    localStorage.setItem('requestedRole', selectedRole);
    localStorage.setItem('requestedCompany', selectedCompany);
    navigate('/permission/status');
  };

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
                        현재 권한: 게스트 권한입니다. 역할을 선택해주세요.
                    </p>
                </div>

                {/* Role Selection */}
                <div className="flex justify-center w-full py-[24px]">
                    <div className="flex gap-[24px]">
                        {/* Drafter Card */}
                        <div 
                            onClick={() => setSelectedRole('drafter')}
                            className={`cursor-pointer w-[240px] h-[240px] rounded-[20px] p-[12px] flex flex-col relative border transition-all ${
                                selectedRole === 'drafter' 
                                ? 'bg-[#f0fdf4] border-[#86efac]' 
                                : 'bg-[#f8f9fa] border-[#adb5bd]'
                            }`}
                        >
                            <div className="flex justify-end w-full">
                                {selectedRole === 'drafter' ? (
                                    <CheckCircle className="w-[24px] h-[24px] text-[#009619]" />
                                ) : (
                                    <Circle className="w-[24px] h-[24px] text-[#adb5bd]" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
                                <ClipboardList className={`w-[70px] h-[80px] ${selectedRole === 'drafter' ? 'text-[#009619]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small ${selectedRole === 'drafter' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>기안자</p>
                                <div className={`font-detail-small text-center ${selectedRole === 'drafter' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>
                                    <p>ESG 진단표 작성</p>
                                    <p>기안 관리</p>
                                </div>
                            </div>
                        </div>

                        {/* Approver Card */}
                        <div 
                            onClick={() => setSelectedRole('approver')}
                            className={`cursor-pointer w-[240px] h-[240px] rounded-[20px] p-[12px] flex flex-col relative border transition-all ${
                                selectedRole === 'approver' 
                                ? 'bg-[#f0fdf4] border-[#86efac]' 
                                : 'bg-[#f8f9fa] border-[#adb5bd]'
                            }`}
                        >
                             <div className="flex justify-end w-full">
                                {selectedRole === 'approver' ? (
                                    <CheckCircle className="w-[24px] h-[24px] text-[#009619]" />
                                ) : (
                                    <Circle className="w-[24px] h-[24px] text-[#adb5bd]" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
                                <CheckSquare className={`w-[80px] h-[80px] ${selectedRole === 'approver' ? 'text-[#009619]' : 'text-[#adb5bd]'}`} />
                                <p className={`font-body-small ${selectedRole === 'approver' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>결재자</p>
                                <div className={`font-detail-small text-center ${selectedRole === 'approver' ? 'text-[#008233]' : 'text-[#adb5bd]'}`}>
                                    <p>ESG 진단표 검토</p>
                                    <p>협력사 내 권한 관리</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Dropdown */}
                <div className="flex flex-col gap-[12px]">
                    <p className="font-title-medium text-[#212529]">회사명</p>
                    <div className="relative w-full">
                        <div 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-white border border-[#dee2e6] rounded-[20px] px-[24px] py-[18px] flex items-center justify-between cursor-pointer"
                        >
                            <p className={`font-body-small ${selectedCompany ? 'text-[#212529]' : 'text-[#adb5bd]'}`}>
                                {selectedCompany || '회사를 선택해주세요.'}
                            </p>
                            <ChevronDown className="w-[24px] h-[24px] text-[#212529]" />
                        </div>
                        
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[20px] overflow-hidden z-10 shadow-lg">
                                {companies.map((company, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => {
                                            setSelectedCompany(company);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="px-[24px] py-[12px] hover:bg-[#eff4fc] cursor-pointer"
                                    >
                                        <p className="font-body-small text-[#212529]">{company}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button 
                        variant="primary" 
                        size="large" 
                        className="w-full h-[64px] rounded-[20px] text-[18px] bg-[#003087]"
                        onClick={handleSubmit}
                    >
                        권한요청
                    </Button>
                </div>

            </div>
        </div>
      </div>
    </GuestLayout>
  );
}
