'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: 'auto',
        }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 300,
            color: 'var(--color-gold)',
            textDecoration: 'none',
            textShadow: 'var(--shadow-gold)',
            marginBottom: '0.5rem',
            display: 'block',
          }}
        >
          Da Enzo
        </Link>
        <span
          className="badge badge-gold"
          style={{ alignSelf: 'flex-start', marginBottom: '2rem' }}
        >
          Administration
        </span>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {ADMIN_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              marginBottom: '0.5rem',
            }}
          >
            🌐 Voir le site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              color: 'var(--color-error)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              width: '100%',
              textAlign: 'left',
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: '260px',
          padding: '2rem',
          minHeight: '100vh',
        }}
        className="admin-main"
      >
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 100% !important;
            position: relative !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
