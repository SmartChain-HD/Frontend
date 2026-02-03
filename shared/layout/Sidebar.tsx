import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import type { DomainCode } from '../../src/types/api.types';

interface MenuItem {
  label: string;
  path: string;
  domainCode?: DomainCode;
}

const DOMAIN_MENU_ITEMS: MenuItem[] = [
  { label: '안전보건', path: '/dashboard/safety', domainCode: 'SAFETY' },
  { label: '컴플라이언스', path: '/dashboard/compliance', domainCode: 'COMPLIANCE' },
  { label: 'ESG', path: '/dashboard/esg', domainCode: 'ESG' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest, getAccessibleDomains } = useAuthStore();

  const isUserGuest = isGuest();
  const accessibleDomains = getAccessibleDomains();

  if (isUserGuest) {
    return null;
  }

  const menuItems: MenuItem[] = [{ label: '홈', path: '/dashboard' }];

  DOMAIN_MENU_ITEMS.forEach((item) => {
    if (item.domainCode && accessibleDomains.includes(item.domainCode)) {
      menuItems.push(item);
    }
  });

  if (user?.role?.code === 'REVIEWER') {
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
