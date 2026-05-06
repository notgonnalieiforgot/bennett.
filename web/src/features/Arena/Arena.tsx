import { useEffect, useState } from 'react';
import type { ArenaEntry, KnowledgeModule } from '@bennett/shared';
import { observeGlobalArena, observeSectorArena } from '../../services/arena';

type Layer = { kind: 'global' } | { kind: 'sector'; module: KnowledgeModule };

const MODULES: KnowledgeModule[] = ['fitness', 'real_estate', 'investing', 'ai_tech', 'cooking'];

export function Arena() {
  const [layer, setLayer] = useState<Layer>({ kind: 'global' });
  const [entries, setEntries] = useState<ArenaEntry[]>([]);

  useEffect(() => {
    if (layer.kind === 'global') {
      return observeGlobalArena(setEntries);
    }
    return observeSectorArena(layer.module, setEntries);
  }, [layer]);

  return (
    <section className="max-w-2xl mx-auto p-5 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold lowercase">the arena</h1>
        <p className="text-muted text-sm lowercase">
          {layer.kind === 'global'
            ? 'global discipline velocity. username only.'
            : "specialized sector. who's putting the work in."}
        </p>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Pill label="global" on={layer.kind === 'global'} onClick={() => setLayer({ kind: 'global' })} />
        {MODULES.map((m) => (
          <Pill
            key={m}
            label={m.replace('_', ' ')}
            on={layer.kind === 'sector' && layer.module === m}
            onClick={() => setLayer({ kind: 'sector', module: m })}
          />
        ))}
      </div>
      <div className="space-y-1">
        {entries.length === 0 ? (
          <div className="text-muted text-xs lowercase p-4 text-center">
            nobody's on the board yet.
          </div>
        ) : (
          entries.map((e, i) => <Row key={e.uid} rank={i + 1} entry={e} />)
        )}
      </div>
    </section>
  );
}

function Pill({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold lowercase whitespace-nowrap ${
        on ? 'bg-accent text-white' : 'bg-surface/30 text-muted'
      }`}
    >
      {label}
    </button>
  );
}

function Row({ rank, entry }: { rank: number; entry: ArenaEntry }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-[10px] bg-surface/30">
      <span
        className={`font-mono font-bold w-7 text-sm ${
          rank <= 3 ? 'text-accent' : 'text-muted'
        }`}
      >
        {rank}
      </span>
      <span className="font-semibold text-text">@{entry.username}</span>
      {entry.module && (
        <span className="text-[11px] text-muted">{entry.module.replace('_', ' ')}</span>
      )}
      <span className="flex-1" />
      {entry.masteryBadges.map((b) => (
        <span key={b} className="text-accent text-xs" title={b}>
          ✓
        </span>
      ))}
      <span className="font-mono font-bold text-sm">{Math.floor(entry.disciplineVelocity)}</span>
    </div>
  );
}
