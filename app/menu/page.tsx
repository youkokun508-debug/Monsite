'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { PIZZA_CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { Pizza } from '@/lib/types';

type Category = typeof PIZZA_CATEGORIES[number];

function CategorySection({ category, items }: { category: Category; items: Pizza[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isTextOnly = category.slug === 'vin' || category.slug === 'cafe' || category.slug === 'bambino';

  return (
    <section
      id={`cat-${category.slug}`}
      ref={ref}
      style={{ scrollMarginTop: 'calc(var(--header-height) + 60px)', marginBottom: '4rem' }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
      >
        <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{category.icon}</span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', margin: 0 }}>
          {category.name}
        </h2>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--color-gold-muted), transparent)' }} />
      </motion.div>

      {/* Items */}
      <div className={isTextOnly ? 'grid-vins' : 'grid-pizzas'}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Image — only for food items that have one */}
            {item.image_url && !isTextOnly && (
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            )}
            {!item.image_url && !isTextOnly && (
              <div
                style={{
                  height: '200px',
                  background: 'var(--color-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                }}
              >
                {category.icon}
              </div>
            )}

            {/* Content */}
            <div style={{ padding: isTextOnly ? '1rem 1.25rem' : '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: item.description ? '0.5rem' : 0,
                }}
              >
                <h3
                  style={{
                    fontSize: isTextOnly ? '0.95rem' : '1.15rem',
                    fontFamily: 'var(--font-heading)',
                    margin: 0,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {item.name}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: isTextOnly ? '1.05rem' : '1.2rem',
                    color: 'var(--color-gold)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {formatPrice(item.price)}
                </span>
              </div>
              {item.description && (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState('');
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchItems() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .eq('is_available', true)
        .order('position', { ascending: true });
      if (error) console.error('[Menu] Supabase error:', error.message, error.details);
      if (data) setItems(data as Pizza[]);
      setLoading(false);
    }
    fetchItems();
  }, []);

  // Scroll spy — highlight active category in nav
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id.replace('cat-', ''));
          }
        });
      },
      { rootMargin: '-30% 0px -65% 0px' }
    );
    PIZZA_CATEGORIES.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  // Keep active tab visible in nav
  useEffect(() => {
    if (!navRef.current || !activeSlug) return;
    const btn = navRef.current.querySelector(`[data-slug="${activeSlug}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [activeSlug]);

  function scrollToCategory(slug: string) {
    const el = document.getElementById(`cat-${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const grouped = PIZZA_CATEGORIES.reduce<Record<string, Pizza[]>>((acc, cat) => {
    acc[cat.slug] = items.filter((p) => p.category === cat.slug);
    return acc;
  }, {});

  const available = PIZZA_CATEGORIES.filter((cat) => (grouped[cat.slug]?.length ?? 0) > 0);

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
          Nos Créations
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="gold-underline"
          style={{ display: 'inline-block' }}
        >
          La Carte
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ maxWidth: '600px', margin: '1.5rem auto 0', fontSize: '1rem', lineHeight: 1.7 }}
        >
          Des ingrédients d&apos;exception, une pâte pétrie à la main, une cuisson au feu de bois à 450°C.
        </motion.p>
      </section>

      {/* Sticky Category Nav */}
      {!loading && available.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 'var(--header-height)',
            zIndex: 10,
            backgroundColor: 'rgba(10, 10, 8, 0.95)',
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
                onClick={() => scrollToCategory(cat.slug)}
                style={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.8rem',
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

      {/* All Sections */}
      <div className="section" style={{ paddingTop: '3rem' }}>
        {loading ? (
          <div className="grid-pizzas">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card" style={{ padding: '2rem' }}>
                <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '16px', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          available.map((cat) => (
            <CategorySection key={cat.slug} category={cat} items={grouped[cat.slug]} />
          ))
        )}
      </div>
    </>
  );
}
