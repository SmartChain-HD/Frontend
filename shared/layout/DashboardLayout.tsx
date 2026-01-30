import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const userRole = localStorage.getItem('userRole') as 'receiver' | 'drafter' | 'approver';
  const userName = localStorage.getItem('userName') || '사용자';

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col">
      {/* Header */}
      <Header userName={userName} userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar userRole={userRole} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
