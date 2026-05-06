import { useEffect, useState } from 'react';
import type {
  DoerTabAccessStatus,
  MasterySector,
  ModuleContent,
  PSMQuiz,
  SectorProgress,
} from '@bennett/shared';
import { MODULES, evaluateDoerTabAccess } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { fetchAccess } from '../../services/doerTab';
import { fetchPSM, loadSectorProgress } from '../../services/mastery';
import { Paywall } from './Paywall';
import { KnowledgeBar } from './KnowledgeBar';
import { ModuleDetail } from './ModuleDetail';
import { MarketInsights } from './MarketInsights';
import { FounderConsole } from './FounderConsole';
import { PSMQuiz as PSMQuizUI, SectorProgressBar } from '../Quiz';

export function DoerTab() {
  const user = useUserStore((s) => s.user);
  const [access, setAccess] = useState<DoerTabAccessStatus | null>(null);
  const [selected, setSelected] = useState<ModuleContent | null>(null);
  const [showFounder, setShowFounder] = useState(false);
  const [sectorProgress, setSectorProgress] = useState<SectorProgress[]>([]);
  const [psm, setPsm] = useState<PSMQuiz | null>(null);
  const [psmErr, setPsmErr] = useState<string | null>(null);

  async function refreshProgress() {
    if (!user?.uid) return;
    try {
      setSectorProgress(await loadSectorProgress(user.uid));
    } catch {
      setSectorProgress([]);
    }
  }

  async function takeBarExam(sector: MasterySector) {
    if (!user?.uid) return;
    try {
      const r = await fetchPSM({ uid: user.uid, sector });
      if (r.unlocked && r.quiz) setPsm(r.quiz);
      else setPsmErr(r.reason ?? 'locked');
    } catch (e) {
      setPsmErr((e as Error).message);
    }
  }

  useEffect(() => {
    void refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setAccess(
        evaluateDoerTabAccess({
          doerTabSubscriptionActive: user?.doerTabSubscriptionActive ?? false,
          currentStreak: user?.currentStreak ?? 0,
        }),
      );
      return;
    }
    fetchAccess(user.uid)
      .then(setAccess)
      .catch(() =>
        setAccess(
          evaluateDoerTabAccess({
            doerTabSubscriptionActive: user.doerTabSubscriptionActive ?? false,
            currentStreak: user.currentStreak ?? 0,
          }),
        ),
      );
  }, [user?.uid, user?.doerTabSubscriptionActive, user?.currentStreak]);

  if (!access) {
    return <div className="text-muted p-6 text-sm lowercase">loading…</div>;
  }

  if (!access.allowed) {
    return <Paywall reason={access.reason} currentStreak={access.currentStreak} />;
  }

  if (selected) {
    return <ModuleDetail module={selected} onBack={() => setSelected(null)} />;
  }

  if (psm) {
    return (
      <PSMQuizUI
        quiz={psm}
        onComplete={() => {
          setPsm(null);
          void refreshProgress();
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-5 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold lowercase">the war room</h1>
        <p className="text-muted text-sm lowercase">
          tap any module to enter it. search any topic above for a 20-min protocol.
        </p>
      </header>
      <KnowledgeBar />

      {sectorProgress.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-text text-sm font-semibold lowercase">sector progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sectorProgress.map((p) => (
              <SectorProgressBar key={p.sector} progress={p} onTakeBarExam={takeBarExam} />
            ))}
          </div>
          {psmErr && <div className="text-muted text-xs lowercase">{psmErr}</div>}
        </section>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="text-left rounded-bn bg-surface/30 border border-border/30 p-4 space-y-1 hover:border-accent/40 transition-colors"
          >
            <div className="text-2xl">{m.emoji}</div>
            <div className="font-bold lowercase">{m.name.toLowerCase()}</div>
            <div className="text-muted text-[11px] lowercase line-clamp-2">{m.oneLiner}</div>
          </button>
        ))}
      </div>
      <MarketInsights />
      <button
        onClick={() => setShowFounder((v) => !v)}
        className="text-muted text-xs lowercase"
      >
        {showFounder ? 'hide founder console' : 'open founder console'}
      </button>
      {showFounder && <FounderConsole />}
    </div>
  );
}
