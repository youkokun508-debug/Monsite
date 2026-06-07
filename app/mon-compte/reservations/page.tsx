'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import { RESERVATION_STATUSES } from '@/lib/constants';
import type { Reservation } from '@/lib/types';

export default function UserReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }

  async function cancelReservation(id: string) {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    const supabase = createClient();
    await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    fetchReservations();
  }

  const filtered =
    filter === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>
          Mes Réservations
        </h1>
        <p style={{ marginBottom: '2rem' }}>Gérez vos réservations chez Da Enzo.</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {f === 'all' ? 'Toutes' : RESERVATION_STATUSES[f as keyof typeof RESERVATION_STATUSES].label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '4px' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Aucune réservation trouvée.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((res, i) => {
            const status = RESERVATION_STATUSES[res.status];
            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '1rem' }}>
                    📅 {formatShortDate(res.date)} à {res.time}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                    {res.guests} {res.guests === 1 ? 'couvert' : 'couverts'} • {res.name}
                  </p>
                  {res.notes && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      &quot;{res.notes}&quot;
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  {res.status === 'pending' && (
                    <button
                      onClick={() => cancelReservation(res.id)}
                      className="btn btn-sm"
                      style={{
                        color: 'var(--color-error)',
                        border: '1px solid rgba(229,57,53,0.3)',
                        background: 'rgba(229,57,53,0.1)',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
