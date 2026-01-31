import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuthStore } from '../../src/store/authStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  const userRole = (() => {
    if (!user?.role) return 'drafter' as const;
    const code = user.role.code;
    if (code === 'REVIEWER') return 'receiver' as const;
    if (code === 'APPROVER') return 'approver' as const;
    return 'drafter' as const;
  })();

  const userName = user?.name || '사용자';

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col">
      <Header userName={userName} userRole={userRole} />
      <div className="flex flex-1 relative">
        <Sidebar userRole={userRole} />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
