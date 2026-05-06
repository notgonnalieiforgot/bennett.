import { useEffect, useState } from 'react';
import type { Shield, ShieldsTodayResponse } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import {
  consentURL,
  refreshShieldsToday,
  reportShieldIgnored,
} from '../../services/shields';

/** Today's shields panel. Mirrors apple/Bennett/Features/Shielding/ShieldsTodayView.swift. */
export function Shields() {
  const user = useUserStore((s) => s.user);
  const [data, setData] = useState<ShieldsTodayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realTalk, setRealTalk] = useState<string | null>(null);

  async function refresh() {
    if (!user?.uid) {
      setData({ connected: false, shields: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await refreshShieldsToday({
        uid: user.uid,
        energyPulse: user.energyPulseToday ?? 5,
      });
      setData(res);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function connect() {
    if (!user?.uid) return;
    try {
      const url = await consentURL(user.uid);
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function ignore(shield: Shield) {
    if (!user?.uid) return;
    try {
      const r = await reportShieldIgnored({
        uid: user.uid,
        shieldId: shield.id,
        energyPulse: user.energyPulseToday ?? 5,
        userName: user.username ?? 'u',
      });
      if (r.realTalk) setRealTalk(r.realTalk);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return (
    <section className="rounded-bn bg-surface/10 border border-border/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text lowercase">today's shields</h3>
        <button
          onClick={() => void refresh()}
          aria-label="refresh shields"
          className="text-muted text-xs"
        >
          ↻
        </button>
      </div>
      {loading && !data && <div className="text-muted text-sm lowercase">loading…</div>}
      {error && <div className="text-muted text-xs lowercase">{error}</div>}
      {data && !data.connected && (
        <div className="space-y-2">
          <p className="text-muted text-sm lowercase">
            connect google calendar to let bennett protect ur focus time.
          </p>
          <button
            onClick={() => void connect()}
            className="bg-accent text-white font-semibold lowercase rounded-[10px] px-4 py-2 text-sm"
          >
            connect calendar
          </button>
        </div>
      )}
      {data && data.connected && (
        <div className="space-y-2">
          {data.shields.length === 0 ? (
            <div className="text-muted text-xs lowercase">
              {data.freeBlocks?.length
                ? 'calendar is tight today. no shield placed.'
                : 'ur calendar is wide open. nothing to shield.'}
            </div>
          ) : (
            data.shields.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span>🛡</span>
                <div className="flex-1">
                  <div className="text-text text-sm font-medium">
                    {fmt(s.start)} – {fmt(s.end)}
                  </div>
                  <div className="text-muted text-[11px] lowercase">{s.state}</div>
                </div>
                {s.state === 'active' && (
                  <button
                    onClick={() => void ignore(s)}
                    className="text-muted text-xs lowercase"
                  >
                    ignore
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {realTalk && (
        <div className="mt-3 rounded-[10px] bg-red-700/85 text-white text-sm font-medium p-3">
          {realTalk}
        </div>
      )}
    </section>
  );
}

function fmt(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
