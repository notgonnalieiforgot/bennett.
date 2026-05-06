import { useState } from 'react';
import type { OTFQuiz as OTFQuizType } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { submitOTF } from '../../services/mastery';
import { useQuizEngine } from './QuizEngine';
import { PulseOnKey, ShakeOnKey } from './QuizEffects';

interface Props {
  quiz: OTFQuizType;
  onComplete: (score: number, passed: boolean) => void;
}

export function OTFQuiz({ quiz, onComplete }: Props) {
  const user = useUserStore((s) => s.user);
  const engine = useQuizEngine({ questions: quiz.questions, passThreshold: 0.8 });
  const [submitted, setSubmitted] = useState(false);

  function pick(i: number) {
    engine.answer(i);
    window.setTimeout(() => engine.advance(), 350);
  }

  if (engine.phase === 'finished') {
    if (user?.uid && !submitted) {
      setSubmitted(true);
      void submitOTF({
        uid: user.uid,
        quizId: quiz.id,
        topic: quiz.topic,
        sector: quiz.sector,
        score: engine.score,
      });
    }
    return (
      <div className="fixed inset-0 z-[80] bg-bg/95 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-bg border border-border/30 rounded-bn p-6 space-y-3 text-center">
          <div className="text-2xl font-extrabold lowercase">
            {engine.passed ? 'training marble earned.' : 'not quite. run it back.'}
          </div>
          <div className={`text-5xl font-extrabold ${engine.passed ? 'text-accent' : 'text-muted'}`}>
            {Math.round(engine.score * 100)}%
          </div>
          <div className="text-muted text-sm lowercase">
            {engine.passed
              ? 'sector progress bumped. keep stacking.'
              : 'review the breakdown, take it again.'}
          </div>
          <button
            onClick={() => onComplete(engine.score, engine.passed)}
            className="w-full bg-accent text-white font-semibold lowercase rounded-[12px] py-3"
          >
            close
          </button>
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
            otf · {quiz.sector.replace('_', ' ')}
          </div>
          <div className="text-base font-semibold text-text">{quiz.topic}</div>
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
