'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPizzas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      // Total active pizzas
      const { count: pizzasCount } = await supabase
        .from('pizzas')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);

      setStats({ totalUsers: usersCount || 0, totalPizzas: pizzasCount || 0 });
      setLoading(false);
    }
    fetchData();
  }, []);

  const statCards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: 'var(--color-gold-light)' },
    { label: 'Pizzas actives', value: stats.totalPizzas, icon: '🍕', color: 'var(--color-success)' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          Vue d&apos;ensemble de votre activité.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="card"
            style={{ padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="text-accent" style={{ fontSize: '0.75rem' }}>{stat.label}</span>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 300,
                color: stat.color,
                display: 'block',
              }}
            >
              {loading ? '—' : stat.value}
            </span>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
