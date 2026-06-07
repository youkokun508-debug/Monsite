'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    fetchNotifications();
  }

  async function markAllAsRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    fetchNotifications();
  }

  const typeIcons: Record<string, string> = {
    promo: '🎉',
    info: 'ℹ️',
    reservation: '📅',
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>
            Notifications
          </h1>
          <p style={{ margin: 0 }}>
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes les notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            Tout marquer comme lu
          </button>
        )}
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '4px' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Aucune notification pour le moment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                opacity: notif.is_read ? 0.6 : 1,
                borderLeft: notif.is_read
                  ? '2px solid transparent'
                  : '2px solid var(--color-gold)',
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '0.1rem' }}>
                {typeIcons[notif.type] || 'ℹ️'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {formatShortDate(notif.created_at)}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {notif.body}
                </p>
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', marginTop: '0.5rem', padding: '0.25rem 0' }}
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
