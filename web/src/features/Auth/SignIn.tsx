import { useState } from 'react';
import { authService } from '../../services/auth-flow';

interface Props {
  onSignedIn: (uid: string) => void;
  onShowSignUp: () => void;
  onForgotPassword: () => void;
}

export function SignIn({ onSignedIn, onShowSignUp, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function go(fn: () => Promise<{ user: { uid: string } }>) {
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
      <div className="max-w-sm w-full space-y-3">
        <h1 className="text-3xl font-extrabold lowercase mb-6">welcome back.</h1>
        <button
          onClick={() => void go(authService.signInWithApple)}
          className="w-full bg-white/[0.06] border border-white/15 rounded-xl py-3.5 text-[15px]"
        >
          continue with apple
        </button>
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-white/50 text-[11px]">or</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>
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
          placeholder="password"
          className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 outline-none"
        />
        <button
          onClick={() => void go(() => authService.signInWithEmail(email, password))}
          disabled={loading}
          className="w-full bg-[#FF6B00] text-white font-semibold rounded-xl py-3.5 disabled:opacity-60"
        >
          {loading ? 'signing in…' : 'sign in'}
        </button>
        <button onClick={onForgotPassword} className="w-full text-white/60 text-xs">
          forgot password?
        </button>
        {error && <div className="text-white/60 text-xs lowercase">{error}</div>}
        <div className="text-center pt-6">
          <button onClick={onShowSignUp} className="text-white/60 text-xs lowercase">
            new here? create an account
          </button>
        </div>
      </div>
    </main>
  );
}
