'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { USER_NAV_LINKS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserAccountLayout({
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        minHeight: 'calc(100vh - var(--header-height) - 200px)',
      }}
      className="user-layout"
    >
      {/* Sidebar */}
      <aside
        className="user-sidebar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--color-gold)',
            marginBottom: '1.5rem',
            textShadow: 'var(--shadow-gold)',
          }}
        >
          Mon Espace
        </div>

        {USER_NAV_LINKS.map((link) => (
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
              color:
                pathname === link.href
                  ? 'var(--color-gold)'
                  : 'var(--color-text-secondary)',
              backgroundColor:
                pathname === link.href
                  ? 'rgba(201, 168, 76, 0.1)'
                  : 'transparent',
              borderLeft:
                pathname === link.href
                  ? '2px solid var(--color-gold)'
                  : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}

        <div className="separator-simple" />

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: 'var(--color-error)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font-body)',
          }}
        >
          🚪 Déconnexion
        </button>
      </aside>

      {/* Content */}
      <main>{children}</main>

      <style jsx global>{`
        @media (min-width: 768px) {
          .user-layout {
            grid-template-columns: 240px 1fr !important;
          }
          .user-sidebar {
            position: sticky;
            top: calc(var(--header-height) + 2rem);
            align-self: start;
          }
        }
      `}</style>
    </div>
  );
}
