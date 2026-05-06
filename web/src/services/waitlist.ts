import type { DiagnosticAnswer, DoerDossier, FounderDecision, WaitlistApplication } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function submitWaitlist(opts: {
  email: string;
  answers: DiagnosticAnswer[];
}): Promise<{ applicationId: string }> {
  const res = await fetch(`${BASE}/api/waitlist/submit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`submit ${res.status}`);
  return (await res.json()) as { applicationId: string };
}

export interface FounderApplicationItem {
  application: WaitlistApplication;
  dossier: DoerDossier | null;
  decision: FounderDecision | null;
}

export async function listForFounder(opts: {
  uid: string;
  filter?: 'undecided' | 'approved' | 'rejected' | 'flagged';
}): Promise<FounderApplicationItem[]> {
  const url = new URL(`${BASE}/api/waitlist/founder-list`, window.location.origin);
  url.searchParams.set('uid', opts.uid);
  if (opts.filter) url.searchParams.set('filter', opts.filter);
  const res = await fetch(url.toString().replace(window.location.origin, BASE || ''));
  if (!res.ok) throw new Error(`founder-list ${res.status}`);
  const json = (await res.json()) as { applications: FounderApplicationItem[] };
  return json.applications;
}

export async function decideFounder(opts: {
  uid: string;
  applicationId: string;
  decision: 'approved' | 'rejected';
}): Promise<FounderDecision> {
  const res = await fetch(`${BASE}/api/waitlist/founder-decide`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`decide ${res.status}`);
  return (await res.json()) as FounderDecision;
}
