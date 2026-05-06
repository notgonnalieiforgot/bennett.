import { useState } from 'react';
import type { ModuleContent } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { saveModuleProgress } from '../../services/doerTab';
import { ModuleQuiz } from './ModuleQuiz';

interface Props {
  module: ModuleContent;
  onBack: () => void;
}

interface LocalProgress {
  completedLessons: string[];
  quizPassed: boolean;
  bestQuizScore: number;
  masteryBadgeEarned: boolean;
}

export function ModuleDetail({ module, onBack }: Props) {
  const user = useUserStore((s) => s.user);
  const [prog, setProg] = useState<LocalProgress>({
    completedLessons: [],
    quizPassed: false,
    bestQuizScore: 0,
    masteryBadgeEarned: false,
  });
  const [quizOpen, setQuizOpen] = useState(false);

  function persist(next: LocalProgress) {
    if (!user?.uid) return;
    void saveModuleProgress({
      uid: user.uid,
      moduleId: module.id,
      completedLessons: next.completedLessons,
      quizPassed: next.quizPassed,
      bestQuizScore: next.bestQuizScore,
    });
  }

  function toggle(lessonId: string) {
    setProg((p) => {
      const has = p.completedLessons.includes(lessonId);
      const next: LocalProgress = {
        ...p,
        completedLessons: has
          ? p.completedLessons.filter((id) => id !== lessonId)
          : [...p.completedLessons, lessonId],
      };
      persist(next);
      return next;
    });
  }

  function applyQuiz(score: number, passed: boolean) {
    setProg((p) => {
      const next: LocalProgress = {
        ...p,
        bestQuizScore: Math.max(p.bestQuizScore, score),
        quizPassed: p.quizPassed || passed,
        masteryBadgeEarned: p.masteryBadgeEarned || passed,
      };
      persist(next);
      return next;
    });
    setQuizOpen(false);
  }

  const allDone = prog.completedLessons.length === module.lessons.length;
  const pct = module.lessons.length > 0 ? prog.completedLessons.length / module.lessons.length : 0;

  return (
    <div className="max-w-2xl mx-auto p-5 space-y-4">
      <button onClick={onBack} className="text-muted text-xs lowercase">
        ← back to modules
      </button>
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold">
          {module.emoji} {module.name}
        </h1>
        <p className="text-muted text-sm lowercase">{module.oneLiner}</p>
        {prog.masteryBadgeEarned && (
          <span className="inline-block bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            mastery badge earned
          </span>
        )}
      </header>

      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-muted">
          <span>{prog.completedLessons.length} of {module.lessons.length} lessons</span>
          <span className="text-accent font-semibold">{Math.round(pct * 100)}%</span>
        </div>
        <div className="h-1 bg-border/30 rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-[width] duration-300"
               style={{ width: `${pct * 100}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {module.lessons.map((lesson) => {
          const checked = prog.completedLessons.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => toggle(lesson.id)}
              className="w-full text-left rounded-bn bg-surface/30 border border-border/30 p-4 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className={checked ? 'text-accent' : 'text-muted'}>
                  {checked ? '●' : '○'}
                </span>
                <div className="font-semibold text-text flex-1">{lesson.title}</div>
                <div className="text-muted text-[11px]">{lesson.durationMin} min</div>
              </div>
              <div className="text-muted text-sm whitespace-pre-line">{lesson.body}</div>
            </button>
          );
        })}
      </div>

      <button
        disabled={!allDone}
        onClick={() => allDone && setQuizOpen(true)}
        className={`w-full rounded-[12px] py-3 font-semibold lowercase ${
          allDone ? 'bg-accent text-white' : 'bg-muted/40 text-muted cursor-not-allowed'
        }`}
      >
        {allDone
          ? prog.quizPassed
            ? 'retake quiz'
            : 'take the quiz'
          : 'finish all lessons to unlock quiz'}
      </button>

      {quizOpen && (
        <ModuleQuiz
          module={module}
          onDone={(score, passed) => applyQuiz(score, passed)}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  );
}
