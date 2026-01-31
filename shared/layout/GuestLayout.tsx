import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuthStore } from '../../src/store/authStore';

interface GuestLayoutProps {
  children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  const { user } = useAuthStore();
  const userName = user?.name || '방문자';

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col">
      <Header userName={userName} userRole="guest" />
      <div className="flex-1 w-full max-w-[1920px] mx-auto">
          {children}
      </div>
      <Footer />
    </div>
  );
}
