import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

// PHASE 8 — fetch a user's current/past Bulletin from Firestore.
// The Friday 6pm generation lives in Firebase Scheduled Functions, not here.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  return json({ phase: 'phase-1-stub' });
}
