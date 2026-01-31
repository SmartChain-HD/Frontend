import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';

interface ESGPageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

const mockSubmissions = [
  { company: '(주)ABC사', period: '25년 4월 ESG 점검', date: '2026/01/07', status: 'approved' },
  { company: '(주)XYZ사', period: '25년 4월 ESG 점검', date: '2026/01/07', status: 'review' },
  { company: '(주)DEF사', period: '25년 4월 ESG 점검', date: '2026/01/07', status: 'rejected' },
];

const statusLabels = {
  pending: '보완',
  approved: '적합',
  rejected: '부적합',
  review: '검토',
};

const statusColors = {
  pending: 'text-[#e65100] bg-[#fff3e0]',
  approved: 'text-[#008233] bg-[#f0fdf4]',
  rejected: 'text-[#b91c1c] bg-[#fef2f2]',
  review: 'text-[#002554] bg-[#e3f2fd]',
};

export default function ESGPage({ userRole }: ESGPageProps) {
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate('/dashboard/esg/upload');
  };

  const handleRowClick = (index: number) => {
    navigate(`/dashboard/esg/review/${index + 1}`);
  };

  return (
    <DashboardLayout>
      <div className="p-[32px]">
        <div className="bg-white rounded-[20px] p-[44px] min-h-[600px]">
          <div className="flex items-center justify-between mb-[32px]">
            <h1 className="font-heading-medium text-[#212529]">
              ESG
            </h1>
            {userRole === 'drafter' && (
              <button
                onClick={handleUpload}
                className="bg-[#003087] text-white px-[24px] py-[12px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
              >
                + 새 기안 생성
              </button>
            )}
          </div>

          {/* Submission List */}
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#dee2e6]">
                  <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    협력사 명
                  </th>
                  <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    기간
                  </th>
                  <th className="text-left py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    제출일
                  </th>
                  <th className="text-center py-[12px] px-[16px] font-title-xsmall text-[#868e96]">
                    결과
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockSubmissions.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
                    onClick={() => handleRowClick(index)}
                  >
                    <td className="py-[16px] px-[16px] font-body-small text-[#212529]">
                      {item.company}
                    </td>
                    <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
                      {item.period}
                    </td>
                    <td className="py-[16px] px-[16px] font-body-small text-[#495057]">
                      {item.date}
                    </td>
                    <td className="py-[16px] px-[16px] text-center">
                      <span
                        className={`inline-block px-[12px] py-[4px] rounded-[6px] font-title-xsmall ${
                          statusColors[item.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[item.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}