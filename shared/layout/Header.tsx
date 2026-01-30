import { useNavigate } from 'react-router';
import svgPaths from '../../imports/svg-h10djjhihc';

interface HeaderProps {
  userName: string;
  userRole: 'receiver' | 'drafter' | 'approver' | 'guest';
}

const roleLabels = {
  receiver: '수신자',
  drafter: '기안자',
  approver: '결재자',
  guest: '게스트',
};

export default function Header({ userName, userRole }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="bg-[#002554] h-[85px] w-full flex items-center justify-between px-[30px] shadow-md z-50 relative">
      {/* Left Side */}
      <div className="flex items-center gap-[24px]">
        {/* Logo */}
        <div className="w-[136px] shrink-0">
          <p className="font-heading-small text-white">
            SmartChain
          </p>
        </div>

        {/* Divider */}
        <div className="h-[24px] w-px bg-white/30" />

        {/* System Title */}
        <p className="font-title-medium text-white whitespace-nowrap">
          현대중공업 협력사 통합관리시스템
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-[24px]">
        {/* User Info */}
        <div className="flex items-center gap-[8px]">
          <p className="font-body-medium text-white">
            {userName}
          </p>
          <div className="bg-[#f0fdf4] flex items-center justify-center px-[8px] py-[4px] rounded-[6px] border border-[#008233]">
            <p className="font-title-small text-[#008233]">
              {roleLabels[userRole]}
            </p>
          </div>
        </div>

        {/* Notification Icon */}
        <div className="size-[24px] cursor-pointer">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <g>
              <mask height="24" id="mask0_1_2929" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }} width="24" x="0" y="0">
                <rect fill="#D9D9D9" height="24" width="24" />
              </mask>
              <g mask="url(#mask0_1_2929)">
                <path d={svgPaths.p22390780} fill="white" />
              </g>
            </g>
          </svg>
        </div>

        {/* Divider */}
        <div className="h-[24px] w-px bg-white/30" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="font-title-medium text-white cursor-pointer hover:opacity-80 whitespace-nowrap"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
