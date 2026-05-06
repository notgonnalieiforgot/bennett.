import type { KnowledgeModule } from '@bennett/shared';
import type { WhitelistedVideo } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';
import staticVault from '../../data/youtube-whitelist.json';

export const config = { runtime: 'edge' };

/**
 * GET /api/youtube/whitelist?module=fitness
 *
 * Returns the Founder-vetted whitelist for the requested module.
 * Source priority:
 *   1. Firestore `youtubeWhitelist/{module}/videos/*` (Founder-edited live)
 *   2. Static `backend/data/youtube-whitelist.json` (compile-time fallback)
 *
 * Per spec §9b: "Whitelist-only — only pre-approved IDs are playable.
 * No recommendations." The client embeds via buildEmbedUrl() which
 * sets rel=0 + modestbranding=1.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const moduleId = new URL(req.url).searchParams.get('module') as KnowledgeModule | null;

  let videos: WhitelistedVideo[] = [];

  // Live Firestore tier — empty by default, populated as Founder adds.
  try {
    let q: FirebaseFirestore.Query = db().collection('youtubeWhitelist');
    if (moduleId) q = q.where('module', '==', moduleId);
    const snap = await q.limit(100).get();
    videos = snap.docs.map((d) => ({ ...(d.data() as WhitelistedVideo), id: d.id }));
  } catch {
    // Soft-fail to static.
  }

  if (videos.length === 0) {
    const fallback = (staticVault as { videos: WhitelistedVideo[] }).videos ?? [];
    videos = moduleId ? fallback.filter((v) => v.module === moduleId) : fallback;
  }

  return json({ videos });
}
