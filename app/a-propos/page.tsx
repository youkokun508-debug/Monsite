'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const CONTENT_KEYS = ['about_title', 'about_text', 'about_values'];

const DEFAULT_CONTENT = {
  about_title: 'Notre Histoire',
  about_text:
    'Née de la passion d\'Enzo pour les traditions culinaires napolitaines, Da Enzo est bien plus qu\'une pizzeria. C\'est un voyage gustatif au cœur de l\'Italie, où chaque pizza est pétrie à la main avec des farines sélectionnées et garnie d\'ingrédients d\'exception importés directement de producteurs italiens. Notre four à bois, atteignant 450°C, confère à nos pizzas cette croûte croustillante et cette mie aérée qui font notre réputation depuis plus de 10 ans à Charenton-le-Pont.',
  about_values: 'Authenticité • Qualité • Passion • Convivialité',
};

const VALUES_ICONS: Record<string, string> = {
  Authenticité: '🌿',
  Qualité: '⭐',
  Passion: '🔥',
  Convivialité: '🤝',
};

const STATS = [
  { number: '2015', label: 'Année de création' },
  { number: '450°C', label: 'Température du four' },
  { number: '48h', label: 'Fermentation de la pâte' },
  { number: '100%', label: 'Fait maison' },
];

export default function AProposPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const isInView1 = useInView(ref1, { once: true, margin: '-100px' });
  const isInView2 = useInView(ref2, { once: true, margin: '-100px' });

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

  const values = content.about_values
    .split(/[•,]/)
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: 'clamp(3rem, 8vw, 6rem) 1.5rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-subtitle"
        >
          Qui Sommes-Nous
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="gold-underline"
          style={{ display: 'inline-block' }}
        >
          {content.about_title}
        </motion.h1>
      </section>

      {/* Story Section */}
      <section ref={ref1} className="section" style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {content.about_text.split('. ').reduce<string[][]>((acc, sentence, i) => {
              const paraIndex = Math.floor(i / 2);
              if (!acc[paraIndex]) acc[paraIndex] = [];
              acc[paraIndex].push(sentence);
              return acc;
            }, []).map((sentences, i) => (
              <p
                key={i}
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  lineHeight: 1.9,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '2rem',
                }}
              >
                {sentences.join('. ')}{sentences[sentences.length - 1].endsWith('.') ? '' : '.'}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={ref2}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="section-subtitle">Ce Qui Nous Anime</p>
            <h2 className="section-title" style={{ marginBottom: '3rem' }}>
              Nos Valeurs
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
            }}
          >
            {values.map((value, i) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="card"
                style={{ textAlign: 'center', padding: '2.5rem 2rem' }}
              >
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>
                  {VALUES_ICONS[value] || '✨'}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    marginBottom: '0.75rem',
                    color: 'var(--color-gold)',
                  }}
                >
                  {value}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 300,
                  color: 'var(--color-gold)',
                  display: 'block',
                  textShadow: 'var(--shadow-gold)',
                }}
              >
                {stat.number}
              </span>
              <span className="text-accent" style={{ fontSize: '0.75rem' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
