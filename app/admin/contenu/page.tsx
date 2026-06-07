'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { SITE_CONTENT_KEYS } from '@/lib/constants';
import type { SiteContent } from '@/lib/types';

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const supabase = createClient();
    const { data } = await supabase.from('site_content').select('*');
    if (data) {
      const map: Record<string, string> = {};
      (data as SiteContent[]).forEach((item) => {
        map[item.key] = item.value;
      });
      setContent(map);
    }
    setLoading(false);
  }

  async function saveField(key: string) {
    setSaving(key);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('site_content')
      .upsert({
        key,
        value: content[key] || '',
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      });

    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  async function saveSection(keys: string[]) {
    for (const key of keys) {
      await saveField(key);
    }
  }

  const sections = [
    {
      title: 'Informations de contact',
      icon: '📞',
      keys: ['phone', 'address', 'email'],
    },
    {
      title: 'Horaires d\'ouverture',
      icon: '🕐',
      keys: ['hours_mon', 'hours_tue', 'hours_wed', 'hours_thu', 'hours_fri', 'hours_sat', 'hours_sun'],
    },
    {
      title: 'Page d\'accueil',
      icon: '🏠',
      keys: ['hero_title', 'hero_subtitle', 'hero_cta'],
    },
    {
      title: 'À propos',
      icon: '📖',
      keys: ['about_title', 'about_text', 'about_values'],
    },
    {
      title: 'Réseaux sociaux',
      icon: '📱',
      keys: ['instagram_url', 'facebook_url'],
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '2rem' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '4px', marginBottom: '1.5rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.25rem' }}>
          Contenu Éditorial
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          Modifiez le contenu de votre site sans aucune connaissance technique.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sections.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: sectionIdx * 0.1 }}
            className="card"
            style={{ padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{section.icon}</span> {section.title}
              </h3>
              <button
                onClick={() => saveSection(section.keys)}
                className="btn btn-primary btn-sm"
              >
                Enregistrer
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {section.keys.map((key) => {
                const label = SITE_CONTENT_KEYS[key as keyof typeof SITE_CONTENT_KEYS] || key;
                const isLongText = key === 'about_text';

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="input-label" htmlFor={`content-${key}`} style={{ margin: 0 }}>
                        {label}
                      </label>
                      {saved === key && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
                          ✓ Enregistré
                        </span>
                      )}
                    </div>
                    {isLongText ? (
                      <textarea
                        id={`content-${key}`}
                        className="input-field"
                        rows={5}
                        value={content[key] || ''}
                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      />
                    ) : (
                      <input
                        id={`content-${key}`}
                        type="text"
                        className="input-field"
                        value={content[key] || ''}
                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
