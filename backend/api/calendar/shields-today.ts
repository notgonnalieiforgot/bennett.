import {
  SHIELD_DESCRIPTION,
  SHIELD_MIN_ENERGY,
  SHIELD_TITLE,
  type Shield,
  type ShieldsTodayResponse,
} from '@bennett/shared';
import { error, json, readJson } from '../../lib/http';
import { db } from '../../lib/firebase-admin';
import { insertEvent, listEvents, loadTokens } from '../../lib/google-calendar';
import { findFreeBlocks, pickShieldBlock } from '../../lib/shield-engine';

export const config = { runtime: 'edge' };

interface Body {
  uid: string;
  energyPulse: number;
  /** IANA timezone id; defaults to UTC */
  tz?: string;
}

/**
 * POST /api/calendar/shields-today
 * Reads today's Calendar events, finds free blocks, and (if Energy Pulse
 * ≥6) auto-creates a Shield event for the next free block. Idempotent —
 * if today already has an active Shield, returns it without creating a new
 * one. Per spec §5c.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<Body>(req);
  if (!body?.uid || typeof body.energyPulse !== 'number') {
    return error(400, 'uid and energyPulse required');
  }

  const tokens = await loadTokens(body.uid);
  if (!tokens) {
    const out: ShieldsTodayResponse = { connected: false, shields: [] };
    return json(out);
  }

  const now = new Date();
  const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(now); dayEnd.setHours(23, 59, 59, 999);

  const events = await listEvents({ uid: body.uid, timeMin: dayStart, timeMax: dayEnd });
  const dateKey = dayStart.toISOString().slice(0, 10);

  const shieldsCol = db()
    .collection('users')
    .doc(body.uid)
    .collection('shields');

  const todays = await shieldsCol
    .where('date', '==', dateKey)
    .where('state', '==', 'active')
    .get();
  const existing: Shield[] = todays.docs.map((d) => d.data() as Shield);
  if (existing.length > 0) {
    const free = findFreeBlocks({ events, now, tz: body.tz });
    return json<ShieldsTodayResponse>({ connected: true, shields: existing, freeBlocks: free });
  }

  const free = findFreeBlocks({ events, now, tz: body.tz });

  if (body.energyPulse < SHIELD_MIN_ENERGY) {
    return json<ShieldsTodayResponse>({ connected: true, shields: [], freeBlocks: free });
  }

  const block = pickShieldBlock(free);
  if (!block) {
    return json<ShieldsTodayResponse>({ connected: true, shields: [], freeBlocks: free });
  }

  const created = await insertEvent({
    uid: body.uid,
    summary: SHIELD_TITLE,
    description: SHIELD_DESCRIPTION,
    start: new Date(block.start),
    end:   new Date(block.end),
  });

  const shield: Shield = {
    id: created.id,
    uid: body.uid,
    date: dateKey,
    start: block.start,
    end:   block.end,
    state: 'active',
    calendarEventId: created.id,
    createdAt: Date.now(),
  };
  await shieldsCol.doc(shield.id).set(shield);

  return json<ShieldsTodayResponse>({
    connected: true,
    shields: [shield],
    freeBlocks: free,
  });
}
