import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';
import type { DomainCode } from '../../src/types/api.types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  domainCode?: DomainCode;
}

interface DomainMenuItem {
  label: string;
  domainCode: DomainCode;
}

const DOMAIN_ITEMS: DomainMenuItem[] = [
  { label: '안전보건', domainCode: 'SAFETY' },
  { label: '컴플라이언스', domainCode: 'COMPLIANCE' },
  { label: 'ESG', domainCode: 'ESG' },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest, getAccessibleDomains } = useAuthStore();

  const isUserGuest = isGuest();
  const accessibleDomains = getAccessibleDomains();

  if (isUserGuest) {
    return null;
  }

  const isReviewer = user?.role?.code === 'REVIEWER';
  const menuItems: MenuItem[] = [{ label: '홈', path: '/dashboard' }];

  DOMAIN_ITEMS.forEach((item) => {
    if (accessibleDomains.includes(item.domainCode)) {
      const basePath = isReviewer ? '/reviews' : '/diagnostics';
      menuItems.push({
        label: item.label,
        path: `${basePath}?domainCode=${item.domainCode}`,
        domainCode: item.domainCode,
      });
    }
  });

  if (isReviewer) {
    menuItems.push({ label: '권한 관리', path: '/dashboard/permission' });
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-[60px] left-0 bottom-0 z-30
          md:static md:z-10
          bg-white flex flex-col items-start py-[16px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] w-[300px] shrink-0
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {menuItems.map((item) => {
          // 쿼리 파라미터가 있는 경로 처리 (예: /diagnostics?domainCode=SAFETY)
          const [itemPath, itemQuery] = item.path.split('?');
          const isActive = itemQuery
            ? location.pathname === itemPath && location.search === `?${itemQuery}`
            : item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
          return (
            <div
              key={item.path}
              className={`h-[61px] relative shrink-0 w-full cursor-pointer ${
                isActive ? 'bg-white' : ''
              }`}
              onClick={() => handleNavigate(item.path)}
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
    </>
  );
}
