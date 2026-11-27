'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Spin {
  id: string;
  code: string;
  prize_key: string;
  prize_label: string;
  created_at: string;
  expires_at: string;
  redeemed_at: string | null;
}

interface WheelConfig {
  access_key: string;
  active: boolean;
  validity_days: number;
  google_review_url: string | null;
  prizes: { key: string; label: string; short: string; weight: number }[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function status(s: Spin): { label: string; cls: string } {
  if (s.redeemed_at) return { label: `Utilisé le ${fmt(s.redeemed_at)}`, cls: 'badge' };
  if (new Date(s.expires_at) < new Date()) return { label: 'Expiré', cls: 'badge badge-error' };
  return { label: 'Valide', cls: 'badge badge-success' };
}

export default function AdminRouePage() {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const [{ data: cfg }, { data: rows }] = await Promise.all([
      supabase.from('wheel_config').select('access_key, active, validity_days, google_review_url, prizes').eq('id', 1).single(),
      supabase.from('wheel_spins').select('id, code, prize_key, prize_label, created_at, expires_at, redeemed_at').order('created_at', { ascending: false }).limit(500),
    ]);
    if (cfg) setConfig(cfg as WheelConfig);
    if (rows) setSpins(rows as Spin[]);
    setLoading(false);
  }

  async function redeem(spin: Spin) {
    if (!confirm(`Valider le code ${spin.code} (${spin.prize_label}) ?\nIl ne pourra plus être utilisé.`)) return;
    setBusy(spin.id);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('wheel_spins')
      .update({ redeemed_at: new Date().toISOString(), redeemed_by: auth.user?.id ?? null })
      .eq('id', spin.id)
      .is('redeemed_at', null);
    setBusy(null);
    if (error) alert("Impossible de valider ce code. Réessayez.");
    load();
  }

  async function toggleActive() {
    if (!config) return;
    const supabase = createClient();
    await supabase.from('wheel_config').update({ active: !config.active, updated_at: new Date().toISOString() }).eq('id', 1);
    load();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase().replace(/^DE-?/, '');
    if (!q) return spins;
    return spins.filter((s) => s.code.replace('DE-', '').includes(q));
  }, [spins, search]);

  const stats = useMemo(() => {
    const used = spins.filter((s) => s.redeemed_at).length;
    const byPrize: Record<string, { label: string; total: number; used: number }> = {};
    for (const s of spins) {
      byPrize[s.prize_key] ??= { label: s.prize_label, total: 0, used: 0 };
      byPrize[s.prize_key].total++;
      if (s.redeemed_at) byPrize[s.prize_key].used++;
    }
    return { total: spins.length, used, byPrize };
  }, [spins]);

  const qrUrl = config && origin ? `${origin}/roue?k=${config.access_key}` : '';

  if (loading) return <p style={{ color: 'var(--color-text-secondary)' }}>Chargement…</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.2rem', marginBottom: '0.25rem' }}>
        Roue de la chance
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Page secrète accessible uniquement via le QR code du flyer. Validez ici les codes présentés en caisse.
      </p>

      {/* Validation rapide */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label className="input-label" htmlFor="code-search">Code présenté par le client</label>
        <input
          id="code-search"
          className="input-field"
          placeholder="ex. DE-7K3P"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: '1.3rem', letterSpacing: '0.12em', textTransform: 'uppercase', maxWidth: 320 }}
          autoComplete="off"
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card"><p className="text-secondary" style={{ fontSize: '0.8rem' }}>Tours joués</p><p style={{ fontSize: '1.8rem', color: 'var(--color-gold)' }}>{stats.total}</p></div>
        <div className="card"><p className="text-secondary" style={{ fontSize: '0.8rem' }}>Codes utilisés</p><p style={{ fontSize: '1.8rem', color: 'var(--color-gold)' }}>{stats.used}</p></div>
        <div className="card">
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Statut du jeu</p>
          <p style={{ fontSize: '1.1rem', margin: '0.3rem 0 0.6rem', color: config?.active ? 'var(--color-success)' : 'var(--color-error)' }}>
            {config?.active ? 'Actif' : 'Désactivé'}
          </p>
          <button className="btn btn-ghost btn-sm" onClick={toggleActive}>{config?.active ? 'Désactiver' : 'Réactiver'}</button>
        </div>
      </div>

      {/* Codes */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Code</th><th>Gain</th><th>Joué le</th><th>Expire le</th><th>Statut</th><th /></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '1.5rem' }}>
                {search ? 'Aucun code ne correspond.' : 'Aucun tour joué pour le moment.'}
              </td></tr>
            )}
            {filtered.slice(0, 100).map((s) => {
              const st = status(s);
              const canRedeem = !s.redeemed_at && new Date(s.expires_at) >= new Date();
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--color-gold)' }}>{s.code}</td>
                  <td>{s.prize_label}</td>
                  <td>{fmt(s.created_at)}</td>
                  <td>{fmt(s.expires_at)}</td>
                  <td><span className={st.cls}>{st.label}</span></td>
                  <td>
                    {canRedeem && (
                      <button className="btn btn-primary btn-sm" disabled={busy === s.id} onClick={() => redeem(s)}>
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lots */}
      {config && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '1rem' }}>Lots et chances</h2>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead><tr><th>Lot</th><th>Chance</th><th>Gagnés</th><th>Utilisés</th></tr></thead>
            <tbody>
              {config.prizes.map((p) => (
                <tr key={p.key}>
                  <td>{p.label}</td>
                  <td>{Number(p.weight).toLocaleString('fr-FR')} %</td>
                  <td>{stats.byPrize[p.key]?.total ?? 0}</td>
                  <td>{stats.byPrize[p.key]?.used ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lien du QR */}
      {qrUrl && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Lien du QR code</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            À ne pas diffuser en dehors du flyer. Code valable {config?.validity_days} jours après le tour.
          </p>
          <code style={{ wordBreak: 'break-all', color: 'var(--color-gold-light)' }}>{qrUrl}</code>
        </div>
      )}
    </div>
  );
}
