import type {
  MarketInsight,
  MarketInsightAuditEntry,
  MarketInsightState,
} from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { isFounder } from '../../lib/founder-auth';

export const config = { runtime: 'edge' };

interface Body extends Partial<Omit<MarketInsight, 'id'>> {
  id?: string;
  uid: string;        // founder uid
  state: MarketInsightState;
}

/**
 * POST /api/market-insights/founder-upsert
 * Founder-only. Create or update an insight, with state transitions
 * (draft → review → published) recorded in an audit-log subcollection.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<Body>(req);
  if (!body?.uid || !isFounder(body.uid)) return error(403, 'forbidden');
  if (!body.state) return error(400, 'state required');

  const now = Date.now();
  const col = db().collection('marketInsights');
  const isNew = !body.id;
  const ref = body.id ? col.doc(body.id) : col.doc();

  const prevSnap = await ref.get();
  const prevState = (prevSnap.data()?.state ?? null) as MarketInsightState | null;

  const insight: MarketInsight = {
    id: ref.id,
    domain: body.domain ?? 'stocks',
    title: body.title ?? '',
    summary: body.summary ?? '',
    body: body.body ?? '',
    founderFilter: body.founderFilter ?? null,
    state: body.state,
    publishedAt:
      body.state === 'published'
        ? (prevSnap.data()?.publishedAt ?? now)
        : null,
    createdAt: prevSnap.data()?.createdAt ?? now,
    updatedAt: now,
  };
  await ref.set(insight, { merge: true });

  if (isNew || prevState !== insight.state) {
    const audit: MarketInsightAuditEntry = {
      ts: now,
      uid: body.uid,
      fromState: prevState,
      toState: insight.state,
    };
    await ref.collection('auditLog').doc(String(now)).set(audit);
  }
  return json(insight);
}
