'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AVAILABLE_TIMES, MAX_GUESTS } from '@/lib/constants';
import { getMinReservationDate, getMaxReservationDate } from '@/lib/utils';

export default function ReservationPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/auth/login?redirect=/reservation');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || '',
      });

      setForm((prev) => ({
        ...prev,
        name: profile?.full_name || '',
      }));

      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');

    const supabase = createClient();

    const { error: insertError } = await supabase.from('reservations').insert({
      user_id: user.id,
      date: form.date,
      time: form.time,
      guests: form.guests,
      name: form.name,
      phone: form.phone,
      notes: form.notes || null,
      status: 'pending',
    });

    if (insertError) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="section" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '30px', margin: '0 auto 1rem' }} />
        <div className="skeleton" style={{ width: '300px', height: '20px', margin: '0 auto' }} />
      </div>
    );
  }

  if (success) {
    return (
      <section className="section" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>✅</span>
          <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Réservation confirmée !</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Votre demande de réservation a été envoyée avec succès. Vous recevrez une
            confirmation par notre équipe sous peu.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/mon-compte/reservations')}
              className="btn btn-primary"
            >
              Voir mes réservations
            </button>
            <button onClick={() => router.push('/')} className="btn btn-secondary">
              Retour à l&apos;accueil
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: 'clamp(3rem, 8vw, 5rem) 1.5rem clamp(1rem, 3vw, 2rem)' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-subtitle"
        >
          Votre Table Vous Attend
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="gold-underline"
          style={{ display: 'inline-block' }}
        >
          Réservation
        </motion.h1>
      </section>

      {/* Form */}
      <div className="section" style={{ paddingTop: 0 }}>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card"
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2.5rem',
          }}
        >
          {error && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                backgroundColor: 'rgba(229, 57, 53, 0.1)',
                border: '1px solid rgba(229, 57, 53, 0.3)',
                borderRadius: '2px',
                color: 'var(--color-error)',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Date */}
            <div>
              <label className="input-label" htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                required
                className="input-field"
                min={getMinReservationDate()}
                max={getMaxReservationDate()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Time */}
            <div>
              <label className="input-label" htmlFor="time">Heure</label>
              <select
                id="time"
                required
                className="input-field"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {AVAILABLE_TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Guests */}
          <div style={{ marginTop: '1.5rem' }}>
            <label className="input-label" htmlFor="guests">Nombre de couverts</label>
            <select
              id="guests"
              required
              className="input-field"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) })}
            >
              {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'personne' : 'personnes'}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div style={{ marginTop: '1.5rem' }}>
            <label className="input-label" htmlFor="name">Nom</label>
            <input
              id="name"
              type="text"
              required
              className="input-field"
              placeholder="Votre nom complet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div style={{ marginTop: '1.5rem' }}>
            <label className="input-label" htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              type="tel"
              required
              className="input-field"
              placeholder="06 XX XX XX XX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div style={{ marginTop: '1.5rem' }}>
            <label className="input-label" htmlFor="notes">Notes (optionnel)</label>
            <textarea
              id="notes"
              className="input-field"
              placeholder="Allergies, occasion spéciale, demandes particulières..."
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: '2rem' }}
          >
            {submitting ? 'Envoi en cours...' : 'Confirmer la réservation'}
          </button>
        </motion.form>
      </div>
    </>
  );
}
