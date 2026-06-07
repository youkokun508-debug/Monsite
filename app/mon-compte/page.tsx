'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getGreeting, getLoyaltyTier, getLoyaltyProgress, formatShortDate } from '@/lib/utils';
import { LOYALTY_TIERS, RESERVATION_STATUSES } from '@/lib/constants';
import type { Profile, Reservation } from '@/lib/types';

export default function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData as Profile);

      // Recent reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (reservations) setRecentReservations(reservations as Reservation[]);

      // Unread notifications
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .or(`user_id.eq.${user.id},user_id.is.null`);
      setUnreadNotifs(count || 0);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const tier = getLoyaltyTier(profile.points);
  const tierInfo = LOYALTY_TIERS[tier];
  const progress = getLoyaltyProgress(profile.points);

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          {getGreeting()}, {profile.full_name || 'Bienvenue'} 👋
        </h1>
        <p style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>
          Voici un aperçu de votre espace personnel.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Loyalty Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
          style={{ padding: '1.5rem' }}
        >
          <p className="text-accent" style={{ marginBottom: '0.5rem' }}>Points fidélité</p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--color-gold)',
              fontWeight: 500,
              margin: '0 0 0.75rem',
            }}
          >
            {profile.points}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <span
              className="badge"
              style={{
                backgroundColor: `${tierInfo.color}20`,
                color: tierInfo.color,
                border: `1px solid ${tierInfo.color}50`,
              }}
            >
              {tierInfo.name}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${tierInfo.color}, var(--color-gold-light))`,
                borderRadius: '4px',
              }}
            />
          </div>
        </motion.div>

        {/* Reservations count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
          style={{ padding: '1.5rem' }}
        >
          <p className="text-accent" style={{ marginBottom: '0.5rem' }}>Réservations</p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--color-gold)',
              fontWeight: 500,
              margin: '0 0 0.75rem',
            }}
          >
            {recentReservations.length}
          </p>
          <Link href="/mon-compte/reservations" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
            Voir tout →
          </Link>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
          style={{ padding: '1.5rem' }}
        >
          <p className="text-accent" style={{ marginBottom: '0.5rem' }}>Notifications</p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: unreadNotifs > 0 ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: 500,
              margin: '0 0 0.75rem',
            }}
          >
            {unreadNotifs} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>non lues</span>
          </p>
          <Link href="/mon-compte/notifications" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
            Voir tout →
          </Link>
        </motion.div>
      </div>

      {/* Recent Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          Dernières réservations
        </h3>

        {recentReservations.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <p style={{ margin: '0 0 1rem' }}>Aucune réservation pour le moment.</p>
            <Link href="/reservation" className="btn btn-primary btn-sm">
              Réserver une table
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentReservations.map((res) => {
              const status = RESERVATION_STATUSES[res.status];
              return (
                <div
                  key={res.id}
                  className="card"
                  style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {formatShortDate(res.date)} à {res.time}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                      {res.guests} {res.guests === 1 ? 'personne' : 'personnes'}
                    </p>
                  </div>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${status.color}20`,
                      color: status.color,
                      border: `1px solid ${status.color}50`,
                    }}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
