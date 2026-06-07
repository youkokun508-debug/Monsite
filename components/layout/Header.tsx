'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PUBLIC_NAV_LINKS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { MobileNav } from './MobileNav';
import type { Profile } from '@/lib/types';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  // Hide header on admin pages (admin has its own layout)
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (profile) setUser(profile as Profile);

        // Get unread notifications count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .or(`user_id.eq.${authUser.id},user_id.is.null`);
        setUnreadCount(count || 0);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isAdmin) return null;

  return (
    <>
      <header
        id="main-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'var(--header-height)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(10, 10, 8, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        }}
      >
        <nav
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 300,
              color: 'var(--color-gold)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              textShadow: 'var(--shadow-gold)',
            }}
          >
            Da Enzo
          </Link>

          {/* Desktop Nav */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="desktop-nav"
          >
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-accent)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color:
                    pathname === link.href
                      ? 'var(--color-gold)'
                      : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-light)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    pathname === link.href
                      ? 'var(--color-gold)'
                      : 'var(--color-text-secondary)')
                }
              >
                {link.label}
                {pathname === link.href && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'var(--color-gold)',
                    }}
                  />
                )}
              </Link>
            ))}

            {/* Auth Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {unreadCount > 0 && (
                  <Link
                    href="/mon-compte/notifications"
                    style={{
                      position: 'relative',
                      color: 'var(--color-gold)',
                      fontSize: '1.2rem',
                    }}
                  >
                    🔔
                    <span
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-8px',
                        background: 'var(--color-error)',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  </Link>
                )}
                <Link
                  href={user.role === 'admin' ? '/admin' : '/mon-compte'}
                  className="btn btn-secondary btn-sm"
                >
                  {user.role === 'admin' ? 'Admin' : 'Mon Compte'}
                </Link>
              </div>
            ) : (
              <Link href="/auth/login" className="btn btn-primary btn-sm">
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              zIndex: 1002,
            }}
          >
            <div
              style={{
                width: '24px',
                height: '18px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '1.5px',
                  backgroundColor: 'var(--color-gold)',
                  transition: 'all 0.3s ease',
                  top: mobileOpen ? '8px' : '0',
                  transform: mobileOpen ? 'rotate(45deg)' : 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '100%',
                  height: '1.5px',
                  backgroundColor: 'var(--color-gold)',
                  transition: 'all 0.3s ease',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '1.5px',
                  backgroundColor: 'var(--color-gold)',
                  transition: 'all 0.3s ease',
                  top: mobileOpen ? '8px' : '16px',
                  transform: mobileOpen ? 'rotate(-45deg)' : 'none',
                }}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Overlay */}
      <MobileNav isOpen={mobileOpen} user={user} onClose={() => setMobileOpen(false)} />

      {/* Spacer for fixed header */}
      <div style={{ height: 'var(--header-height)' }} />

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
