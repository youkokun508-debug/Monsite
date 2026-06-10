'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Login error:', signInError.message);
      if (signInError.message.includes('Email not confirmed')) {
        setError('Votre email n\'a pas été confirmé. Vérifiez votre boîte de réception.');
      } else if (signInError.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(`Erreur de connexion : ${signInError.message}`);
      }
      setLoading(false);
      return;
    }

    // Get user role to redirect appropriately
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (redirect) {
        router.push(redirect);
      } else if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/mon-compte');
      }
      router.refresh();
    }
  }

  return (
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
          Connexion
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Accédez à votre espace personnel
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

        <div style={{ marginBottom: '2rem' }}>
          <label className="input-label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
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

      {/* Register link */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}
      >
        Pas encore de compte ?{' '}
        <Link
          href="/auth/register"
          style={{ color: 'var(--color-gold)', fontWeight: 500 }}
        >
          Créer un compte
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
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
      <Suspense
        fallback={
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '3rem 2.5rem' }}>
            <div className="skeleton" style={{ height: '40px', width: '60%', margin: '0 auto 2rem' }} />
            <div className="skeleton" style={{ height: '44px', marginBottom: '1.5rem' }} />
            <div className="skeleton" style={{ height: '44px', marginBottom: '2rem' }} />
            <div className="skeleton" style={{ height: '48px' }} />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </section>
  );
}
