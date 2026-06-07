'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main
        style={{
          minHeight: isAdmin ? '100vh' : 'calc(100vh - var(--header-height))',
        }}
      >
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
