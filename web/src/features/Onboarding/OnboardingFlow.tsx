import { useEffect, useState } from 'react';
import type { KnowledgeModule, UITheme } from '@bennett/shared';
import { UI_THEMES } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { completeOnboarding } from '../../services/auth-flow';
import { DoubleLock } from '../DoubleLock';
import { MarbleJar } from '../MarbleJar';
import type { Marble } from '@bennett/shared';

interface Props {
  uid: string;
  onComplete: () => void;
}

const MODULES: Array<{ id: KnowledgeModule; emoji: string; label: string }> = [
  { id: 'fitness', emoji: '🏋️', label: 'fitness' },
  { id: 'real_estate', emoji: '🏠', label: 'real estate' },
  { id: 'investing', emoji: '📈', label: 'investing' },
  { id: 'ai_tech', emoji: '🤖', label: 'ai & tech' },
  { id: 'cooking', emoji: '🍳', label: 'cooking' },
];

const THEME_LABELS: Record<UITheme, { name: string; mood: string }> = {
  glassmorphism: { name: 'Glassmorphism', mood: 'executive mode. high-tech, layered.' },
  'neo-brutalism': { name: 'Neo-Brutalism', mood: 'war mode. direct, zero friction.' },
  claymorphism: { name: 'Claymorphism', mood: 'calm mode. soft, low pressure.' },
  'liquid-glass': { name: 'Liquid Glass', mood: 'doer mode. fluid, high energy.' },
};

const DEMO_MARBLES: Marble[] = [
  { id: 'demo-1', kind: 'clear', earnedAt: 0, date: '2026-04-01', moduleCompleted: 'fitness' },
  { id: 'demo-2', kind: 'gold', earnedAt: 0, date: '2026-04-07', moduleCompleted: 'fitness' },
  { id: 'demo-3', kind: 'ghost', earnedAt: 0, date: '2026-04-12', moduleCompleted: null },
];

export function OnboardingFlow({ uid, onComplete }: Props) {
  const setTheme = useUserStore((s) => s.setTheme);
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState(5);
  const [theme, setLocalTheme] = useState<UITheme>('glassmorphism');
  const [modules, setModules] = useState<Set<KnowledgeModule>>(new Set());
  const [showSkip, setShowSkip] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);

  async function finish() {
    await completeOnboarding(uid);
    onComplete();
  }

  function next() { setStep((s) => Math.min(s + 1, 10)); }

  return (
    <main className="min-h-dvh w-full bg-bg text-text">
      <header className="px-5 py-3 flex items-center gap-3">
        <div className="flex-1 h-1 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${(step / 10) * 100}%` }}
          />
        </div>
        <span className="text-muted text-[11px] lowercase whitespace-nowrap">
          step {step} of 10
        </span>
        <button
          onClick={() => setShowSkip(true)}
          className="text-muted text-xs"
        >
          ⚙
        </button>
      </header>

      <div className="px-5 py-8 max-w-md mx-auto">
        {step === 1 && <WelcomeStep onNext={next} />}
        {step === 2 && (
          <EnergyStep value={energy} onChange={setEnergy} onNext={next} />
        )}
        {step === 3 && (
          <ThemeStep
            selected={theme}
            onSelect={(t) => { setLocalTheme(t); setTheme(t); }}
            onNext={next}
          />
        )}
        {step === 4 && (
          <DoubleLockStep
            onPractice={() => setPracticeOpen(true)}
            onSkip={next}
          />
        )}
        {step === 5 && (
          <GoalsStep selected={modules} onToggle={(m) => {
            setModules((cur) => {
              const next = new Set(cur);
              if (next.has(m)) next.delete(m); else next.add(m);
              return next;
            });
          }} onNext={next} />
        )}
        {step === 6 && <MarbleIntroStep onNext={next} />}
        {step === 7 && <CalendarStep onNext={next} />}
        {step === 8 && <ScholarshipStep onNext={next} />}
        {step === 9 && <NotificationsStep onNext={next} />}
        {step === 10 && <UnlockStep onComplete={() => void finish()} />}
      </div>

      {showSkip && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-bg border border-border/40 rounded-bn p-6 max-w-sm space-y-4">
            <div className="text-text font-bold lowercase">skip setup?</div>
            <div className="text-muted text-sm lowercase">u might miss something that matters.</div>
            <div className="flex gap-2">
              <button onClick={() => setShowSkip(false)} className="flex-1 bg-accent text-white rounded-md py-2.5 lowercase">
                nah, i'll finish
              </button>
              <button onClick={() => void finish()} className="flex-1 bg-surface/40 text-muted rounded-md py-2.5 lowercase">
                yeah, skip it
              </button>
            </div>
          </div>
        </div>
      )}

      {practiceOpen && (
        <DoubleLock onComplete={() => { setPracticeOpen(false); next(); }} />
      )}
    </main>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const [idx, setIdx] = useState(0);
  const lines = [
    "hey. i'm bennett.",
    "ur external prefrontal cortex.",
    "i'm gonna help u actually do the things u already know u should be doing.",
    "let's set u up. takes about 3 minutes.",
  ];
  useEffect(() => {
    const id = window.setInterval(() => setIdx((i) => (i < lines.length - 1 ? i + 1 : i)), 600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="space-y-4">
      {lines.slice(0, idx + 1).map((l, i) => (
        <div key={i} className="text-text text-base">{l}</div>
      ))}
      {idx >= lines.length - 1 && (
        <button onClick={onNext} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 mt-6 lowercase">
          let's go
        </button>
      )}
    </div>
  );
}

function EnergyStep({ value, onChange, onNext }: { value: number; onChange: (n: number) => void; onNext: () => void }) {
  const response = value <= 3
    ? "respect. being honest about it is the first move."
    : value <= 6
    ? "mid energy. that's actually perfect for getting started."
    : "ok u got juice rn. let's channel it.";
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold lowercase">first thing.</h2>
      <p className="text-muted text-sm lowercase">how's ur energy right now. 1 to 10.</p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-md font-semibold ${
              value === n ? 'bg-accent text-white' : 'bg-surface/30 text-muted'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-muted text-sm lowercase">{response}</p>
      <button onClick={onNext} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase">
        that's my number
      </button>
    </div>
  );
}

