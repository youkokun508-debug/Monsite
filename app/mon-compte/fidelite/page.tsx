'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getLoyaltyTier, getLoyaltyProgress, formatShortDate } from '@/lib/utils';
import { LOYALTY_TIERS } from '@/lib/constants';
import type { Profile, LoyaltyEvent } from '@/lib/types';

export default function FidelitePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData as Profile);

      const { data: eventsData } = await supabase
        .from('loyalty_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (eventsData) setEvents(eventsData as LoyaltyEvent[]);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '200px', borderRadius: '4px', marginBottom: '2rem' }} />
      </div>
    );
  }

  if (!profile) return null;

  const tier = getLoyaltyTier(profile.points);
  const tierInfo = LOYALTY_TIERS[tier];
  const progress = getLoyaltyProgress(profile.points);
  const allTiers = Object.entries(LOYALTY_TIERS);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>
          Programme Fidélité
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          Accumulez des points à chaque visite et débloquez des avantages exclusifs.
        </p>
      </motion.div>

      {/* Current Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          borderLeft: `3px solid ${tierInfo.color}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p className="text-accent" style={{ marginBottom: '0.5rem' }}>Votre niveau</p>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 300,
                color: tierInfo.color,
              }}
            >
              {tierInfo.name}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-accent" style={{ marginBottom: '0.5rem' }}>Points</p>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 300,
                color: 'var(--color-gold)',
              }}
            >
              {profile.points}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {tier !== 'or' && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem',
            }}>
              <span>{tierInfo.name}</span>
              <span>{allTiers[allTiers.findIndex(([k]) => k === tier) + 1]?.[1].name}</span>
            </div>
            <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${tierInfo.color}, var(--color-gold-light))`,
                  borderRadius: '4px',
                }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Encore {tierInfo.maxPoints - profile.points + 1} points avant le niveau suivant
            </p>
          </>
        )}
      </motion.div>

      {/* All Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Les paliers
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {allTiers.map(([key, info]) => (
            <div
              key={key}
              className="card"
              style={{
                padding: '1.5rem',
                borderTop: `3px solid ${info.color}`,
                opacity: key === tier ? 1 : 0.7,
              }}
            >
              <h4 style={{ color: info.color, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                {info.name}
                {key === tier && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>← Vous</span>}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem' }}>
                {info.minPoints} — {info.maxPoints === Infinity ? '∞' : info.maxPoints} points
              </p>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {info.benefits.map((b) => (
                  <li key={b} style={{ marginBottom: '0.25rem' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Historique des points
        </h3>

        {events.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Aucun événement de fidélité pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.map((event) => (
              <div
                key={event.id}
                className="card"
                style={{
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    {event.reason}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {formatShortDate(event.created_at)}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: event.points > 0 ? 'var(--color-success)' : 'var(--color-error)',
                  }}
                >
                  {event.points > 0 ? '+' : ''}{event.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
