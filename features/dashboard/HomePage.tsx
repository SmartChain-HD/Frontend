import { useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import svgPaths from '../../imports/svg-yb3cdvmzdp';

interface HomePageProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

// Mock data for submissions
const mockSubmissions = {
  safety: [
    { company: '(주)ABC사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'pending' },
    { company: '(주)XYZ사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'approved' },
    { company: '(주)DEF사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'rejected' },
    { company: '(주)GHI사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'review' },
    { company: '(주)JKL사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'review' },
    { company: '(주)MNO사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'review' },
    { company: '(주)PQR사', period: '25년 4월 안전보건 점검', date: '2026/01/09', status: 'pending' },
  ],
  compliance: [
    { company: '(주)ABC사', period: '25년 4월 컴플라이언스 점검', date: '2026/01/08', status: 'approved' },
    { company: '(주)XYZ사', period: '25년 4월 컴플라이언스 점검', date: '2026/01/08', status: 'review' },
  ],
  esg: [
    { company: '(주)ABC사', period: '25년 4월 ESG 점검', date: '2026/01/07', status: 'approved' },
    { company: '(주)XYZ사', period: '25년 4월 ESG 점검', date: '2026/01/07', status: 'review' },
  ],
};

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

// Notification Feed Component
function NotificationFeed() {
  const notifications = [
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
    { time: '10:15 AM', message: '[A협력사] 안전교육 미이수 인원 (3명) 확인' },
  ];

  return (
    <div className="bg-white rounded-[20px] p-[44px] h-[555px] overflow-auto">
      <p className="font-title-large text-[#212529] mb-[32px]">
        실시간 알림 피드
      </p>
      <div className="relative">
        {notifications.map((notif, index) => (
          <div key={index} className="relative mb-[32px] pl-[28px]">
            {/* Timeline dot */}
            <div className="absolute left-0 top-[2px] w-[16px] h-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="5" fill="#DC2626" />
              </svg>
            </div>
            {/* Timeline line */}
            {index < notifications.length - 1 && (
              <div className="absolute left-[7.5px] top-[18px] w-[1px] h-[32px] bg-[#ADB5BD]" />
            )}
            {/* Content */}
            <div>
              <p className="font-body-small text-[#adb5bd] mb-[8px]">{notif.time}</p>
              <p className="font-body-medium text-[#212529]">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ userRole }: HomePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'safety' | 'compliance' | 'esg'>('safety');

  const tabs = [
    { key: 'safety' as const, label: '안전보건' },
    { key: 'compliance' as const, label: '컴플라이언스' },
    { key: 'esg' as const, label: 'ESG' },
  ];

  const currentSubmissions = mockSubmissions[activeTab];

  // Role-specific stats
  const stats = {
    receiver: [
      { label: '전체 협력사', value: '3,354', color: 'text-[#212529]' },
      { label: '미제출', value: '12', color: 'text-[#b91c1c]' },
      { label: '검토중', value: '45', color: 'text-[#002554]' },
      { label: '보완요청', value: '28', color: 'text-[#e65100]' },
      { label: '완료', value: '3,269', color: 'text-[#008233]' },
    ],
    drafter: [
      { label: '총 제출', value: '48', color: 'text-[#212529]' },
      { label: '검토중', value: '12', color: 'text-[#002554]' },
      { label: '승인', value: '32', color: 'text-[#008233]' },
      { label: '반려', value: '4', color: 'text-[#b91c1c]' },
    ],
    approver: [
      { label: '대기중', value: '23', color: 'text-[#002554]' },
      { label: '승인', value: '156', color: 'text-[#008233]' },
      { label: '반려', value: '8', color: 'text-[#b91c1c]' },
    ],
  };

  const currentStats = stats[userRole];

  const handleCreateDraft = () => {
    navigate(`/dashboard/${activeTab}/upload`);
  };

  const handleRowClick = (index: number) => {
    navigate(`/dashboard/${activeTab}/review/${index + 1}`);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8 w-full">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="font-heading-medium text-[#212529]">대시보드</h1>
          {userRole === 'drafter' && (
            <button
              onClick={handleCreateDraft}
              className="bg-[#003087] text-white px-[24px] py-[12px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
            >
              + 새 기안 생성
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-[20px] p-6 md:p-11 flex flex-wrap gap-8 md:gap-[100px] justify-between md:justify-start">
          {currentStats.map((stat, index) => (
            <div key={index} className="min-w-[120px]">
              <p className="font-title-medium text-[#212529] mb-[16px]">
                {stat.label}
              </p>
              <p className={`font-heading-medium ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,600px] gap-8">
          {/* Left: Submission List with Tabs */}
          <div className="bg-white rounded-[20px] p-6 md:p-11 overflow-hidden">
            <h2 className="font-title-large text-[#212529] mb-[32px]">
              {userRole === 'receiver' && '협력사 리스크 현황'}
              {userRole === 'drafter' && '제출 내역'}
              {userRole === 'approver' && '검토 대기 목록'}
            </h2>

            {/* Tabs */}
            <div className="flex gap-[8px] mb-[24px] border-b border-[#dee2e6] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-[24px] py-[12px] font-title-small border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#003087] text-[#003087]'
                      : 'border-transparent text-[#adb5bd] hover:text-[#212529]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
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
                  {currentSubmissions.map((item, index) => (
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

          {/* Right: Notification Feed */}
          <NotificationFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}