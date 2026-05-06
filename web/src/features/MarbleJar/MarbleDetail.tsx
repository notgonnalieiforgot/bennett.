import type { Marble, MarbleKind } from '@bennett/shared';

interface Props {
  marble: Marble;
  onClose: () => void;
}

const LABEL: Record<MarbleKind, string> = {
  clear:   'marble',
  gold:    'gold · 7-day streak',
  diamond: 'diamond · 30-day streak',
  ghost:   'ghost · missed day',
};

const HEADLINE: Record<MarbleKind, string> = {
  clear:   'u showed up that day',
  gold:    '7 days locked in',
  diamond: '30 days. legend tier.',
  ghost:   "this could've been ur marble",
};

const BADGE_BG: Record<MarbleKind, string> = {
  clear:   'bg-text/85 text-black',
  gold:    'bg-[#FFCF21] text-black',
  diamond: 'bg-[#9EEBFF] text-black',
  ghost:   'bg-muted text-black',
};

export function MarbleDetail({ marble, onClose }: Props) {
  const date = new Date(`${marble.date}T00:00:00`);
  const formatted = isNaN(date.getTime())
    ? marble.date
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).toLowerCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg text-text rounded-bn border border-border/30 p-7 max-w-sm w-[90%] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full ${BADGE_BG[marble.kind]}`}
        >
          {LABEL[marble.kind]}
        </span>
        <div className="text-muted text-sm lowercase">{formatted}</div>
        <div className="text-xl font-bold lowercase text-center">
          {HEADLINE[marble.kind]}
        </div>
        {marble.moduleCompleted && (
          <div className="text-muted text-xs lowercase">
            module: {marble.moduleCompleted}
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-accent text-white font-semibold lowercase rounded-[12px] px-6 py-2.5 mt-2"
        >
          close
        </button>
      </div>
    </div>
  );
}
