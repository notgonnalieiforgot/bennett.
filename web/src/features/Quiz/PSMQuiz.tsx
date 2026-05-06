import { useState } from 'react';
import type { PSMQuiz as PSMQuizType } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { submitPSM } from '../../services/mastery';
import { useQuizEngine } from './QuizEngine';
import { PulseOnKey, ShakeOnKey } from './QuizEffects';
import { CertificateOfMastery } from './CertificateOfMastery';

interface Props {
  quiz: PSMQuizType;
  onComplete: () => void;
}

export function PSMQuiz({ quiz, onComplete }: Props) {
  const user = useUserStore((s) => s.user);
  const engine = useQuizEngine({ questions: quiz.questions, passThreshold: quiz.passThreshold });
  const [submitted, setSubmitted] = useState(false);
  const [realTalk, setRealTalk] = useState<string | null>(null);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [showCert, setShowCert] = useState(false);

  function pick(i: number) {
    engine.answer(i);
    window.setTimeout(() => engine.advance(), 350);
  }

  if (engine.phase === 'finished' && user?.uid && !submitted) {
    setSubmitted(true);
    void submitPSM({
      uid: user.uid,
      sector: quiz.sector,
      score: engine.score,
      userName: user.username ?? 'u',
      energyPulse: user.energyPulseToday,
    }).then((res) => {
      setRealTalk(res.realTalkMessage);
      setLockoutUntil(res.result.lockoutUntil ?? null);
      if (res.result.passed) {
        window.setTimeout(() => setShowCert(true), 250);
      }
    });
  }

  if (showCert) {
    return (
      <CertificateOfMastery
        sector={quiz.sector}
        score={engine.score}
        onClose={onComplete}
      />
    );
  }

  if (engine.phase === 'finished') {
    return (
      <div className="fixed inset-0 z-[80] bg-bg/95 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-bg border border-border/30 rounded-bn p-6 space-y-3 text-center">
          <div className={`text-5xl font-extrabold ${engine.passed ? 'text-accent' : 'text-muted'}`}>
            {Math.round(engine.score * 100)}%
          </div>
          {engine.passed ? (
            <div className="text-muted text-sm lowercase">submitting…</div>
          ) : (
            <>
              <div className="text-text text-base font-semibold lowercase">
                not quite. lockout: 24h.
              </div>
              {realTalk && (
                <div className="rounded-[10px] bg-red-700/85 text-white text-sm font-medium p-3">
                  {realTalk}
                </div>
              )}
              {lockoutUntil && (
                <div className="text-[11px] text-muted">
                  unlocks: {fmtRemaining(lockoutUntil)}
                </div>
              )}
              <button
                onClick={onComplete}
                className="w-full bg-accent text-white font-semibold lowercase rounded-[12px] py-3"
              >
                close
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const q = engine.current;
  if (!q) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-bg/95 overflow-y-auto p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-bg border border-border/30 rounded-bn p-6 space-y-4">
        <header className="text-center space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            the bar exam · {quiz.sector.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-muted">
            question {engine.index + 1} / {quiz.questions.length}
          </div>
        </header>
        <PulseOnKey trigger={engine.pulseKey}>
          <ShakeOnKey trigger={engine.shakeKey}>
            <div className="text-text font-semibold text-base">{q.prompt}</div>
          </ShakeOnKey>
        </PulseOnKey>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className="w-full text-left rounded-[12px] bg-surface/30 border border-border/30 p-3 text-sm hover:border-accent/50 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmtRemaining(until: number): string {
  const ms = Math.max(0, until - Date.now());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}
