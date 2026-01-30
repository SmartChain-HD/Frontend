import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface GuestLayoutProps {
  children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  // Fallback to defaults if not found (though they should be set by login)
  const userRole = (localStorage.getItem('userRole') as 'guest') || 'guest';
  const userName = localStorage.getItem('userName') || '방문자';

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col">
      {/* Header */}
      <Header userName={userName} userRole={userRole} />

      {/* Main Content Area - Centered for Guest */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto">
          {children}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
