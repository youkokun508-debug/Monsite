'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import { RESERVATION_STATUSES } from '@/lib/constants';
import type { Reservation } from '@/lib/types';

export default function UserReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

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

  function openCancelModal(reservation: Reservation) {
    setCancelTarget(reservation);
    setCancelReason('');
    setCancelError('');
    setCancelling(false);
  }

  async function handleCancelSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelTarget) return;

    if (!cancelReason.trim()) {
      setCancelError('Veuillez indiquer le motif de votre annulation.');
      return;
    }

    setCancelling(true);
    setCancelError('');

    const supabase = createClient();
    const { error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancellation_reason: cancelReason.trim(),
      })
      .eq('id', cancelTarget.id);

    if (error) {
      setCancelError(`Erreur : ${error.message}`);
      setCancelling(false);
      return;
    }

    setCancelTarget(null);
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
            const canCancel = res.status === 'pending' || res.status === 'confirmed';
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
                  {res.status === 'cancelled' && res.cancellation_reason && (
                    <p style={{
                      margin: '0.5rem 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--color-error)',
                      padding: '0.4rem 0.6rem',
                      backgroundColor: 'rgba(229, 57, 53, 0.08)',
                      borderRadius: '4px',
                      borderLeft: '2px solid var(--color-error)',
                    }}>
                      <strong>Motif :</strong> {res.cancellation_reason}
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
                  {canCancel && (
                    <button
                      onClick={() => openCancelModal(res)}
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

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCancelTarget(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '2rem',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.3rem',
                    marginBottom: '0.25rem',
                    color: 'var(--color-error)',
                  }}>
                    Annuler la réservation
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {formatShortDate(cancelTarget.date)} à {cancelTarget.time} • {cancelTarget.guests} {cancelTarget.guests === 1 ? 'couvert' : 'couverts'}
                  </p>
                </div>
                <button
                  onClick={() => setCancelTarget(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    lineHeight: 1,
                    padding: '0.25rem',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Info box */}
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                backgroundColor: 'rgba(201, 168, 76, 0.08)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
              }}>
                ℹ️ Veuillez indiquer le motif de votre annulation. Cette information sera transmise au restaurant.
              </div>

              {/* Form */}
              <form onSubmit={handleCancelSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label" htmlFor="cancel-reason">
                    Motif d&apos;annulation *
                  </label>
                  <textarea
                    id="cancel-reason"
                    required
                    className="input-field"
                    placeholder="Ex : Imprévu personnel, changement de programme..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    style={{
                      resize: 'vertical',
                      minHeight: '80px',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>

                {/* Error */}
                {cancelError && (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: 'rgba(229, 57, 53, 0.1)',
                    border: '1px solid rgba(229, 57, 53, 0.3)',
                    borderRadius: '2px',
                    color: 'var(--color-error)',
                    fontSize: '0.8rem',
                  }}>
                    {cancelError}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCancelTarget(null)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={cancelling}
                    className="btn"
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(229, 57, 53, 0.15)',
                      color: 'var(--color-error)',
                      border: '1px solid rgba(229, 57, 53, 0.3)',
                      opacity: cancelling ? 0.6 : 1,
                    }}
                  >
                    {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
