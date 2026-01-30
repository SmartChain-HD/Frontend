import { Logo } from '../../../shared/components/Logo';

interface HeaderProps {
  userName: string;
  userRole: 'receiver' | 'drafter' | 'approver';
}

const roleLabels = {
  receiver: '수신자',
  drafter: '기안자',
  approver: '결재자'
};

const roleBadgeColors = {
  receiver: 'bg-[#DDE8F9] text-[#002970]',
  drafter: 'bg-[#00AD1D] text-white',
  approver: 'bg-[#FF8F00] text-white'
};

// Simple Bell Icon SVG
function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

export function DashboardHeader({ userName, userRole }: HeaderProps) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="bg-[var(--color-primary-main)] h-[72px] w-full">
      <div className="flex items-center justify-between px-[40px] h-full">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-[24px]">
          <Logo size="small" className="text-white" />
          <div className="h-[24px] w-[1px] bg-white/30" />
          <p className="font-title-medium text-white">현대중공업 협력사 통합관리시스템</p>
        </div>
        
        {/* Right: User Info and Notifications */}
        <div className="flex items-center gap-[24px]">
          <div className="flex items-center gap-[12px]">
            <p className="font-body-medium text-white">{userName}</p>
            <span className={`px-[12px] py-[4px] rounded-[12px] font-detail-medium ${roleBadgeColors[userRole]}`}>
              {roleLabels[userRole]}
            </span>
          </div>
          
          <div className="h-[24px] w-[1px] bg-white/30" />
          
          <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
            <BellIcon />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          <button onClick={handleLogout} className="font-body-medium text-white hover:text-white/80 transition-colors">
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}