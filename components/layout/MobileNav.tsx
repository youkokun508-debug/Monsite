'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PUBLIC_NAV_LINKS } from '@/lib/constants';
import type { Profile } from '@/lib/types';

interface MobileNavProps {
  isOpen: boolean;
  user: Profile | null;
  onClose: () => void;
}

export function MobileNav({ isOpen, user, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        backgroundColor: 'rgba(10, 10, 8, 0.98)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Fermer le menu"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--color-gold)',
          fontSize: '1.8rem',
          cursor: 'pointer',
          padding: '0.5rem',
        }}
      >
        ✕
      </button>

      {/* Logo */}
      <Link
        href="/"
        onClick={onClose}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 300,
          color: 'var(--color-gold)',
          textDecoration: 'none',
          marginBottom: '1rem',
          textShadow: 'var(--shadow-gold)',
        }}
      >
        Da Enzo
      </Link>

      {/* Navigation Links */}
      {PUBLIC_NAV_LINKS.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          style={{
            fontFamily: 'var(--font-accent)',
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:
              pathname === link.href
                ? 'var(--color-gold)'
                : 'var(--color-text-secondary)',
            textDecoration: 'none',
            transition: `all 0.3s ease ${index * 0.05}s`,
            transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
            opacity: isOpen ? 1 : 0,
          }}
        >
          {link.label}
        </Link>
      ))}

      {/* Separator */}
      <div
        style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
          margin: '0.5rem 0',
        }}
      />

      {/* Auth */}
      {user ? (
        <Link
          href={user.role === 'admin' ? '/admin' : '/mon-compte'}
          onClick={onClose}
          className="btn btn-primary"
        >
          {user.role === 'admin' ? 'Admin' : 'Mon Compte'}
        </Link>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Link href="/auth/login" onClick={onClose} className="btn btn-primary">
            Connexion
          </Link>
          <Link href="/auth/register" onClick={onClose} className="btn btn-ghost">
            Créer un compte
          </Link>
        </div>
      )}
    </div>
  );
}
