import { useState } from 'react';
import { authService } from '../../services/auth-flow';

interface Props {
  onSignedIn: (uid: string) => void;
  onShowSignIn: () => void;
}

/** Phase 7.1 — Web sign-up screen. Same provider order + spec layout. */
export function SignUp({ onSignedIn, onShowSignIn }: Props) {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function safeRun(fn: () => Promise<{ user: { uid: string } }>) {
    setLoading(true); setError(null);
    try {
      const r = await fn();
      onSignedIn(r.user.uid);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh w-full bg-[#0A0A0A] text-white flex justify-center px-6 py-16">
      <div className="max-w-sm w-full space-y-4">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold lowercase">bennett.</h1>
          <p className="text-white/60 text-sm lowercase mt-2">ur external prefrontal cortex.</p>
        </header>
        {emailMode ? (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password (8+ chars)"
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none"
            />
            <button
              onClick={() => void safeRun(() => authService.signUpWithEmail(email, password))}
              disabled={loading}
              className="w-full bg-[#FF6B00] text-white font-semibold rounded-xl py-3.5 disabled:opacity-60"
            >
              {loading ? 'creating…' : 'create account'}
            </button>
            <button onClick={() => setEmailMode(false)} className="w-full text-white/60 text-xs">
              back
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Provider label="continue with apple" icon="" onClick={() => void safeRun(authService.signInWithApple)} />
            <Provider label="continue with google" icon="G" onClick={() => void safeRun(authService.signInWithGoogle)} />
            <Provider label="continue with facebook" icon="f" onClick={() => void safeRun(authService.signInWithFacebook)} />
            <Provider label="continue with linkedin" icon="in" onClick={() => void authService.signInWithLinkedIn()} />
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-white/50 text-[11px]">or</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>
            <Provider label="continue with email" icon="✉" onClick={() => setEmailMode(true)} />
          </div>
        )}
        {error && <div className="text-white/60 text-xs lowercase">{error}</div>}
        <div className="text-center pt-6">
          <button onClick={onShowSignIn} className="text-white/60 text-xs lowercase">
            already have an account? sign in
          </button>
        </div>
      </div>
    </main>
  );
}

function Provider({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/[0.06] border border-white/15 rounded-xl py-3.5 px-4 flex items-center gap-3 text-left text-white text-[15px] active:scale-[0.97] transition-transform"
    >
      <span className="w-5 text-center font-bold">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
