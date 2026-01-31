import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  userRole: 'receiver' | 'drafter' | 'approver';
}

interface MenuItem {
  label: string;
  path: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { label: '홈', path: '/dashboard' },
    { label: '안전보건', path: '/dashboard/safety' },
    { label: '컴플라이언스', path: '/dashboard/compliance' },
    { label: 'ESG', path: '/dashboard/esg' },
  ];

  if (userRole === 'receiver') {
    menuItems.push({ label: '권한 관리', path: '/dashboard/permission' });
  }

  return (
    <div className="bg-white flex flex-col items-start py-[16px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] w-[300px] shrink-0 z-10">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <div
            key={item.path}
            className={`h-[61px] relative shrink-0 w-full cursor-pointer ${
              isActive ? 'bg-white' : ''
            }`}
            onClick={() => navigate(item.path)}
          >
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center px-[24px] py-[18px] relative size-full">
                <p
                  className={`flex-1 font-title-medium ${
                    isActive ? 'text-[#002554]' : 'text-[#adb5bd]'
                  }`}
                >
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
