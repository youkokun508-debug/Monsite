'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'user',
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Un compte existe déjà avec cette adresse email.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      setLoading(false);
      return;
    }

    router.push('/mon-compte');
    router.refresh();
  }

  return (
    <section
      style={{
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '3rem 2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              marginBottom: '0.5rem',
            }}
          >
            Inscription
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Créez votre compte Da Enzo
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(229, 57, 53, 0.1)',
              border: '1px solid rgba(229, 57, 53, 0.3)',
              borderRadius: '2px',
              color: 'var(--color-error)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" htmlFor="fullName">Nom complet</label>
            <input
              id="fullName"
              type="text"
              required
              className="input-field"
              placeholder="Jean Dupont"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder="votre@email.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="input-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="input-field"
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Separator */}
        <div className="separator" style={{ margin: '2rem 0' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '0.1em',
            }}
          >
            OU
          </span>
        </div>

        {/* Login link */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          Déjà un compte ?{' '}
          <Link
            href="/auth/login"
            style={{ color: 'var(--color-gold)', fontWeight: 500 }}
          >
            Se connecter
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
