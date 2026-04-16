'use client';

import { useState } from 'react';

const FLEET_URL = 'https://fleetmind.co';

interface LoginPageProps {
  onLogin: (session: { token: string; name: string; email: string; isDemo: boolean }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<'demo' | 'email' | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleDemo = async () => {
    setLoading('demo');
    setError('');
    try {
      // Call our own backend which does the demo login
      const res = await fetch('/api/auth/demo');
      if (!res.ok) throw new Error('Demo login fallito');
      const data = await res.json();
      onLogin({
        token: data.token,
        name: data.name || 'Demo FleetMind',
        email: data.email || 'demo@fleetmind.co',
        isDemo: true,
      });
    } catch {
      setError('Impossibile accedere alla demo. Riprova.');
    } finally {
      setLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading('email');
    setError('');
    try {
      // Get CSRF token from fleetmind.co
      const csrfRes = await fetch(`${FLEET_URL}/api/auth/csrf`);
      const { csrfToken } = await csrfRes.json();

      // Request magic link
      const res = await fetch(`${FLEET_URL}/api/auth/signin/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, csrfToken, callbackUrl: `${FLEET_URL}/api/auth/session` }),
      });

      if (res.ok) {
        setEmailSent(true);
      } else {
        setError('Invio email fallito. Verifica l\'indirizzo.');
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full h-[100dvh] bg-bg items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#1d4ed8] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text">FleetMind</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Assistente AI</p>
          </div>
        </div>

        {/* Demo button — primary */}
        <button
          onClick={handleDemo}
          disabled={loading !== null}
          className="w-full h-11 rounded-lg bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading === 'demo' ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>
          )}
          Accedi come Demo
        </button>
        <p className="text-[11px] text-text-muted text-center mt-2 mb-6">
          Dati di esempio precaricati — esplora subito
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-muted uppercase tracking-wider">oppure</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email login */}
        {emailSent ? (
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-text-secondary">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <p className="text-sm font-medium text-text mb-1">Controlla la tua email</p>
            <p className="text-xs text-text-muted">
              Abbiamo inviato un link di accesso a <strong>{email}</strong>
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-3 text-xs text-text-muted hover:text-text transition-colors"
            >
              Usa un altro indirizzo
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin}>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Accedi con il tuo account FleetMind
            </label>
            <input
              type="email"
              placeholder="email@azienda.it"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-bg-chat text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/30 focus:border-[#1d4ed8] transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading !== null || !email.trim()}
              className="w-full h-10 mt-2 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'email' ? (
                <span className="w-4 h-4 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" />
              ) : (
                'Invia link di accesso'
              )}
            </button>
            <p className="text-[10px] text-text-muted text-center mt-2">
              Riceverai un magic link per accedere ai dati della tua flotta
            </p>
          </form>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
