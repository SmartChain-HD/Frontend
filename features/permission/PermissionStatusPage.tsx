import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import GuestLayout from '../../shared/layout/GuestLayout';

export default function PermissionStatusPage() {
  const [requestDetails, setRequestDetails] = useState<{
    role: string;
    company: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('requestedRole');
    const company = localStorage.getItem('requestedCompany');
    // Mock date if not stored
    const date = new Date().toLocaleString('ko-KR', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    }).replace(/\./g, '-').replace(/ /g, ' '); 

    if (role && company) {
        setRequestDetails({ role: role === 'drafter' ? '기안자' : '결재자', company, date });
    }
  }, []);

  if (!requestDetails) {
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
                        권한요청 승인 대기 중입니다.
                    </p>
                </div>

                <p className="font-title-medium text-[#212529]">요청 현황</p>

                {/* Status Box */}
                <div className="bg-white rounded-[20px] p-[24px] border border-[#b0cbef] w-full relative">
                    <div className="flex flex-col gap-[12px]">
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">요청일시</p>
                            <p className="font-body-medium">{requestDetails.date}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">요청권한</p>
                            <p className="font-body-medium">{requestDetails.role}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">회사명</p>
                            <p className="font-body-medium">{requestDetails.company}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-title-small mb-1">이름</p>
                            <p className="font-body-medium">김방문</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </GuestLayout>
  );
}
