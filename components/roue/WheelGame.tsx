'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Confetti } from './Confetti';

export interface WheelPrize {
  key: string;
  label: string;
  short: string;
  weight: number;
}

interface SpinResult {
  code: string;
  prize_key: string;
  prize_label: string;
  expires_at: string;
  redeemed: boolean;
  already: boolean;
  is_test?: boolean;
}

interface WheelGameProps {
  accessKey: string;
  prizes: WheelPrize[];
  validityDays: number;
  reviewUrl: string | null;
  isAdmin?: boolean;
}

const DEVICE_KEY = 'daenzo_roue_device';
const RESULT_KEY = 'daenzo_roue_result';
const SIZE = 320;
const C = SIZE / 2;
const R = 148;

const ERRORS: Record<string, string> = {
  too_many: "Trop de participations depuis ce réseau aujourd'hui. Réessayez demain.",
  invalid_key: "Ce jeu n'est plus disponible pour le moment.",
  default: 'Une erreur est survenue. Vérifiez votre connexion et réessayez.',
};

function newDeviceId(): string {
  return (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, '');
}

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id || id.length < 16) {
    id = newDeviceId();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function polar(angleFromTop: number, radius: number) {
  const a = ((angleFromTop - 90) * Math.PI) / 180;
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) };
}

