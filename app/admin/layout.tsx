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
      className="admin-shell"
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
          className="badge badge-gold admin-badge"
          style={{ alignSelf: 'flex-start', marginBottom: '2rem' }}
        >
          Administration
        </span>

        {/* Navigation */}
        <nav className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {ADMIN_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link${isActive ? ' is-active' : ''}`}
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
        <div className="admin-bottom" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
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
            <span aria-hidden>🌐</span> <span className="admin-label">Voir le site</span>
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
            <span aria-hidden>🚪</span> <span className="admin-label">Déconnexion</span>
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
          /* Sur téléphone : barre en haut + menu horizontal qui défile */
          .admin-shell {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            position: sticky !important;
            top: 0 !important;
            bottom: auto !important;
            padding: 0.6rem 0.75rem 0.5rem !important;
            border-right: none !important;
            border-bottom: 1px solid var(--color-border) !important;
            display: grid !important;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            column-gap: 0.6rem;
            overflow: visible !important;
            backdrop-filter: blur(8px);
          }
          .admin-sidebar > a:first-child {
            margin-bottom: 0 !important;
            font-size: 1.25rem !important;
          }
          .admin-badge {
            margin-bottom: 0 !important;
            align-self: center !important;
            justify-self: start;
            font-size: 0.65rem;
          }
          .admin-bottom {
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
            display: flex;
            gap: 0.25rem;
          }
          .admin-bottom a,
          .admin-bottom button {
            padding: 0.4rem 0.5rem !important;
            margin: 0 !important;
            width: auto !important;
            font-size: 1.1rem !important;
          }
          .admin-label {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
          }
          .admin-nav {
            grid-column: 1 / -1;
            flex-direction: row !important;
            overflow-x: auto;
            gap: 0.4rem !important;
            margin-top: 0.6rem;
            padding-bottom: 0.25rem;
            scrollbar-width: none;
          }
          .admin-nav::-webkit-scrollbar { display: none; }
          .admin-nav-link {
            flex: 0 0 auto;
            padding: 0.5rem 0.85rem !important;
            border-left: none !important;
            border: 1px solid var(--color-border) !important;
            border-radius: 999px !important;
            font-size: 0.85rem !important;
            white-space: nowrap;
          }
          .admin-nav-link.is-active {
            border-color: var(--color-gold) !important;
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 1.25rem 1rem 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
