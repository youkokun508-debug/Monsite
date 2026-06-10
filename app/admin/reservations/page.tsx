'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import { RESERVATION_STATUSES } from '@/lib/constants';
import type { Reservation } from '@/lib/types';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    const supabase = createClient();
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: false });
    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from('reservations').update({ status }).eq('id', id);
    fetchReservations();
  }

  let filtered = reservations;
  if (filter !== 'all') {
    filtered = filtered.filter((r) => r.status === filter);
  }
  if (dateFilter) {
    filtered = filtered.filter((r) => r.date === dateFilter);
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.25rem' }}>
          Gestion des Réservations
        </h1>
        <p style={{ marginBottom: '2rem' }}>{reservations.length} réservations au total</p>
      </motion.div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {f === 'all' ? 'Toutes' : RESERVATION_STATUSES[f as keyof typeof RESERVATION_STATUSES].label}
          </button>
        ))}
        <input
          type="date"
          className="input-field"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            Effacer la date
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '400px', borderRadius: '4px' }} />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Aucune réservation trouvée.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Couverts</th>
                <th>Notes</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => {
                const status = RESERVATION_STATUSES[res.status];
                return (
                  <tr key={res.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatShortDate(res.date)} {res.time}
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {res.name}
                    </td>
                    <td>{res.phone}</td>
                    <td>{res.guests}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                      {res.notes && (
                        <span style={{ fontStyle: 'italic' }}>{res.notes}</span>
                      )}
                      {res.cancellation_reason && (
                        <span style={{
                          display: 'block',
                          marginTop: res.notes ? '0.35rem' : 0,
                          color: 'var(--color-error)',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.4rem',
                          backgroundColor: 'rgba(229, 57, 53, 0.08)',
                          borderRadius: '2px',
                          borderLeft: '2px solid var(--color-error)',
                        }}>
                          Motif : {res.cancellation_reason}
                        </span>
                      )}
                      {!res.notes && !res.cancellation_reason && '—'}
                    </td>
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
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {res.status !== 'confirmed' && (
                          <button
                            onClick={() => updateStatus(res.id, 'confirmed')}
                            className="btn btn-sm"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.7rem',
                              color: 'var(--color-success)',
                              border: '1px solid rgba(76,175,80,0.3)',
                              background: 'rgba(76,175,80,0.1)',
                            }}
                          >
                            Confirmer
                          </button>
                        )}
                        {res.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(res.id, 'cancelled')}
                            className="btn btn-sm"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.7rem',
                              color: 'var(--color-error)',
                              border: '1px solid rgba(229,57,53,0.3)',
                              background: 'rgba(229,57,53,0.1)',
                            }}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