export function WheelGame({ accessKey, prizes, validityDays, reviewUrl, isAdmin = false }: WheelGameProps) {
  const [phase, setPhase] = useState<'ready' | 'spinning' | 'result'>('ready');
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const [copied, setCopied] = useState(false);

  const seg = 360 / prizes.length;
  const total = useMemo(() => prizes.reduce((s, p) => s + Number(p.weight), 0), [prizes]);

  // Déjà joué sur ce téléphone : on réaffiche directement le gain
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RESULT_KEY);
      if (saved) {
        const r = JSON.parse(saved) as SpinResult;
        if (r?.code) {
          setResult({ ...r, already: true });
          setPhase('result');
        }
      }
    } catch {
      /* stockage indisponible : on laisse jouer, la base limite de toute façon */
    }
  }, []);

  function finishSpin() {
    setPhase('result');
    setCelebrate((n) => n + 1);
    try {
      navigator.vibrate?.([60, 40, 120]);
    } catch {
      /* ignore */
    }
    setTimeout(() => document.getElementById('roue-resultat')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  // Mode test admin : on oublie le tour précédent et on repart avec un nouvel identifiant
  function replayAsAdmin() {
    try {
      localStorage.removeItem(RESULT_KEY);
      localStorage.setItem(DEVICE_KEY, newDeviceId());
    } catch {
      /* ignore */
    }
    setResult(null);
    setError(null);
    setCopied(false);
    setPhase('ready');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function spin() {
    if (phase !== 'ready') return;
    setError(null);
    setPhase('spinning');

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc('wheel_spin', {
      p_key: accessKey,
      p_device: getDeviceId(),
    });

    if (rpcError || !data) {
      const msg = rpcError?.message ?? '';
      setError(ERRORS[Object.keys(ERRORS).find((k) => msg.includes(k)) ?? 'default']);
      setPhase('ready');
      return;
    }

    const r = data as SpinResult;
    setResult(r);
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify(r));
    } catch {
      /* ignore */
    }

    if (r.already) {
      setPhase('result');
      return;
    }

    const idx = Math.max(0, prizes.findIndex((p) => p.key === r.prize_key));
    const center = idx * seg + seg / 2;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const base = rotation - (rotation % 360);
    setRotation(base + 360 * 6 + (360 - center) + jitter);
  }

  return (
    <section className="section roue-page" style={{ maxWidth: 560, textAlign: 'center' }}>
      <Confetti fire={celebrate > 0} key={celebrate} />
      <style jsx global>{`
        @keyframes roue-tick {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          50% { transform: translateX(-50%) rotate(-14deg); }
        }
        .roue-pointer.is-spinning { animation: roue-tick 0.12s ease-in-out infinite; transform-origin: 50% 20%; }
        .roue-btn { width: min(100%, 340px); }
        @media (max-width: 640px) {
          .roue-page { padding-top: 1.75rem !important; padding-bottom: 2.5rem !important; }
          .roue-page h1 { margin-bottom: 0.5rem !important; }
          .roue-intro { font-size: 0.95rem; margin-bottom: 1.4rem !important; }
          .roue-btn { padding-top: 1rem !important; padding-bottom: 1rem !important; font-size: 1rem !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .roue-pointer.is-spinning { animation: none; }
        }
      `}</style>
      {isAdmin && (
        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <Link href="/admin/roue" className="btn btn-ghost btn-sm">← Retour à l&apos;admin</Link>
        </div>
      )}
      <p className="section-subtitle">Réservé aux clients du flyer</p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: 'clamp(2.4rem, 9vw, 3.4rem)',
          lineHeight: 1.05,
          marginBottom: '0.75rem',
        }}
      >
        Tentez votre <em style={{ color: 'var(--color-gold-light)' }}>chance</em>
      </h1>
      <div className="separator-ornament" style={{ margin: '0 auto 1.25rem' }} />
      <p className="roue-intro" style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
        Tournez la roue et repartez avec un cadeau à utiliser lors de votre prochain repas chez Da Enzo.
        <br />
        <span style={{ color: 'var(--color-gold)' }}>À tous les coups, on gagne.</span>
      </p>

      {phase !== 'result' && (
        <>
          <div style={{ position: 'relative', width: 'min(86vw, 340px, 52svh)', margin: '0 auto' }}>
            {/* Pointeur */}
            <svg
              viewBox="0 0 40 44"
              aria-hidden
              className={`roue-pointer${phase === 'spinning' ? ' is-spinning' : ''}`}
              style={{ position: 'absolute', top: -14, left: '50%', width: 34, transform: 'translateX(-50%)', zIndex: 2, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.6))' }}
            >
              <path d="M20 42 L4 8 Q20 -2 36 8 Z" fill="var(--color-gold)" stroke="#6B5520" strokeWidth="1.5" />
            </svg>

            <div
              onTransitionEnd={() => phase === 'spinning' && finishSpin()}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: phase === 'spinning' ? 'transform 5.5s cubic-bezier(0.15, 0.7, 0.12, 1)' : 'none',
                borderRadius: '50%',
                boxShadow: '0 0 60px rgba(201,168,76,.18), 0 8px 40px rgba(0,0,0,.6)',
              }}
            >
              <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Roue de la chance" style={{ display: 'block', width: '100%' }}>
                <defs>
                  <linearGradient id="goldSeg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E8CC80" />
                    <stop offset="100%" stopColor="#C9A84C" />
                  </linearGradient>
                </defs>
                <circle cx={C} cy={C} r={R + 8} fill="#0A0A08" stroke="var(--color-gold)" strokeWidth="2" />
                {prizes.map((p, i) => {
                  const a0 = i * seg;
                  const a1 = (i + 1) * seg;
                  const s = polar(a0, R);
                  const e = polar(a1, R);
                  const jackpot = i === prizes.length - 1 || p.key === 'pizza';
                  const fill = jackpot ? 'url(#goldSeg)' : i % 2 === 0 ? '#1A1A18' : '#111110';
                  const lines = p.short.replace(/ %/g, ' %').split(' ');
                  return (
                    <g key={p.key}>
                      <path
                        d={`M ${C} ${C} L ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y} Z`}
                        fill={fill}
                        stroke="rgba(201,168,76,.55)"
                        strokeWidth="1"
                      />
                      <g transform={`rotate(${a0 + seg / 2} ${C} ${C})`}>
                        {lines.map((line, li) => (
                          <text
                            key={li}
                            x={C}
                            y={C - R * 0.68 + li * 17 - ((lines.length - 1) * 17) / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={jackpot ? '#0A0A08' : '#E8CC80'}
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: line.length > 7 ? 13 : 16,
                              fontWeight: jackpot ? 600 : 400,
                            }}
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    </g>
                  );
                })}
                {/* Perles dorées */}
                {prizes.map((_, i) => {
                  const d = polar(i * seg, R + 4);
                  return <circle key={i} cx={d.x} cy={d.y} r={3} fill="var(--color-gold-light)" />;
                })}
                <circle cx={C} cy={C} r={30} fill="#0A0A08" stroke="var(--color-gold)" strokeWidth="2" />
                <text
                  x={C}
                  y={C + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-gold)"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic' }}
                >
                  DE
                </text>
              </svg>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg roue-btn"
            onClick={spin}
            disabled={phase !== 'ready'}
            style={{ marginTop: '1.75rem', opacity: phase === 'ready' ? 1 : 0.6 }}
          >
            {phase === 'spinning' ? 'La roue tourne…' : 'Tourner la roue'}
          </button>
          {error && (
            <p role="alert" style={{ color: 'var(--color-error)', marginTop: '1rem' }}>
              {error}
            </p>
          )}
        </>
      )}

      {phase === 'result' && result && (
        <motion.div id="roue-resultat" initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="card" style={{ borderColor: 'var(--color-border-strong)', padding: '2rem 1.5rem', boxShadow: 'var(--shadow-gold)' }}>
            {result.is_test && (
              <span className="badge badge-warning" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                Tour de test (admin)
              </span>
            )}
            <p className="section-subtitle" style={{ marginBottom: '0.75rem' }}>
              {result.already ? 'Votre gain' : 'Félicitations !'}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 8vw, 2.6rem)', color: 'var(--color-gold-light)', lineHeight: 1.1 }}>
              {result.prize_label}
            </p>
            <div
              style={{
                margin: '1.5rem auto 1rem',
                display: 'inline-block',
                border: '1px dashed var(--color-gold)',
                padding: '0.75rem 1.75rem',
                fontFamily: 'var(--font-body)',
                fontSize: '1.9rem',
                letterSpacing: '0.18em',
                color: 'var(--color-gold)',
                background: 'rgba(201,168,76,.06)',
              }}
            >
              {result.code}
            </div>
            <div>
              <button className="btn btn-ghost btn-sm" onClick={copyCode} style={{ marginBottom: '0.75rem' }}>
                {copied ? '✓ Code copié' : 'Copier le code'}
              </button>
            </div>
            {result.redeemed ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>Ce code a déjà été utilisé. Merci de votre visite !</p>
            ) : (
              <>
                <p style={{ color: 'var(--color-text-primary)' }}>Valable jusqu'au {formatDay(result.expires_at)}</p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                  Montrez ce code au serveur au moment de l'addition.
                  <br />
                  Pensez à faire une capture d'écran.
                </p>
              </>
            )}
          </div>

          {reviewUrl && (
            <div className="card" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                Vous avez aimé votre repas ?
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.1rem', lineHeight: 1.6 }}>
                Votre avis aide beaucoup un restaurant de quartier comme le nôtre.
              </p>
              <a className="btn btn-secondary roue-btn" href={reviewUrl} target="_blank" rel="noopener noreferrer">
                Laisser un avis sur Google
              </a>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.9rem' }}>
                Facultatif : votre avis est libre et n'a aucun lien avec votre gain.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {isAdmin && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem 1.25rem',
            border: '1px dashed var(--color-gold-muted)',
            borderRadius: 4,
            background: 'rgba(201,168,76,.05)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-accent)', letterSpacing: '0.2em', fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase' }}>
            Mode admin · démo
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0.4rem 0 0.9rem', lineHeight: 1.5 }}>
            Vous pouvez rejouer autant de fois que vous voulez. Vos tours sont marqués « test » et ne comptent pas dans les statistiques. Les clients, eux, n&apos;ont qu&apos;un seul tour.
          </p>
          <button className="btn btn-secondary roue-btn" onClick={replayAsAdmin} disabled={phase === 'spinning'}>
            ↻ Rejouer (test)
          </button>
        </div>
      )}

      <nav aria-label="Continuer sur le site" style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
        <Link href="/menu" className="btn btn-primary roue-btn">Découvrir la carte</Link>
        <Link href="/" className="btn btn-ghost">Accueil</Link>
        <Link href="/contact" className="btn btn-ghost">Nous trouver</Link>
      </nav>

      <details style={{ marginTop: '2rem', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--color-gold-muted)', textAlign: 'center', listStyle: 'none' }}>
          Règlement et chances de gain
        </summary>
        <div className="card" style={{ marginTop: '1rem', lineHeight: 1.7 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
            {prizes.map((p) => (
              <li key={p.key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '0.35rem 0' }}>
                <span>{p.label}</span>
                <span style={{ color: 'var(--color-gold)' }}>
                  {((Number(p.weight) / total) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %
                </span>
              </li>
            ))}
          </ul>
          <p>
            Jeu gratuit réservé aux personnes ayant reçu le flyer Da Enzo. Une participation par téléphone. Le gain est
            valable {validityDays} jours, sur place, en une seule fois, pour une table. Non cumulable avec une autre offre,
            non échangeable contre des espèces. Les réductions s'appliquent à l'addition de la table.
          </p>
        </div>
      </details>
    </section>
  );
}
