import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function Footer() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('site_content')
    .select('key, value')
    .in('key', ['phone', 'address', 'email']);

  const content: Record<string, string> = {};
  rows?.forEach((r) => { content[r.key] = r.value; });

  const phone   = content.phone   || '01 49 76 05 60';
  const address = content.address || '4 Rue de Paris, 94220 Charenton-le-Pont';
  const email   = content.email   || 'info@daenzopizzeria.fr';
  const telHref = 'tel:+33' + phone.replace(/^0/, '').replace(/\s/g, '');

  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem) 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
        }}
      >
        {/* Brand */}
        <div>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 300,
              color: 'var(--color-gold)',
              textDecoration: 'none',
              textShadow: 'var(--shadow-gold)',
              display: 'inline-block',
              marginBottom: '1rem',
            }}
          >
            Da Enzo
          </Link>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: '280px',
            }}
          >
            L&apos;art de la pizza artisanale italienne depuis 2015. Chaque pizza est une
            célébration de la tradition napolitaine.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-gold-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Navigation
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Accueil', href: '/' },
              { label: 'Notre Menu', href: '/menu' },
              { label: 'À Propos', href: '/a-propos' },
              { label: 'Réservation', href: '/reservation' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-gold-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Contact
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)', flexShrink: 0 }}>📍</span>
              {address}
            </p>
            <a
              href={telHref}
              style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              <span style={{ color: 'var(--color-gold)' }}>📞</span>
              {phone}
            </a>
            <a
              href={`mailto:${email}`}
              style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              <span style={{ color: 'var(--color-gold)' }}>✉️</span>
              {email}
            </a>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h4
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-gold-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Horaires
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {[
              { days: 'Lun – Sam', hours: '12h00 – 14h30 / 19h00 – 23h00' },
              { days: 'Dimanche', hours: '19h00 – 23h00' },
            ].map(({ days, hours }) => (
              <p key={days} style={{ margin: 0 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{days}</span>
                {' — '}
                {hours}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '3rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <p style={{ margin: 0 }}>
          © {currentYear} Da Enzo Pizza. Tous droits réservés.
        </p>
        <p style={{ margin: 0 }}>
          {address}
        </p>
      </div>
    </footer>
  );
}
