import { useState } from 'react';
import { sendForgotPassword } from '../../services/auth-flow';

export function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true); setError(null);
    try {
      await sendForgotPassword(email);
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh w-full bg-[#0A0A0A] text-white flex justify-center px-6 py-16">
      <div className="max-w-sm w-full space-y-4">
        {sent ? (
          <>
            <h1 className="text-3xl font-extrabold lowercase">check ur email.</h1>
            <p className="text-white/60 text-sm lowercase">link expires in 15 minutes.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold lowercase">forgot password?</h1>
            <p className="text-white/60 text-sm lowercase">
              enter ur email and we'll send a reset link.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 outline-none"
            />
            <button
              onClick={() => void send()}
              disabled={loading || !email}
              className="w-full bg-[#FF6B00] text-white font-semibold rounded-xl py-3.5 disabled:opacity-60"
            >
              {loading ? 'sending…' : 'send it'}
            </button>
            {error && <div className="text-white/60 text-xs lowercase">{error}</div>}
          </>
        )}
        <button onClick={onBack} className="text-white/60 text-xs">
          back to sign in
        </button>
      </div>
    </main>
  );
}
