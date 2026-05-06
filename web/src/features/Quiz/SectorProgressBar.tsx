import type { MasterySector, SectorProgress } from '@bennett/shared';
import { SECTOR_LABELS } from '@bennett/shared';
import { useLockout } from '../../hooks/useLockout';

interface Props {
  progress: SectorProgress;
  onTakeBarExam?: (sector: MasterySector) => void;
}

export function SectorProgressBar({ progress, onTakeBarExam }: Props) {
  const lockout = useLockout(progress.lockoutUntil);
  const pct = Math.min(progress.otfPassed / Math.max(1, progress.otfRequired), 1);

  return (
    <div className="rounded-[10px] bg-surface/30 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-text text-sm font-semibold">{SECTOR_LABELS[progress.sector]}</span>
          {progress.psmPassed && <span className="text-accent text-xs">✓</span>}
        </div>
        {lockout.locked ? (
          <span className="text-[10px] font-medium text-red-400">locked · {lockout.remaining}</span>
        ) : progress.psmUnlocked ? (
          <button
            onClick={() => onTakeBarExam?.(progress.sector)}
            className="text-[11px] font-semibold text-accent"
          >
            bar exam →
          </button>
        ) : (
          <span className="text-[10px] font-medium text-muted">
            {progress.otfPassed}/{progress.otfRequired} otf
          </span>
        )}
      </div>
      <div className="h-1 bg-border/30 rounded-full overflow-hidden">
        <div
          className={`h-full transition-[width] duration-300 ${
            progress.psmPassed ? 'bg-accent' : 'bg-muted/60'
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
