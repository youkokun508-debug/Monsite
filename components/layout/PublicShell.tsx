'use client';

import { usePathname } from 'next/navigation';
import { RestaurantPhoneContext } from '@/components/PhoneLink';
import { Header } from './Header';
import { Footer } from './Footer';

interface PublicShellProps {
  children: React.ReactNode;
  footerPhone?: string;
  footerAddress?: string;
  footerEmail?: string;
}

export function PublicShell({ children, footerPhone, footerAddress, footerEmail }: PublicShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <RestaurantPhoneContext.Provider value={footerPhone || '01 43 76 05 70'}>
      {!isAdmin && <Header />}
      <main
        style={{
          minHeight: isAdmin ? '100vh' : 'calc(100vh - var(--header-height))',
        }}
      >
        {children}
      </main>
      {!isAdmin && <Footer phone={footerPhone} address={footerAddress} email={footerEmail} />}
    </RestaurantPhoneContext.Provider>
  );
}
