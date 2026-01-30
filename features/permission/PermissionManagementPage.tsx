import { useState } from 'react';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { Search, Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import PermissionModal from './PermissionModal';

interface Request {
    id: string;
    name: string;
    company: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    role: 'drafter' | 'approver';
}

const mockRequests: Request[] = [
    { id: 'campaign0001', name: '김요청', company: '(주) 00회사', date: '2026/01/09', status: 'pending', role: 'drafter' },
    { id: 'campaign0002', name: '박요청', company: '(주) 00회사', date: '2026/01/09', status: 'approved', role: 'approver' },
    { id: 'campaign0003', name: '이요청', company: '(주) 00회사', date: '2026/01/09', status: 'approved', role: 'drafter' },
    { id: 'campaign0004', name: '최요청', company: '(주) 00회사', date: '2026/01/09', status: 'rejected', role: 'drafter' },
    { id: 'campaign0005', name: '정요청', company: '(주) 00회사', date: '2026/01/09', status: 'rejected', role: 'drafter' },
];

export default function PermissionManagementPage() {
    const [requests, setRequests] = useState<Request[]>(mockRequests);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleManageClick = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleConfirm = (action: 'approve' | 'reject') => {
        if (selectedRequest) {
            setRequests(requests.map(req => 
                req.id === selectedRequest.id 
                    ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } 
                    : req
            ));
        }
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const StatusBadge = ({ status }: { status: Request['status'] }) => {
        const styles = {
            pending: 'bg-white border border-[#adb5bd] text-[#adb5bd]', // '승인 대기' as per screenshot might be gray outline? Screenshot shows '승인 대기' in gray pill.
            approved: 'bg-[#f0fdf4] border border-[#009619] text-[#009619]',
            rejected: 'bg-[#fff5f5] border border-[#e03131] text-[#e03131]',
        };
        const labels = {
            pending: '승인 대기',
            approved: '승인',
            rejected: '반려',
        };

        return (
            <div className={`px-[12px] py-[4px] rounded-[20px] inline-flex items-center justify-center ${styles[status]}`}>
                 <span className="font-detail-small">{labels[status]}</span>
            </div>
        );
    };

    const RoleBadge = ({ role }: { role: Request['role'] }) => {
        const styles = {
            drafter: 'border border-[#003087] text-[#003087]',
            approver: 'border border-[#e65100] text-[#e65100]',
        };
        const labels = {
            drafter: '작성자', // Screenshot says '작성자' for Drafter? Or '기안자'? Screenshot shows '작성자'.
            approver: '결재자',
        };
         return (
            <div className={`px-[12px] py-[4px] rounded-[6px] border inline-flex items-center justify-center ${styles[role]}`}>
                 <span className="font-detail-small">{labels[role]}</span>
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
                 <button className="h-[64px] px-[24px] bg-white border border-[#212529] text-[#212529] rounded-[20px] font-title-medium">
                    초기화
                 </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] p-[24px] shadow-sm overflow-hidden">
                <div className="px-[24px] py-[12px] border-b border-[#f1f3f5]">
                    <h2 className="font-title-medium">요청 목록</h2>
                </div>
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
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.id}</td>
                                    <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.name}</td>
                                    <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.company}</td>
                                    <td className="py-[12px] px-[12px] text-center font-body-small text-[#212529] border-b border-[#dee2e6]">{req.date}</td>
                                    <td className="py-[12px] px-[12px] text-center border-b border-[#dee2e6]">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="py-[12px] px-[12px] text-center border-b border-[#dee2e6]">
                                        <RoleBadge role={req.role} />
                                    </td>
                                    <td className="py-[12px] px-[12px] text-center border-b border-[#dee2e6]">
                                        <button onClick={() => handleManageClick(req)} className="p-1 hover:bg-gray-200 rounded-full">
                                            <MoreVertical className="w-[20px] h-[20px] text-[#003087]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
