import { useState } from 'react';
import type { ModuleContent } from '@bennett/shared';

interface Props {
  module: ModuleContent;
  onDone: (score: number, passed: boolean) => void;
  onClose: () => void;
}

export function ModuleQuiz({ module, onDone, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(
    () => Array.from({ length: module.quiz.questions.length }, () => null),
  );
  const [showResult, setShowResult] = useState(false);

  const total = module.quiz.questions.length;
  const score = picks.reduce<number>((acc, pick, i) => {
    return pick !== null && pick === module.quiz.questions[i]!.answerIndex ? acc + 1 : acc;
  }, 0) / total;
  const passed = score >= module.quiz.passThreshold;

  function pick(optIdx: number) {
    setPicks((p) => {
      const next = p.slice();
      next[index] = optIdx;
      return next;
    });
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setShowResult(true);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-bg/95 overflow-y-auto p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-bg border border-border/30 rounded-bn p-6 space-y-4">
        {showResult ? (
          <div className="text-center space-y-3">
            <div className="text-2xl font-extrabold">
              {passed ? 'u passed.' : 'not quite. run it back.'}
            </div>
            <div className={`text-5xl font-extrabold ${passed ? 'text-accent' : 'text-muted'}`}>
              {Math.round(score * 100)}%
            </div>
            <div className="text-sm text-muted lowercase">
              {passed
                ? `mastery badge earned. ${module.name.toLowerCase()} is officially in ur kit.`
                : `need ${Math.round(module.quiz.passThreshold * 100)}%. read the lessons again, then retake.`}
            </div>
            <button
              onClick={() => onDone(score, passed)}
              className="w-full bg-accent text-white font-semibold lowercase rounded-[12px] py-3"
            >
              close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-[11px] text-muted">
              <span>question {index + 1} / {total}</span>
              <span>{module.name}</span>
            </div>
            <div className="text-base font-semibold text-text">
              {module.quiz.questions[index]!.prompt}
            </div>
            <div className="space-y-2">
              {module.quiz.questions[index]!.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className="w-full text-left rounded-[12px] bg-surface/30 border border-border/30 p-3 text-sm hover:border-accent/50 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-full text-muted text-xs lowercase">
              exit quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
}
