import type { MasterySector, PSMQuiz } from '@bennett/shared';
import { PSM_UNLOCK_THRESHOLD, PSM_PASS_THRESHOLD, sectorLocked } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';
import vault from '../../data/mastery-vault.json';

export const config = { runtime: 'edge' };

interface VaultSector {
  sector: MasterySector;
  passThreshold: number;
  questions: PSMQuiz['questions'];
}

/**
 * GET /api/mastery/psm-fetch?uid=...&sector=...
 *
 * Gates PSM access on:
 *  - sector unlock (≥5 successful OTF rounds, per spec §1 Tier 2 unlock)
 *  - active 24h lockout from a prior failure
 *
 * Returns a shuffled subset of the Founder-vetted vault on success.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  const sector = url.searchParams.get('sector') as MasterySector | null;
  if (!uid || !sector) return error(400, 'uid + sector required');

  const userRef = db().collection('users').doc(uid);
  const progressSnap = await userRef.collection('sectorProgress').doc(sector).get();
  const progress = progressSnap.exists ? progressSnap.data() : {};
  const otfPassed = (progress?.otfPassed as number | undefined) ?? 0;
  const lockoutUntil = (progress?.lockoutUntil as number | undefined) ?? null;

  if (otfPassed < PSM_UNLOCK_THRESHOLD) {
    return json({
      unlocked: false,
      reason: 'otf_threshold_not_met',
      otfPassed,
      otfRequired: PSM_UNLOCK_THRESHOLD,
    });
  }
  if (sectorLocked(lockoutUntil)) {
    return json({
      unlocked: false,
      reason: 'lockout_active',
      lockoutUntil,
    });
  }

  const sectorVault = (vault as Record<string, VaultSector>)[sector];
  if (!sectorVault) return error(404, `no vault for sector ${sector}`);

  const quiz: PSMQuiz = {
    sector,
    questions: shuffle(sectorVault.questions).slice(0, 10),
    passThreshold: sectorVault.passThreshold ?? PSM_PASS_THRESHOLD,
  };
  return json({ unlocked: true, quiz });
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
