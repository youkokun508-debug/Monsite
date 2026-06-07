'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PIZZA_CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { Pizza } from '@/lib/types';

const ANIMATION_DURATION = 0.6;

// Animated word-by-word title
function AnimatedTitle({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const words = text.split(' ');

  return (
    <h1 ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3em' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION, delay: i * 0.08, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: 'calc(-1 * var(--header-height))',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3)',
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,8,0.4) 0%, rgba(10,10,8,0.6) 50%, rgba(10,10,8,0.95) 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 1.5rem',
          maxWidth: '800px',
        }}
      >
        {/* Accent text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-accent"
          style={{ marginBottom: '1.5rem', fontSize: '0.9rem', letterSpacing: '0.3em' }}
        >
          Pizzeria Artisanale — Depuis 2015
        </motion.p>

        <AnimatedTitle text="Da Enzo" />

        {/* Gold line separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            width: '80px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
            margin: '1.5rem auto',
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--color-text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          L&apos;art de la pizza artisanale italienne, cuite au feu de bois avec des
          ingrédients d&apos;exception importés directement d&apos;Italie.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/reservation" className="btn btn-primary btn-lg">
            Réserver une table
          </Link>
          <Link href="/menu" className="btn btn-secondary btn-lg">
            Découvrir le menu
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          className="text-accent"
          style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '30px',
            background: 'linear-gradient(to bottom, var(--color-gold), transparent)',
          }}
        />
      </motion.div>
    </section>
  );
}

// Full Menu Section — fetched from Supabase, grouped by category
function FullMenuSection() {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, margin: '-80px' });
  const [items, setItems] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState('');
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('pizzas')
        .select('*')
        .eq('is_available', true)
        .order('position', { ascending: true });
      if (data) setItems(data as Pizza[]);
      setLoading(false);
    }
    fetch();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSlug(e.target.id.replace('hcat-', ''));
        });
      },
      { rootMargin: '-20% 0px -75% 0px' }
    );
    PIZZA_CATEGORIES.forEach((cat) => {
      const el = document.getElementById(`hcat-${cat.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!navRef.current || !activeSlug) return;
    const btn = navRef.current.querySelector(`[data-slug="${activeSlug}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [activeSlug]);

  const grouped = PIZZA_CATEGORIES.reduce<Record<string, Pizza[]>>((acc, cat) => {
    acc[cat.slug] = items.filter((p) => p.category === cat.slug);
    return acc;
  }, {});
  const available = PIZZA_CATEGORIES.filter((cat) => (grouped[cat.slug]?.length ?? 0) > 0);

  function scrollTo(slug: string) {
    const el = document.getElementById(`hcat-${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      {/* Section header */}
      <div ref={headerRef} className="section" style={{ paddingBottom: '2rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION }}
          className="section-subtitle"
        >
          Nos Créations
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION, delay: 0.1 }}
          className="section-title gold-underline"
          style={{ display: 'inline-block' }}
        >
          La Carte
        </motion.h2>
      </div>

      {/* Category nav */}
      {!loading && available.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 'var(--header-height)',
            zIndex: 10,
            backgroundColor: 'rgba(17, 17, 16, 0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0.6rem 0',
          }}
        >
          <div
            ref={navRef}
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1.5rem',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {available.map((cat) => (
              <button
                key={cat.slug}
                data-slug={cat.slug}
                onClick={() => scrollTo(cat.slug)}
                style={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-body)',
                  borderRadius: '2px',
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeSlug === cat.slug ? 'var(--color-gold)' : 'transparent',
                  color: activeSlug === cat.slug ? '#0A0A08' : 'var(--color-text-secondary)',
                  borderColor: activeSlug === cat.slug ? 'var(--color-gold)' : 'var(--color-border)',
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items by category */}
      <div className="section" style={{ paddingTop: '3rem' }}>
        {loading ? (
          <div className="grid-pizzas">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ padding: '2rem' }}>
                <div className="skeleton" style={{ height: '180px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          available.map((cat) => {
            const catItems = grouped[cat.slug];
            const isWine = cat.slug === 'vin';
            return (
              <section
                key={cat.slug}
                id={`hcat-${cat.slug}`}
                style={{ scrollMarginTop: 'calc(var(--header-height) + 60px)', marginBottom: '4rem' }}
              >
                {/* Category heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                  <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{cat.icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', margin: 0 }}>
                    {cat.name}
                  </h3>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--color-gold-muted), transparent)' }} />
                </div>

                {/* Items */}
                <div className={isWine ? 'grid-vins' : 'grid-pizzas'}>
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{ padding: 0, overflow: 'hidden' }}
                    >
                      {item.image_url && !isWine && cat.slug !== 'boisson' && (
                        <div style={{ height: '190px', overflow: 'hidden' }}>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          />
                        </div>
                      )}
                      {!item.image_url && !isWine && cat.slug !== 'boisson' && (
                        <div style={{ height: '190px', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                          {cat.icon}
                        </div>
                      )}
                      <div style={{ padding: isWine ? '0.9rem 1.25rem' : '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: item.description ? '0.4rem' : 0 }}>
                          <h4 style={{ fontSize: isWine ? '0.9rem' : '1.1rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
                            {item.name}
                          </h4>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: isWine ? '1rem' : '1.15rem', color: 'var(--color-gold)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.description && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </section>
  );
}

// About Preview Section
function AboutPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
          className="about-grid"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="section-subtitle" style={{ textAlign: 'left' }}>
              Notre Histoire
            </p>
            <h2 style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Une passion née à Naples
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Née de la passion d&apos;Enzo pour les traditions culinaires napolitaines,
              Da Enzo est bien plus qu&apos;une pizzeria. C&apos;est un voyage gustatif au
              cœur de l&apos;Italie, où chaque pizza est pétrie à la main avec des farines
              sélectionnées.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Notre four à bois, atteignant 450°C, confère à nos pizzas cette croûte
              croustillante et cette mie aérée qui font notre réputation depuis plus de
              10 ans à Charenton-le-Pont.
            </p>

            {/* Values */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {['Authenticité', 'Qualité', 'Passion', 'Convivialité'].map((val) => (
                <span key={val} className="badge badge-gold">
                  {val}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// Reviews Section
const REVIEWS = [
  { name: 'Ari Gozlan', text: 'Meilleur pizza de Charenton, c\'est extraordinaire !' },
  { name: 'Cyril E.', text: 'Les 4 fromages et le tiramisu étaient parfaits. Une adresse qu\'on a plaisir à retrouver.' },
  { name: 'Christoo Hunders', text: 'Goûté une Régina et une végétarienne qui était exquise. Je recommande vraiment.' },
  { name: 'Ludovic Thomas', text: 'Belle découverte ! La pâte est légère, les ingrédients frais, le cadre agréable.' },
  { name: 'Donovane Amelin', text: 'Super accueil, service très rapide et pizza délicieuse. On reviendra !' },
  { name: 'Marya Loam', text: 'Merci à Sam, c\'était super bon comme toujours. La meilleure pizzeria du quartier.' },
  { name: 'Ouadhen Safa', text: 'Super accueil, le repas était excellent ! Une vraie adresse de qualité.' },
  { name: 'Cristiano Fernandes', text: 'Patron très sympathique, bonne musique, pizza et dessert au top. Une excellente soirée.' },
  { name: 'Lucas Fernandes', text: 'Pizzas excellentes et personnel gentil. Je recommande chaudement.' },
  { name: 'Caroline Gallais', text: 'Personnel gentil et accueillant, plats délicieux. Une belle découverte à Charenton.' },
  { name: 'Anthony Poivet', text: 'Super bien, super génial, très satisfait ! On y retourne très bientôt.' },
  { name: 'Yacoub Jack', text: 'Très bien, je recommande. Qualité irréprochable et service au top.' },
];

function ReviewsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: ANIMATION_DURATION }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <p className="section-subtitle">Ils nous font confiance</p>
          <h2 className="section-title gold-underline" style={{ display: 'inline-block' }}>
            Avis Clients
          </h2>
          {/* Rating summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '1.3rem', letterSpacing: '2px' }}>★★★★★</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-gold)' }}>4,8</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>· 131 avis Google</span>
          </div>
        </motion.div>

        {/* Reviews grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.5) }}
              className="card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Stars */}
              <span style={{ color: 'var(--color-gold)', fontSize: '0.9rem', letterSpacing: '2px' }}>
                ★★★★★
              </span>

              {/* Quote */}
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  flex: 1,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Reviewer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold-muted))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    flexShrink: 0,
                  }}
                >
                  {review.name.charAt(0)}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {review.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Section — Animated counters
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { value: 10, suffix: '+', label: 'Années d\'expérience' },
    { value: 150, suffix: '+', label: 'Pizzas par jour' },
    { value: 15000, suffix: '+', label: 'Clients satisfaits' },
    { value: 100, suffix: '%', label: 'Ingrédients italiens' },
  ];

  return (
    <section ref={ref} className="section">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center',
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: ANIMATION_DURATION, delay: i * 0.1 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 300,
                color: 'var(--color-gold)',
                textShadow: 'var(--shadow-gold)',
                display: 'block',
              }}
            >
              <CountUp target={stat.value} isInView={isInView} />
              {stat.suffix}
            </motion.span>
            <p
              style={{
                fontFamily: 'var(--font-accent)',
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)',
                marginTop: '0.5rem',
              }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Counter animation
function CountUp({ target, isInView }: { target: number; isInView: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  if (isInView && !hasAnimated.current && typeof window !== 'undefined') {
    hasAnimated.current = true;
    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (ref.current) {
        ref.current.textContent = current.toLocaleString('fr-FR');
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  return <span ref={ref}>0</span>;
}

// CTA Section
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="section" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="section-subtitle">Réservation</p>
          <h2
            className="section-title"
            style={{ marginBottom: '1.5rem' }}
          >
            Votre table vous attend
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '500px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Réservez en quelques clics et laissez-nous vous offrir une expérience
            gastronomique inoubliable.
          </p>
          <Link href="/reservation" className="btn btn-primary btn-lg">
            Réserver maintenant
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Main Page Component
// ============================================================
export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Art Deco Separator */}
      <div className="separator" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <span className="separator-ornament">◆</span>
      </div>

      <FullMenuSection />

      <AboutPreview />

      <ReviewsSection />

      <StatsSection />

      {/* Art Deco Separator */}
      <div className="separator" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <span className="separator-ornament">◆</span>
      </div>

      <CTASection />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: 'Da Enzo Pizza',
            description: 'Pizzeria artisanale italienne à Charenton-le-Pont. Pizzas cuites au feu de bois.',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '12 Rue de Paris',
              addressLocality: 'Charenton-le-Pont',
              postalCode: '94220',
              addressCountry: 'FR',
            },
            telephone: '+33143680000',
            servesCuisine: 'Italian',
            priceRange: '€€',
            openingHoursSpecification: [
              { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '11:30', closes: '22:30' },
              { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '11:30', closes: '22:30' },
              { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '11:30', closes: '22:30' },
              { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '11:30', closes: '23:00' },
              { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '11:30', closes: '23:00' },
              { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '11:30', closes: '22:00' },
            ],
          }),
        }}
      />
    </>
  );
}