function ThemeStep({ selected, onSelect, onNext }: { selected: UITheme; onSelect: (t: UITheme) => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold lowercase">pick ur vibe.</h2>
      <p className="text-muted text-sm lowercase">u can change this later.</p>
      <div className="space-y-2">
        {UI_THEMES.map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`w-full text-left rounded-bn p-4 border transition-colors ${
              selected === t ? 'bg-surface/30 border-accent' : 'bg-surface/30 border-border/30'
            }`}
          >
            <div className="text-text font-bold">{THEME_LABELS[t].name}</div>
            <div className="text-muted text-xs lowercase">{THEME_LABELS[t].mood}</div>
          </button>
        ))}
      </div>
      <button onClick={onNext} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase">
        this is me
      </button>
    </div>
  );
}

function DoubleLockStep({ onPractice, onSkip }: { onPractice: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <h2 className="text-xl font-bold lowercase">every day starts with the double-lock.</h2>
      <p className="text-muted text-sm lowercase">60 seconds. 3 steps. let's do a practice run.</p>
      <button onClick={onPractice} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase">
        start practice
      </button>
      <button onClick={onSkip} className="text-muted text-xs lowercase">
        skip the practice
      </button>
    </div>
  );
}

function GoalsStep({ selected, onToggle, onNext }: { selected: Set<KnowledgeModule>; onToggle: (m: KnowledgeModule) => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold lowercase">what do u want to get better at.</h2>
      <p className="text-muted text-sm lowercase">pick at least one. u can add more later.</p>
      <div className="grid grid-cols-2 gap-2">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            className={`rounded-bn bg-surface/30 border p-4 text-center ${
              selected.has(m.id) ? 'border-accent' : 'border-border/30'
            }`}
          >
            <div className="text-2xl">{m.emoji}</div>
            <div className="text-text font-semibold text-sm lowercase mt-1">{m.label}</div>
          </button>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={selected.size === 0}
        className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase disabled:opacity-50"
      >
        this is my focus
      </button>
    </div>
  );
}

function MarbleIntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <MarbleJar marbles={DEMO_MARBLES} width={280} height={360} />
      <div className="text-text text-base">this is ur marble jar.</div>
      <div className="text-muted text-sm lowercase">
        every day u complete the double-lock, u earn a marble. miss a day, ghost marble. they stay forever.
      </div>
      <button onClick={onNext} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase">
        i get it
      </button>
    </div>
  );
}

function CalendarStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold lowercase">bennett can protect ur time.</h2>
      <p className="text-muted text-sm lowercase">
        connect ur calendar and bennett will block focus time automatically. ignore 3 of those blocks and i'll say something.
      </p>
      <button onClick={onNext} className="w-full bg-white text-black font-semibold rounded-[14px] py-3.5 lowercase">
        connect google calendar
      </button>
      <button onClick={onNext} className="text-muted text-xs lowercase">skip for now</button>
    </div>
  );
}

function ScholarshipStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <h2 className="text-xl font-bold lowercase">here's the deal.</h2>
      <div className="text-6xl font-extrabold text-accent">$20</div>
      <p className="text-text font-semibold lowercase">pay $20. hit a perfect 30-day streak. get it all back.</p>
      <p className="text-muted text-xs lowercase">miss a day? bennett keeps it. the money isn't the point.</p>
      <button onClick={onNext} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase">
        start scholarship mode
      </button>
      <button onClick={onNext} className="text-muted text-xs lowercase">not yet, i'll do it later</button>
    </div>
  );
}

function NotificationsStep({ onNext }: { onNext: () => void }) {
  async function approve() {
    if ('Notification' in window) await Notification.requestPermission();
    onNext();
  }
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold lowercase">last thing. can i check in on u?</h2>
      <p className="text-muted text-sm lowercase">
        i won't spam u. just the important stuff — daily check-in, ur bulletin every friday, streak status.
      </p>
      <div className="space-y-2">
        {['hey. energy check. 1–10?', '🛡 blocked off some time for u. protect it.', 'ur bulletin just dropped. see how ur week went.'].map((m) => (
          <div key={m} className="bg-surface/30 rounded-md p-3 text-text text-sm">{m}</div>
        ))}
      </div>
      <button onClick={() => void approve()} className="w-full bg-accent text-white font-semibold rounded-[14px] py-3.5 lowercase">
        yeah, notify me
      </button>
      <button onClick={onNext} className="text-muted text-xs lowercase">not right now</button>
    </div>
  );
}

function UnlockStep({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ids = [250, 500, 750, 1500].map((d, i) =>
      window.setTimeout(() => (i < 3 ? setCount(i + 1) : onComplete()), d),
    );
    return () => ids.forEach(window.clearTimeout);
  }, [onComplete]);
  return (
    <div className="text-center space-y-6 py-12">
      <div className="text-2xl font-extrabold lowercase">ur set up. let's get it.</div>
      <div className="flex justify-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full bg-accent transition-all ${
              i < count ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
