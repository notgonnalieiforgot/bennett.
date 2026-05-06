import type { MasterySector, OTFResult } from '@bennett/shared';
import { passedScore } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/mastery/otf-submit
 * Body: { uid, quizId, topic, sector, score }
 *
 * Persists OTF result, increments sector OTF count if passed, grants a
 * Training Marble (visual-only — does NOT affect Scholarship Mode refund
 * eligibility per spec).
 *
 * Founder-visibility note: only Pass/Fail + Sector are mirrored to a
 * separate `founderQuizSummaries` collection (Zero-Knowledge intent —
 * the Founder doesn't see raw answers). Phase 6 will lock this with
 * Firestore rules + on-device CryptoKit per spec §9a.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    quizId: string;
    topic: string;
    sector: MasterySector;
    score: number;
  }>(req);
  if (!body?.uid || !body?.quizId || !body?.sector || typeof body.score !== 'number') {
    return error(400, 'uid, quizId, sector, score required');
  }
  const passed = passedScore(body.score);

  const userRef = db().collection('users').doc(body.uid);
  const resultRef = userRef.collection('quizResults').doc(body.quizId);
  const result: OTFResult = {
    quizId: body.quizId,
    uid: body.uid,
    topic: body.topic,
    sector: body.sector,
    score: body.score,
    passed,
    completedAt: Date.now(),
  };

  if (passed) {
    // Training Marble — kind: 'training', non-refund-qualifying.
    const marbleId = `otf-${body.quizId}`;
    await userRef.collection('marbles').doc(marbleId).set({
      kind: 'training',
      earnedAt: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      moduleCompleted: body.topic,
    });
    result.trainingMarbleId = marbleId;

    // Bump SectorProgress.otfPassed.
    await userRef.collection('sectorProgress').doc(body.sector).set(
      {
        sector: body.sector,
        otfPassed: increment(1),
        sectorXp: increment(10),
        lastUpdatedAt: Date.now(),
      },
      { merge: true },
    );
  }

  await resultRef.set(result);
  // Founder summary — pass/fail + sector only.
  await db().collection('founderQuizSummaries').doc(body.quizId).set({
    uid: body.uid,
    sector: body.sector,
    tier: 'otf',
    passed,
    at: Date.now(),
  });

  return json(result);
}

/** Tiny shim for Firestore admin's FieldValue.increment without importing the type. */
function increment(n: number) {
  // Firestore admin SDK on Edge: FieldValue is on the firebase-admin/firestore module.
  // Re-imported here to avoid a circular import in the Edge bundle.
  // Using a lazy require keeps the import idiomatic.
  const { FieldValue } = require('firebase-admin/firestore') as typeof import('firebase-admin/firestore');
  return FieldValue.increment(n);
}
