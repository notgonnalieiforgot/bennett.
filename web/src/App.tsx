import { useState } from 'react';
import { ThemeProvider, ThemeSwitcher } from './themes';
import { BentoGridPreview } from './components/BentoGridPreview';
import { DoubleLock } from './features/DoubleLock';
import { MarbleJar } from './features/MarbleJar';
import { Shields } from './features/Shielding';
import { Confirmshaming } from './features/DarkPatterns';
import { DoerTab } from './features/DoerTab';
import { Arena } from './features/Arena';
import { Scholarship, RedemptionQuest } from './features/Revenue';
import { MasteryBadges } from './features/Revenue/MasteryBadges';
import { WaitlistDiagnostic, WaitlistThankYou, FounderReview } from './features/Waitlist';
import { BetaFeedback } from './features/Feedback';
import { AuthGate } from './features/Auth/AuthGate';
import type { Marble } from '@bennett/shared';

const SEED_MARBLES: Marble[] = (() => {
  const out: Marble[] = [];
  for (let i = 0; i < 14; i++) {
    const day = i + 1;
    const kind: Marble['kind'] =
      day === 7 ? 'gold'
      : day === 12 ? 'ghost'
      : 'clear';
    out.push({
      id: `seed-${day}`,
      kind,
      earnedAt: Date.now(),
      date: `2026-04-${String(day).padStart(2, '0')}`,
      moduleCompleted: kind === 'ghost' ? null : 'fitness',
    });
  }
  return out;
})();

type View = 'home' | 'doer' | 'arena' | 'redemption' | 'waitlist' | 'founder';

export function App() {
  const [doubleLockOpen, setDoubleLockOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [view, setView] = useState<View>('home');
  const [marbles] = useState<Marble[]>(SEED_MARBLES);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  return (
    <ThemeProvider>
      <AuthGate>
      <Confirmshaming
        open={confirmOpen}
        trigger="exit_focus_session"
        onConfirm={() => setConfirmOpen(false)}
      />
      <BetaFeedback
        open={feedbackOpen}
        trigger="double_lock_complete"
        onClose={() => setFeedbackOpen(false)}
      />
      {doubleLockOpen ? (
        <DoubleLock
          onComplete={() => {
            setDoubleLockOpen(false);
            window.setTimeout(() => setFeedbackOpen(true), 600);
          }}
        />
      ) : view === 'doer' ? (
        <main className="min-h-dvh w-full bg-bg text-text font-sans">
          <SubHeader title="doer tab" onBack={() => setView('home')} />
          <DoerTab />
        </main>
      ) : view === 'arena' ? (
        <main className="min-h-dvh w-full bg-bg text-text font-sans">
          <SubHeader title="arena" onBack={() => setView('home')} />
          <Arena />
        </main>
      ) : view === 'redemption' ? (
        <main className="min-h-dvh w-full bg-bg text-text font-sans">
          <SubHeader title="redemption quest" onBack={() => setView('home')} />
          <RedemptionQuest
            date={new Date().toISOString().slice(0, 10)}
            onSurvived={() => setView('home')}
            onBroken={() => setView('home')}
          />
        </main>
      ) : view === 'waitlist' ? (
        <main className="min-h-dvh w-full bg-bg text-text font-sans">
          <SubHeader title="waitlist" onBack={() => { setView('home'); setSubmittedAppId(null); }} />
          {submittedAppId
            ? <WaitlistThankYou applicationId={submittedAppId} />
            : <WaitlistDiagnostic onSubmitted={setSubmittedAppId} />}
        </main>
      ) : view === 'founder' ? (
        <main className="min-h-dvh w-full bg-bg text-text font-sans">
          <SubHeader title="founder review" onBack={() => setView('home')} />
          <FounderReview />
        </main>
      ) : (
        <main className="min-h-dvh w-full bg-bg text-text font-sans px-6 py-12 max-w-5xl mx-auto">
          <header className="text-center space-y-2 mb-10">
            <h1 className="text-5xl font-extrabold lowercase">bennett.</h1>
            <p className="text-muted lowercase">ur external prefrontal cortex.</p>
            <p className="text-muted text-xs lowercase">
              ur cognitive operating system. tap below to roam.
            </p>
          </header>
          <div className="text-center mb-10 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setDoubleLockOpen(true)}
              className="bg-accent text-white font-semibold lowercase rounded-[14px] px-6 py-3"
            >
              run the double-lock
            </button>
            <button
              onClick={() => setView('doer')}
              className="bg-surface/20 text-text font-semibold lowercase rounded-[14px] px-6 py-3 border border-border/30"
            >
              open doer tab
            </button>
            <button
              onClick={() => setView('arena')}
              className="bg-surface/20 text-text font-semibold lowercase rounded-[14px] px-6 py-3 border border-border/30"
            >
              the arena
            </button>
            <button
              onClick={() => setView('redemption')}
              className="bg-surface/20 text-text font-semibold lowercase rounded-[14px] px-6 py-3 border border-border/30"
            >
              redemption quest
            </button>
            <button
              onClick={() => setView('waitlist')}
              className="bg-surface/20 text-text font-semibold lowercase rounded-[14px] px-6 py-3 border border-border/30"
            >
              join the founding 100
            </button>
            <button
              onClick={() => setView('founder')}
              className="bg-surface/20 text-text font-semibold lowercase rounded-[14px] px-6 py-3 border border-border/30"
            >
              founder review
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="bg-surface/20 text-text font-semibold lowercase rounded-[14px] px-6 py-3 border border-border/30"
            >
              test confirmshaming
            </button>
          </div>
          <section className="mb-10">
            <ThemeSwitcher />
          </section>
          <section className="mb-10">
            <h2 className="text-center text-muted text-xs lowercase mb-4">marble jar — tap a marble</h2>
            <MarbleJar marbles={marbles} />
          </section>
          <section className="mb-10 max-w-md mx-auto">
            <Shields />
          </section>
          <section className="mb-10 max-w-md mx-auto">
            <Scholarship />
          </section>
          <section className="mb-10 max-w-md mx-auto">
            <MasteryBadges />
          </section>
          <section>
            <BentoGridPreview />
          </section>
        </main>
      )}
      </AuthGate>
    </ThemeProvider>
  );
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between">
      <button onClick={onBack} className="text-muted text-xs lowercase">← back to home</button>
      <span className="text-text font-semibold lowercase">{title}</span>
      <span className="w-12" />
    </div>
  );
}
