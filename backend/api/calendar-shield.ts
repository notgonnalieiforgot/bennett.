import { error, json } from '../lib/http';

export const config = { runtime: 'edge' };

// PHASE 2 — Dynamic Shielding: Google Calendar OAuth, free-block detection,
// shield event creation, 3-ignore Real Talk escalation.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  return json({ received: true, phase: 'phase-1-stub' });
}
