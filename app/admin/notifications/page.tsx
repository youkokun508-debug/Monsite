'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import type { Notification, NotificationType } from '@/lib/types';

const TYPE_OPTIONS: { value: NotificationType; label: string; icon: string }[] = [
  { value: 'info', label: 'Information', icon: 'ℹ️' },
  { value: 'promo', label: 'Promotion', icon: '🎉' },
  { value: 'reservation', label: 'Réservation', icon: '📅' },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'info' as NotificationType,
    isGlobal: true,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }

  async function sendNotification(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    setSending(true);
    const supabase = createClient();

    await supabase.from('notifications').insert({
      title: form.title.trim(),
      body: form.body.trim(),
      type: form.type,
      user_id: null, // null = notification globale pour tous les utilisateurs
      is_read: false,
    });

    setForm({ title: '', body: '', type: 'info', isGlobal: true });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSending(false);
    fetchNotifications();
  }

  async function deleteNotification(id: string) {
    if (!confirm('Supprimer cette notification ?')) return;
    const supabase = createClient();
    await supabase.from('notifications').delete().eq('id', id);
    fetchNotifications();
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.25rem' }}>
          Notifications
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          Envoyez des notifications globales à tous vos clients.
        </p>
      </motion.div>

      {/* Send Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
        style={{ padding: '2rem', marginBottom: '2rem' }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📢 Envoyer une notification globale
        </h3>

        {success && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '2px',
              color: 'var(--color-success)',
              fontSize: '0.9rem',
            }}
          >
            ✓ Notification envoyée à tous les utilisateurs.
          </div>
        )}

        <form onSubmit={sendNotification}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="input-label" htmlFor="notif-title">Titre</label>
              <input
                id="notif-title"
                type="text"
                required
                className="input-field"
                placeholder="Ex : Pizza du mois disponible !"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="notif-type">Type</label>
              <select
                id="notif-type"
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" htmlFor="notif-body">Message</label>
            <textarea
              id="notif-body"
              required
              className="input-field"
              rows={3}
              placeholder="Ex : Notre pizza du mois — La Burrata Estivale — est disponible ce week-end. -20% avec le code JUILLET."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              📣 Cette notification sera visible par <strong style={{ color: 'var(--color-gold)' }}>tous les utilisateurs connectés</strong>.
            </p>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? 'Envoi...' : '📢 Envoyer à tous'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Sent Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Historique des notifications
        </h3>

        {loading ? (
          <div className="skeleton" style={{ height: '200px', borderRadius: '4px' }} />
        ) : notifications.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Aucune notification envoyée.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Titre</th>
                  <th>Message</th>
                  <th>Destinataire</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => {
                  const typeOpt = TYPE_OPTIONS.find((t) => t.value === notif.type);
                  return (
                    <tr key={notif.id}>
                      <td>
                        <span className="badge badge-gold">
                          {typeOpt?.icon} {typeOpt?.label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {notif.title}
                      </td>
                      <td style={{ maxWidth: '250px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {notif.body.length > 80 ? notif.body.slice(0, 80) + '…' : notif.body}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: notif.user_id ? 'rgba(201,168,76,0.1)' : 'rgba(76,175,80,0.1)',
                            color: notif.user_id ? 'var(--color-gold)' : 'var(--color-success)',
                            border: notif.user_id ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(76,175,80,0.3)',
                          }}
                        >
                          {notif.user_id ? 'Individuel' : 'Global'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {formatShortDate(notif.created_at)}
                      </td>
                      <td>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.7rem',
                            color: 'var(--color-error)',
                            border: '1px solid rgba(229,57,53,0.3)',
                            background: 'rgba(229,57,53,0.1)',
                          }}
                        >
                          Supprimer
                        </button>
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
