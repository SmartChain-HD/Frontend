import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import svgPaths from '../../imports/svg-h10djjhihc';
import { useLogout } from '../../src/hooks/useAuth';
import { useNotifications, useUnreadCount, useMarkAsRead } from '../../src/hooks/useNotifications';
import { useAuthStore } from '../../src/store/authStore';

interface HeaderProps {
  userName: string;
  userRole: 'receiver' | 'drafter' | 'approver' | 'guest';
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

const roleLabels = {
  receiver: '수신자',
  drafter: '기안자',
  approver: '결재자',
  guest: '게스트',
};

const domainShortLabels: Record<string, string> = {
  ESG: 'ESG',
  SAFETY: '안전',
  COMPLIANCE: '컴플',
};

function formatShortTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분`;
  if (diffHour < 24) return `${diffHour}시간`;
  if (diffDay < 7) return `${diffDay}일`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications({ page: 0, size: 5 });
  const markAsReadMutation = useMarkAsRead();
  const notifications = data?.content || [];

  const handleClickItem = (notificationId: number, read: boolean, link?: string) => {
    if (!read) {
      markAsReadMutation.mutate([notificationId]);
    }
    onClose();
    if (link) {
      navigate(link);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] w-[calc(100vw-32px)] md:w-[360px] max-w-[360px] bg-white rounded-[12px] shadow-lg border border-gray-200 z-[100] overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-gray-100">
        <span className="font-title-small text-[var(--color-text-primary)]">알림</span>
        <button
          onClick={handleViewAll}
          className="font-title-small text-[var(--color-primary-main)] hover:underline"
        >
          전체보기
        </button>
      </div>

      {/* 목록 */}
      <div className="max-h-[320px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-[32px]">
            <div className="w-[24px] h-[24px] border-[2px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-[32px]">
            <p className="font-body-medium text-[var(--color-text-tertiary)]">알림이 없습니다.</p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.notificationId}
            onClick={() => handleClickItem(n.notificationId, n.read, n.link)}
            className={`flex items-start gap-[12px] px-[16px] py-[12px] cursor-pointer transition-colors ${
              n.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
            }`}
          >
            {!n.read && (
              <div className="pt-[6px] shrink-0">
                <div className="w-[6px] h-[6px] rounded-full bg-[var(--color-primary-main)]" />
              </div>
            )}
            <div className={`flex-1 min-w-0 ${n.read ? 'pl-[18px]' : ''}`}>
              <p className="font-title-xsmall text-[var(--color-text-primary)] truncate">{n.title}</p>
              <p className="font-detail-small text-[var(--color-text-secondary)] truncate">{n.message}</p>
            </div>
            <span className="font-detail-small text-[var(--color-text-tertiary)] shrink-0 pt-[2px]">
              {formatShortTime(n.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header({ userName, userRole, onToggleSidebar, showMenuButton }: HeaderProps) {
  const logoutMutation = useLogout();
  const { data: unreadCount } = useUnreadCount();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const domainRoles = user?.domainRoles || [];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="bg-[#002554] h-[60px] md:h-[85px] w-full flex items-center justify-between px-[16px] md:px-[30px] shadow-md z-50 relative">
      {/* Left Side */}
      <div className="flex items-center gap-[12px] md:gap-[24px]">
        {/* Hamburger Menu (mobile) */}
        {showMenuButton && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-white p-1"
            aria-label="메뉴"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link to="/dashboard" className="shrink-0 cursor-pointer">
          <p className="font-heading-small text-white">
            SmartChain
          </p>
        </Link>

        {/* Divider */}
        <div className="hidden md:block h-[24px] w-px bg-white/30" />

        {/* System Title */}
        <p className="hidden md:block font-title-medium text-white whitespace-nowrap">
          현대중공업 협력사 통합관리시스템
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-[12px] md:gap-[24px]">
        {/* User Info */}
        <div className="flex items-center gap-[8px]">
          <p className="font-body-medium text-white">
            {userName}
          </p>
          {domainRoles.length > 0 ? (
            <div className="hidden lg:flex items-center gap-[4px]">
              {domainRoles.map((dr) => (
                <div
                  key={dr.domainCode}
                  className="bg-[#f0fdf4] flex items-center justify-center px-[8px] py-[4px] rounded-[6px] border border-[#008233]"
                >
                  <p className="font-title-small text-[#008233]">
                    {domainShortLabels[dr.domainCode] || dr.domainName}-{dr.roleName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden lg:flex bg-[#f0fdf4] items-center justify-center px-[8px] py-[4px] rounded-[6px] border border-[#008233]">
              <p className="font-title-small text-[#008233]">
                {roleLabels[userRole]}
              </p>
            </div>
          )}
        </div>

        {/* Notification Icon with Badge */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="size-[24px] cursor-pointer relative"
            aria-label="알림"
          >
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
            {/* 뱃지 */}
            {typeof unreadCount === 'number' && unreadCount > 0 && (
              <span className="absolute -top-[6px] -right-[6px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-[4px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* 드롭다운 */}
          {showDropdown && (
            <NotificationDropdown onClose={() => setShowDropdown(false)} />
          )}
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
