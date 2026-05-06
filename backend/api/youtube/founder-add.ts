import type { WhitelistedVideo } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { isFounder } from '../../lib/founder-auth';

export const config = { runtime: 'edge' };

/**
 * POST /api/youtube/founder-add
 * Body: { uid (founder), id, module, title, founderNote?, durationSec? }
 *
 * Founder-only. Adds a whitelisted YouTube video. The id IS the YouTube
 * video id — never a URL, never an external playlist. This is the only
 * mechanism to expand what users can watch in-app.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<Partial<WhitelistedVideo> & { uid: string }>(req);
  if (!isFounder(body?.uid)) return error(403, 'forbidden');
  if (!body?.id || !body?.module || !body?.title) {
    return error(400, 'id, module, title required');
  }
  // Reject URLs / playlists — id only.
  if (!/^[A-Za-z0-9_-]{8,16}$/.test(body.id)) {
    return error(400, 'id must be a YouTube video id, not a URL');
  }
  const doc: WhitelistedVideo = {
    id: body.id,
    module: body.module,
    title: body.title,
    founderNote: body.founderNote ?? undefined,
    durationSec: body.durationSec,
    addedAt: Date.now(),
  };
  await db().collection('youtubeWhitelist').doc(body.id).set(doc);
  return json(doc);
}
