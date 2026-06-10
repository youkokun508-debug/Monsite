'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import { getLoyaltyTier } from '@/lib/utils';
import { LOYALTY_TIERS } from '@/lib/constants';
import type { Profile, LoyaltyEvent } from '@/lib/types';

export default function AdminFidelitePage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userEvents, setUserEvents] = useState<LoyaltyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Form state
  const [pointsAmount, setPointsAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isAdding, setIsAdding] = useState(true); // true = add, false = remove
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(users);
    } else {
      const q = search.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.full_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  async function fetchUsers() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('full_name', { ascending: true });
    if (data) {
      setUsers(data as Profile[]);
      setFilteredUsers(data as Profile[]);
    }
    setLoading(false);
  }

  const openUserModal = useCallback(async (user: Profile) => {
    setSelectedUser(user);
    setUserEvents([]);
    setEventsLoading(true);
    setPointsAmount('');
    setReason('');
    setIsAdding(true);
    setSuccessMessage('');
    setErrorMessage('');

    const supabase = createClient();
    const { data } = await supabase
      .from('loyalty_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setUserEvents(data as LoyaltyEvent[]);
    setEventsLoading(false);
  }, []);

  async function handleSubmitPoints(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Veuillez entrer un nombre de points valide.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Veuillez indiquer une raison.');
      return;
    }

    const actualPoints = isAdding ? amount : -amount;

    // Check if removing more points than the user has
    if (!isAdding && amount > selectedUser.points) {
      setErrorMessage(`Ce client n'a que ${selectedUser.points} points. Impossible d'en retirer ${amount}.`);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const supabase = createClient();

    // 1. Insert the loyalty event
    const { error: eventError } = await supabase
      .from('loyalty_events')
      .insert({
        user_id: selectedUser.id,
        points: actualPoints,
        reason: reason.trim(),
      });

    if (eventError) {
      setErrorMessage(`Erreur: ${eventError.message}`);
      setSubmitting(false);
      return;
    }

    // 2. Update the profile points total
    const newTotal = selectedUser.points + actualPoints;
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ points: newTotal })
      .eq('id', selectedUser.id);

    if (profileError) {
      setErrorMessage(`Points enregistrés mais erreur lors de la mise à jour du profil: ${profileError.message}`);
      setSubmitting(false);
      return;
    }

    // 3. Update local state
    const updatedUser = { ...selectedUser, points: newTotal };
    setSelectedUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    // Refresh events
    const { data: eventsData } = await supabase
      .from('loyalty_events')
      .select('*')
      .eq('user_id', selectedUser.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (eventsData) setUserEvents(eventsData as LoyaltyEvent[]);

    setSuccessMessage(
      isAdding
        ? `+${amount} points ajoutés à ${selectedUser.full_name || selectedUser.email}`
        : `-${amount} points retirés à ${selectedUser.full_name || selectedUser.email}`
    );
    setPointsAmount('');
    setReason('');
    setSubmitting(false);
  }

  // Quick action presets
  const presets = [
    { label: 'Commande restaurant', points: 10, reason: 'Commande au restaurant' },
    { label: 'Commande livraison', points: 5, reason: 'Commande en livraison' },
    { label: 'Anniversaire', points: 50, reason: 'Bonus anniversaire 🎂' },
    { label: 'Parrainage', points: 30, reason: 'Bonus parrainage' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.25rem' }}>
          Programme Fidélité
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          Gérez les points de fidélité de vos clients.
        </p>
      </motion.div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Rechercher un client par nom ou email..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: '4px' }} />
      ) : filteredUsers.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          {search ? 'Aucun client trouvé.' : 'Aucun client inscrit.'}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Points</th>
                <th>Niveau</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const tier = getLoyaltyTier(user.points);
                const tierInfo = LOYALTY_TIERS[tier];
                return (
                  <tr key={user.id}>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: `${tierInfo.color}20`,
                            color: tierInfo.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {user.full_name
                            ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                            : '?'}
                        </div>
                        {user.full_name || 'Sans nom'}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem',
                        color: 'var(--color-gold)',
                      }}>
                        {user.points}
                      </span>
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <button
                        onClick={() => openUserModal(user)}
                        className="btn btn-sm"
                        style={{
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-gold)',
                          border: '1px solid rgba(201, 168, 76, 0.3)',
                          background: 'rgba(201, 168, 76, 0.1)',
                        }}
                      >
                        ⭐ Gérer les points
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
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
                maxWidth: '640px',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '2rem',
              }}
            >
              {/* Modal Header */}
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
                  }}>
                    {selectedUser.full_name || 'Sans nom'}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
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

              {/* Points Summary */}
              {(() => {
                const tier = getLoyaltyTier(selectedUser.points);
                const tierInfo = LOYALTY_TIERS[tier];
                return (
                  <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${tierInfo.color}`,
                  }}>
                    <div>
                      <p className="text-accent" style={{ marginBottom: '0.25rem', fontSize: '0.7rem' }}>SOLDE ACTUEL</p>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2rem',
                        color: 'var(--color-gold)',
                      }}>
                        {selectedUser.points}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>
                        pts
                      </span>
                    </div>
                    <div>
                      <p className="text-accent" style={{ marginBottom: '0.25rem', fontSize: '0.7rem' }}>NIVEAU</p>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2rem',
                        color: tierInfo.color,
                      }}>
                        {tierInfo.name}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Presets */}
              <div style={{ marginBottom: '1rem' }}>
                <p className="text-accent" style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                  ACTIONS RAPIDES
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setPointsAmount(String(preset.points));
                        setReason(preset.reason);
                        setIsAdding(true);
                        setSuccessMessage('');
                        setErrorMessage('');
                      }}
                      className="btn btn-sm"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                      }}
                    >
                      +{preset.points} {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add/Remove Form */}
              <form onSubmit={handleSubmitPoints} style={{ marginBottom: '1.5rem' }}>
                {/* Toggle add/remove */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}>
                  <button
                    type="button"
                    onClick={() => { setIsAdding(true); setErrorMessage(''); }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backgroundColor: isAdding ? 'rgba(76, 175, 80, 0.15)' : 'var(--color-surface-elevated)',
                      color: isAdding ? 'var(--color-success)' : 'var(--color-text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ＋ Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setErrorMessage(''); }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backgroundColor: !isAdding ? 'rgba(229, 57, 53, 0.15)' : 'var(--color-surface-elevated)',
                      color: !isAdding ? 'var(--color-error)' : 'var(--color-text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    − Retirer
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <label className="input-label" htmlFor="points-amount">Points</label>
                    <input
                      id="points-amount"
                      type="number"
                      min="1"
                      required
                      className="input-field"
                      placeholder="10"
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="input-label" htmlFor="points-reason">Raison</label>
                    <input
                      id="points-reason"
                      type="text"
                      required
                      className="input-field"
                      placeholder="Ex: Commande du 10/06"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>

                {/* Messages */}
                {errorMessage && (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: 'rgba(229, 57, 53, 0.1)',
                    border: '1px solid rgba(229, 57, 53, 0.3)',
                    borderRadius: '2px',
                    color: 'var(--color-error)',
                    fontSize: '0.8rem',
                  }}>
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '2px',
                    color: 'var(--color-success)',
                    fontSize: '0.8rem',
                  }}>
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting
                    ? 'Enregistrement...'
                    : isAdding
                      ? `Ajouter ${pointsAmount || '...'} points`
                      : `Retirer ${pointsAmount || '...'} points`
                  }
                </button>
              </form>

              {/* Events History */}
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '0.75rem',
                }}>
                  Historique des points
                </h3>

                {eventsLoading ? (
                  <div className="skeleton" style={{ height: '100px', borderRadius: '4px' }} />
                ) : userEvents.length === 0 ? (
                  <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderRadius: '4px',
                  }}>
                    Aucun historique de points.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {userEvents.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem 0.75rem',
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderRadius: '4px',
                          borderLeft: `2px solid ${event.points > 0 ? 'var(--color-success)' : 'var(--color-error)'}`,
                        }}
                      >
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: 'var(--color-text-primary)',
                          }}>
                            {event.reason}
                          </p>
                          <p style={{
                            margin: '0.1rem 0 0',
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                          }}>
                            {formatShortDate(event.created_at)}
                          </p>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          color: event.points > 0 ? 'var(--color-success)' : 'var(--color-error)',
                          flexShrink: 0,
                          marginLeft: '1rem',
                        }}>
                          {event.points > 0 ? '+' : ''}{event.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
