import type { MasterySector, SectorProgress } from '@bennett/shared';
import { MASTERY_SECTORS, PSM_UNLOCK_THRESHOLD, sectorLocked } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/mastery/sector-progress?uid=...
 * Returns SectorProgress for every sector the user has touched.
 * Sectors with zero activity get default zeros so the UI can render the
 * full row of progress bars without an extra query.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const uid = new URL(req.url).searchParams.get('uid');
  if (!uid) return error(400, 'uid required');

  const snap = await db()
    .collection('users')
    .doc(uid)
    .collection('sectorProgress')
    .get();
  const byId = new Map<MasterySector, FirebaseFirestore.DocumentData>();
  for (const d of snap.docs) byId.set(d.id as MasterySector, d.data());

  const out: SectorProgress[] = MASTERY_SECTORS.map((sector) => {
    const d = byId.get(sector) ?? {};
    const otfPassed = (d.otfPassed as number | undefined) ?? 0;
    const lockoutUntil = (d.lockoutUntil as number | null | undefined) ?? null;
    const psmUnlocked = otfPassed >= PSM_UNLOCK_THRESHOLD && !sectorLocked(lockoutUntil);
    return {
      sector,
      otfPassed,
      otfRequired: PSM_UNLOCK_THRESHOLD,
      psmUnlocked,
      psmPassed: (d.psmPassed as boolean | undefined) ?? false,
      bestPsmScore: (d.bestPsmScore as number | undefined) ?? 0,
      lockoutUntil,
      sectorXp: (d.sectorXp as number | undefined) ?? 0,
    };
  });
  return json({ progress: out });
}
