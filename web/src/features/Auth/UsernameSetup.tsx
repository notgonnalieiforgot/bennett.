import { useEffect, useRef, useState } from 'react';
import { checkUsername, lockUsername } from '../../services/auth-flow';

interface Props {
  uid: string;
  onLocked: () => void;
}

export function UsernameSetup({ uid, onLocked }: Props) {
  const [username, setUsername] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    setAvailable(null);
    if (username.trim().length < 3) return;
    debounce.current = window.setTimeout(async () => {
      setChecking(true);
      try {
        const r = await checkUsername(username.trim());
        setAvailable(r.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);
  }, [username]);

  async function lockIn() {
    if (available !== true) return;
    try {
      await lockUsername({ uid, username: username.trim() });
      onLocked();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const borderClass =
    available === true ? 'border-green-500/70'
    : available === false ? 'border-white/40'
    : 'border-white/15';

  return (
    <main className="min-h-dvh w-full bg-[#0A0A0A] text-white flex justify-center px-6 py-16">
      <div className="max-w-sm w-full space-y-4">
        <h1 className="text-3xl font-extrabold lowercase">pick ur username</h1>
        <p className="text-white/60 text-sm lowercase">this is how u show up in the arena.</p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="@username"
          autoComplete="off"
          spellCheck={false}
          className={`w-full bg-white/[0.06] border-2 rounded-xl px-4 py-4 text-lg font-semibold outline-none ${borderClass}`}
        />
        <div className="text-xs h-4">
          {checking && <span className="text-white/60">checking…</span>}
          {available === true && <span className="text-green-400">✓ available</span>}
          {available === false && <span className="text-white/50">✗ taken</span>}
        </div>
        <ul className="text-xs text-white/50 space-y-0.5">
          <li>· 3–20 characters</li>
          <li>· letters, numbers, underscores only</li>
          <li>· can't be changed for 30 days</li>
        </ul>
        <button
          onClick={() => void lockIn()}
          disabled={available !== true}
          className={`w-full font-semibold rounded-xl py-3.5 ${
            available === true ? 'bg-[#FF6B00] text-white' : 'bg-white/15 text-white/50'
          }`}
        >
          lock it in
        </button>
        {error && <div className="text-white/60 text-xs lowercase">{error}</div>}
      </div>
    </main>
  );
}
