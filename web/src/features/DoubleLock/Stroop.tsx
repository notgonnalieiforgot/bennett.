import { useRef } from 'react';
import type { StroopColor } from '@bennett/shared';
import { useDoubleLock } from './state';
import { answer, isComplete, progress, colorHex } from './stroop';
import { pulse } from './feedback';

interface Props {
  onComplete: () => void;
}

export function Stroop({ onComplete }: Props) {
  const game = useDoubleLock((s) => s.stroop);
  const setStroop = useDoubleLock((s) => s.setStroop);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const cur = game.questions[game.index];
  if (!cur) return null;

  function handle(choice: StroopColor) {
    const res = answer(game, choice);
    setStroop(res.game);
    if (res.correct) {
      pulse(cardRef.current, 'success');
      if (isComplete(res.game)) onComplete();
    } else {
      pulse(cardRef.current, 'failure');
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      <div className="flex flex-col items-center gap-1">
        <div className="text-muted text-xs uppercase tracking-wider">step 2 of 3</div>
        <div className="text-text text-base font-semibold lowercase">
          tap the ink color, not the word
        </div>
      </div>
      <div
        ref={cardRef}
        className="w-full rounded-bn bg-surface/10 border border-border/20 py-12 flex items-center justify-center"
      >
        <span
          className="text-6xl font-extrabold uppercase tracking-tight"
          style={{ color: colorHex(cur.inkColor) }}
        >
          {cur.word}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {cur.options.map((c) => (
          <button
            key={c}
            onClick={() => handle(c)}
            className="rounded-[14px] py-4 px-3 bg-surface/10 border border-border/20 text-text font-semibold lowercase transition-transform active:scale-[0.97]"
          >
            {c}
          </button>
        ))}
      </div>
      <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${progress(game) * 100}%` }}
        />
      </div>
    </div>
  );
}
