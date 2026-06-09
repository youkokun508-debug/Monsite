'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const DAYS = [
  { key: 'hours_mon', label: 'Lundi' },
  { key: 'hours_tue', label: 'Mardi' },
  { key: 'hours_wed', label: 'Mercredi' },
  { key: 'hours_thu', label: 'Jeudi' },
  { key: 'hours_fri', label: 'Vendredi' },
  { key: 'hours_sat', label: 'Samedi' },
  { key: 'hours_sun', label: 'Dimanche' },
];

const CONTENT_KEYS = ['phone', 'address', 'email', ...DAYS.map((d) => d.key)];

export default function ContactPage() {
  const [content, setContent] = useState<Record<string, string>>({
    phone: '01 43 68 XX XX',
    address: '12 Rue de Paris, 94220 Charenton-le-Pont',
    email: 'contact@daenzopizza.fr',
    hours_mon: '12h00 – 14h30 / 18h30 – 23h00',
    hours_tue: '12h00 – 14h30 / 18h30 – 23h00',
    hours_wed: '12h00 – 14h30 / 18h30 – 23h00',
    hours_thu: '12h00 – 14h30 / 18h30 – 23h00',
    hours_fri: '12h00 – 14h30 / 18h30 – 23h00',
    hours_sat: '12h00 – 14h30 / 18h30 – 23h00',
    hours_sun: '18h30 – 23h00',
  });

  useEffect(() => {
    async function fetchContent() {
      const supabase = createClient();
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .in('key', CONTENT_KEYS);

      if (data && data.length > 0) {
        const map: Record<string, string> = {};
        data.forEach((item) => { map[item.key] = item.value; });
        setContent((prev) => ({ ...prev, ...map }));
      }
    }
    fetchContent();
  }, []);

  return (
    <>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: 'clamp(3rem, 8vw, 6rem) 1.5rem clamp(2rem, 4vw, 3rem)' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-subtitle"
        >
          Nous Contacter
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="gold-underline"
          style={{ display: 'inline-block' }}
        >
          Contact
        </motion.h1>
      </section>

      <div className="section" style={{ paddingTop: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3rem',
          }}
          className="contact-grid"
        >
          {/* Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>📍</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
                  Adresse
                </h3>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {content.address}
                </p>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>📞</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
                  Téléphone
                </h3>
                <a
                  href={`tel:${content.phone.replace(/\s/g, '')}`}
                  style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                >
                  {content.phone}
                </a>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>✉️</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
                  Email
                </h3>
                <a
                  href={`mailto:${content.email}`}
                  style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                >
                  {content.email}
                </a>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem', flexShrink: 0 }}>🕐</span>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '1rem' }}>
                    Horaires d&apos;ouverture
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    {DAYS.map((day) => (
                      <div key={day.key} style={{ display: 'contents' }}>
                        <span style={{ color: 'var(--color-gold-muted)', fontFamily: 'var(--font-accent)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                          {day.label}
                        </span>
                        <span style={{ color: content[day.key] === 'Fermé' ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                          {content[day.key] || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              minHeight: '400px',
            }}
          >
            <iframe
              src="https://maps.google.com/maps?q=Da+Enzo+Pizzeria,+4+Rue+de+Paris,+94220+Charenton-le-Pont&output=embed&hl=fr"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px', filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Da Enzo Pizza — Localisation"
            />
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
