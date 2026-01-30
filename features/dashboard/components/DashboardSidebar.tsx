import { useState } from 'react';

// Simple SVG Icons
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function FileSearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <circle cx="11.5" cy="14.5" r="2.5"></circle>
      <path d="M13.3 16.3 15 18"></path>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 1v6m0 6v6"></path>
      <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"></path>
      <path d="M1 12h6m6 0h6"></path>
      <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"></path>
    </svg>
  );
}

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

export function DashboardSidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems: SidebarItem[] = [
    { icon: <HomeIcon />, label: '대시보드', href: 'dashboard' },
    { icon: <FileTextIcon />, label: '안전보건', href: 'safety' },
    { icon: <FileTextIcon />, label: '협력회사이력서', href: 'history' },
    { icon: <FileSearchIcon />, label: 'ESG', href: 'esg' }
  ];

  return (
    <div className="w-[240px] bg-white border-r border-[var(--color-border-default)] h-full">
      <div className="flex flex-col p-[16px]">
        {/* Home Icon */}
        <div className="p-[12px] mb-[8px]">
          <div className="text-[var(--color-primary-main)]">
            <HomeIcon />
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="space-y-[4px]">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setActiveItem(item.href)}
              className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] font-body-medium transition-colors ${
                activeItem === item.href
                  ? 'bg-[var(--color-surface-primary)] text-[var(--color-primary-main)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-primary)]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* Settings at Bottom */}
        <div className="mt-auto pt-[24px]">
          <button className="w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] font-body-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-primary)] transition-colors">
            <SettingsIcon />
            <span>ESG</span>
          </button>
        </div>
      </div>
    </div>
  );
}