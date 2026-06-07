'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import { RESERVATION_STATUSES } from '@/lib/constants';
import type { Reservation } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPizzas: 0,
    todayReservations: 0,
    pendingReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
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

      // Today's reservations
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Pending reservations
      const { count: pendingCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: usersCount || 0,
        totalPizzas: pizzasCount || 0,
        todayReservations: todayCount || 0,
        pendingReservations: pendingCount || 0,
      });

      // Recent reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (reservations) setRecentReservations(reservations as Reservation[]);

      setLoading(false);
    }
    fetchData();
  }, []);

  const statCards = [
    { label: 'Réservations aujourd\'hui', value: stats.todayReservations, icon: '📅', color: 'var(--color-gold)' },
    { label: 'En attente', value: stats.pendingReservations, icon: '⏳', color: 'var(--color-warning)' },
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

      {/* Recent Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Réservations récentes
        </h3>

        {loading ? (
          <div className="skeleton" style={{ height: '200px', borderRadius: '4px' }} />
        ) : recentReservations.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Aucune réservation.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Nom</th>
                  <th>Couverts</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((res) => {
                  const status = RESERVATION_STATUSES[res.status];
                  return (
                    <tr key={res.id}>
                      <td>
                        {formatShortDate(res.date)} {res.time}
                      </td>
                      <td style={{ color: 'var(--color-text-primary)' }}>{res.name}</td>
                      <td>{res.guests}</td>
                      <td>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
