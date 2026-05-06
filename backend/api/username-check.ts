import { db } from '../lib/firebase-admin';
import { error, json } from '../lib/http';

export const config = { runtime: 'edge' };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const BANNED = new Set(['admin', 'bennett', 'staff', 'support', 'founder', 'mod']);

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (!q) return error(400, 'q required');
  if (!USERNAME_RE.test(q)) return json({ available: false, reason: 'format' });
  if (BANNED.has(q.toLowerCase())) return json({ available: false, reason: 'reserved' });
  const snap = await db()
    .collection('users')
    .where('usernameLower', '==', q.toLowerCase())
    .limit(1)
    .get();
  return json({ available: snap.empty });
}
