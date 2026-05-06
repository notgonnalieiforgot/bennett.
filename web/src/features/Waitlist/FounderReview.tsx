import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Sector } from '@bennett/shared';
import { FOUNDING_TARGET_PER_SECTOR } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import {
  decideFounder,
  listForFounder,
  type FounderApplicationItem,
} from '../../services/waitlist';

const SECTOR_LABELS: Record<Sector, string> = {
  finance_investing: 'finance / investing',
  stem: 'stem',
  real_estate: 'real estate',
  general_growth: 'general growth',
};

/**
 * Tinder-card stack for the Founder. Per spec §10c. Tracks the 25%
 * sector distribution against the FOUNDING_COHORT_TARGET.
 */
export function FounderReview() {
  const user = useUserStore((s) => s.user);
  const [items, setItems] = useState<FounderApplicationItem[]>([]);
  const [filter, setFilter] = useState<'undecided' | 'flagged' | 'approved' | 'rejected'>('undecided');
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!user?.uid) return;
    try {
      const xs = await listForFounder({ uid: user.uid, filter });
      setItems(xs);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filter]);

  const stats = useMemo(() => {
    let approved = 0;
    const bySector: Record<Sector, number> = {
      finance_investing: 0,
      stem: 0,
      real_estate: 0,
      general_growth: 0,
    };
    for (const it of items) {
      if (it.decision?.decision === 'approved') {
        approved += 1;
        if (it.dossier?.sector) bySector[it.dossier.sector] += 1;
      }
    }
    return { approved, bySector };
  }, [items]);

  const queue = items.filter((it) => !it.decision);
  const top = queue[0];

  async function decide(d: 'approved' | 'rejected') {
    if (!user?.uid || !top) return;
    try {
      await decideFounder({
        uid: user.uid,
        applicationId: top.application.id,
        decision: d,
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="max-w-2xl mx-auto p-5 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold lowercase">founder's command center</h1>
        <p className="text-muted text-sm lowercase">
          the founding 100. swipe one at a time.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        {(['undecided', 'flagged', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full ${
              filter === f ? 'bg-accent text-white' : 'bg-surface/30 text-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 text-[11px] text-muted">
        {(Object.keys(SECTOR_LABELS) as Sector[]).map((s) => {
          const c = stats.bySector[s];
          return (
            <div key={s} className="rounded-md bg-surface/30 p-2">
              <div className="text-text font-medium lowercase">{SECTOR_LABELS[s]}</div>
              <div className={`font-mono ${c >= FOUNDING_TARGET_PER_SECTOR ? 'text-accent' : ''}`}>
                {c} / {FOUNDING_TARGET_PER_SECTOR}
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="text-muted text-xs lowercase">{error}</div>}

      <div className="relative h-[420px]">
        <AnimatePresence mode="wait">
          {top ? (
            <ApplicantCard key={top.application.id} item={top} />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center text-muted text-sm lowercase"
            >
              {filter === 'undecided' ? 'no pending applications.' : `no ${filter}.`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {top && filter === 'undecided' && (
        <div className="flex gap-3">
          <button
            onClick={() => void decide('rejected')}
            className="flex-1 bg-surface/30 text-text font-semibold lowercase rounded-[12px] py-3 border border-border/30"
          >
            reject
          </button>
          <button
            onClick={() => void decide('approved')}
            className="flex-1 bg-accent text-white font-semibold lowercase rounded-[12px] py-3"
          >
            approve
          </button>
        </div>
      )}
    </section>
  );
}

function ApplicantCard({ item }: { item: FounderApplicationItem }) {
  const a = item.application;
  const d = item.dossier;
  const dec = item.decision;

  const q1 = a.answers.find((x) => x.questionId === 'q1_friction');
  const q2 = a.answers.find((x) => x.questionId === 'q2_ambition');
  const q3 = a.answers.find((x) => x.questionId === 'q3_stack');
  const q4 = a.answers.find((x) => x.questionId === 'q4_failure');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="absolute inset-0 rounded-bn bg-surface/30 border border-border/30 p-5 space-y-3 overflow-y-auto"
    >
      <header className="flex items-center justify-between">
        <span className="font-mono text-text text-sm">{a.email}</span>
        {d?.flagged && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-white px-2 py-0.5 rounded-full">
            flagged
          </span>
        )}
      </header>
      {d ? (
        <div className="space-y-1 text-xs">
          <div className="flex gap-2 flex-wrap">
            <Badge>{`tier ${d.ambitionTier}`}</Badge>
            <Badge>{SECTOR_LABELS[d.sector]}</Badge>
            <Badge>{`tech ${d.techSavviness}`}</Badge>
            <Badge>{`commit ${d.commitmentSignal}`}</Badge>
            <Badge>{d.frictionProfile}</Badge>
          </div>
          <p className="text-text text-sm lowercase pt-1">{d.summary}</p>
        </div>
      ) : (
        <div className="text-muted text-xs lowercase">dossier pending — submit again or wait.</div>
      )}

      <div className="space-y-2 pt-2 border-t border-border/20">
        <Q label="friction">{q1?.questionId === 'q1_friction' ? q1.text : '—'}</Q>
        <Q label={`ambition ${q2?.questionId === 'q2_ambition' ? q2.scale : ''}`}>
          {q2?.questionId === 'q2_ambition' ? q2.text : '—'}
        </Q>
        <Q label="stack">
          {q3?.questionId === 'q3_stack' ? q3.selected.join(', ') : '—'}
        </Q>
        <Q label="if bennett fails">{q4?.questionId === 'q4_failure' ? q4.text : '—'}</Q>
      </div>

      {dec && (
        <div className={`text-xs font-bold uppercase tracking-wider ${dec.decision === 'approved' ? 'text-accent' : 'text-muted'}`}>
          decided · {dec.decision}
          {dec.inviteCode && <span className="ml-2 font-mono normal-case">{dec.inviteCode}</span>}
        </div>
      )}
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider bg-bg/40 text-text px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}

function Q({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-muted text-[10px] uppercase tracking-wider">{label}</div>
      <div className="text-text text-sm whitespace-pre-line">{children}</div>
    </div>
  );
}
