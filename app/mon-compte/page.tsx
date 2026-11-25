'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getGreeting } from '@/lib/utils';
import type { Profile } from '@/lib/types';

export default function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
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

    </div>
  );
}
