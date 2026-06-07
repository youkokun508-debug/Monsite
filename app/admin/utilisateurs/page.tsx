'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import type { Profile } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });
    if (data) setUsers(data as Profile[]);
    setLoading(false);
  }

  async function toggleDisable(user: Profile) {
    const isDisabled = user.role === 'disabled';
    const action = isDisabled ? 'réactiver' : 'désactiver';
    if (!confirm(`Voulez-vous ${action} le compte de ${user.full_name || user.email} ?`)) return;

    setToggling(user.id);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ role: isDisabled ? 'user' : 'disabled' })
      .eq('id', user.id);

    setToggling(null);
    fetchUsers();
  }

  const disabledCount = users.filter((u) => u.role === 'disabled').length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.25rem' }}>
          Gestion des Utilisateurs
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          {users.length} compte{users.length !== 1 ? 's' : ''} inscrits
          {disabledCount > 0 && (
            <span style={{ color: 'var(--color-error)', marginLeft: '0.5rem' }}>
              ({disabledCount} désactivé{disabledCount !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </motion.div>

      {loading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: '4px' }} />
      ) : users.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Aucun utilisateur inscrit.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Inscription</th>
                <th>Points fidélité</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isDisabled = user.role === 'disabled';
                return (
                  <tr
                    key={user.id}
                    style={{ opacity: isDisabled ? 0.6 : 1 }}
                  >
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isDisabled ? 'rgba(229,57,53,0.1)' : 'rgba(201, 168, 76, 0.15)',
                            color: isDisabled ? 'var(--color-error)' : 'var(--color-gold)',
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
                    <td>{formatShortDate(user.created_at)}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-gold)' }}>
                        {user.points}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: isDisabled ? 'rgba(229,57,53,0.1)' : 'rgba(76,175,80,0.1)',
                          color: isDisabled ? 'var(--color-error)' : 'var(--color-success)',
                          border: isDisabled ? '1px solid rgba(229,57,53,0.3)' : '1px solid rgba(76,175,80,0.3)',
                        }}
                      >
                        {isDisabled ? 'Désactivé' : 'Actif'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleDisable(user)}
                        disabled={toggling === user.id}
                        className="btn btn-sm"
                        style={{
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.75rem',
                          color: isDisabled ? 'var(--color-success)' : 'var(--color-error)',
                          border: isDisabled ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(229,57,53,0.3)',
                          background: isDisabled ? 'rgba(76,175,80,0.1)' : 'rgba(229,57,53,0.1)',
                          opacity: toggling === user.id ? 0.5 : 1,
                        }}
                      >
                        {isDisabled ? 'Réactiver' : 'Désactiver'}
                      </button>
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
