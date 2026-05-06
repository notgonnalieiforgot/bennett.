import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import type { ArenaEntry, ArenaSnapshot, KnowledgeModule } from '@bennett/shared';
import { firestore } from './firebase';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function loadGlobalArena(limitN = 50): Promise<ArenaSnapshot> {
  const res = await fetch(`${BASE}/api/arena/global?limit=${limitN}`);
  if (!res.ok) throw new Error(`global ${res.status}`);
  return (await res.json()) as ArenaSnapshot;
}

export async function loadSectorArena(
  moduleId: KnowledgeModule,
  limitN = 50,
): Promise<ArenaSnapshot> {
  const res = await fetch(
    `${BASE}/api/arena/sector?module=${encodeURIComponent(moduleId)}&limit=${limitN}`,
  );
  if (!res.ok) throw new Error(`sector ${res.status}`);
  return (await res.json()) as ArenaSnapshot;
}

/** Real-time global leaderboard via Firestore. Returns unsubscribe fn. */
export function observeGlobalArena(
  handler: (entries: ArenaEntry[]) => void,
  limitN = 50,
): () => void {
  const q = query(
    collection(doc(firestore(), 'arena', 'global'), 'entries'),
    orderBy('disciplineVelocity', 'desc'),
    limit(limitN),
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => {
      const e = d.data() as ArenaEntry;
      return { ...e, module: undefined };  // Global hides module per spec
    });
    handler(entries);
  });
}

export function observeSectorArena(
  moduleId: KnowledgeModule,
  handler: (entries: ArenaEntry[]) => void,
  limitN = 50,
): () => void {
  const q = query(
    collection(doc(firestore(), 'arena', 'sector'), moduleId),
    orderBy('disciplineVelocity', 'desc'),
    limit(limitN),
  );
  return onSnapshot(q, (snap) => {
    handler(snap.docs.map((d) => d.data() as ArenaEntry));
  });
}
