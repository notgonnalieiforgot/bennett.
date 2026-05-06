import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import type { Marble } from '@bennett/shared';
import { marbleKindForStreakDay } from '@bennett/shared';
import { firestore } from './firebase';

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Per Critical Rule #6 there is intentionally no `delete` here — once a
 * marble (real OR ghost) is in the jar, it stays.
 */
export async function recordMarble(uid: string, marble: Marble): Promise<void> {
  const ref = doc(firestore(), 'users', uid, 'marbles', marble.id);
  await setDoc(
    ref,
    {
      kind: marble.kind,
      earnedAt: marble.earnedAt,
      date: marble.date,
      moduleCompleted: marble.moduleCompleted,
    },
    { merge: true },
  );
}

export async function recordDailyMarble(opts: {
  uid: string;
  streakDay: number;
  moduleCompleted: string | null;
}): Promise<Marble> {
  const date = todayKey();
  const marble: Marble = {
    id: date,
    kind: marbleKindForStreakDay(opts.streakDay),
    earnedAt: Date.now(),
    date,
    moduleCompleted: opts.moduleCompleted,
  };
  await recordMarble(opts.uid, marble);
  return marble;
}

export function observeMarbles(
  uid: string,
  handler: (marbles: Marble[]) => void,
): () => void {
  const q = query(
    collection(firestore(), 'users', uid, 'marbles'),
    orderBy('date'),
  );
  return onSnapshot(q, (snap) => {
    const list: Marble[] = snap.docs
      .map((d) => {
        const data = d.data() as Partial<Marble> & { kind?: string };
        if (!data.kind || !data.date) return null;
        return {
          id: d.id,
          kind: data.kind as Marble['kind'],
          earnedAt: data.earnedAt ?? 0,
          date: data.date,
          moduleCompleted: (data.moduleCompleted as string | null) ?? null,
        } as Marble;
      })
      .filter((m): m is Marble => m !== null);
    handler(list);
  });
}
