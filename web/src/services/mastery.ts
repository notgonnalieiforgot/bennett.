import type {
  MasterySector,
  OTFQuiz,
  PSMQuiz,
  PSMResult,
  SectorProgress,
} from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function generateOTF(opts: {
  uid: string;
  topic: string;
  sector: MasterySector;
  context: string;
}): Promise<OTFQuiz> {
  const res = await fetch(`${BASE}/api/mastery/otf-generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`otf-generate ${res.status}`);
  return (await res.json()) as OTFQuiz;
}

export async function submitOTF(opts: {
  uid: string;
  quizId: string;
  topic: string;
  sector: MasterySector;
  score: number;
}): Promise<void> {
  await fetch(`${BASE}/api/mastery/otf-submit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
}

export interface PSMFetchResponse {
  unlocked: boolean;
  reason?: string;
  otfPassed?: number;
  otfRequired?: number;
  lockoutUntil?: number;
  quiz?: PSMQuiz;
}

export async function fetchPSM(opts: {
  uid: string;
  sector: MasterySector;
}): Promise<PSMFetchResponse> {
  const url = `${BASE}/api/mastery/psm-fetch?uid=${encodeURIComponent(opts.uid)}&sector=${encodeURIComponent(opts.sector)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`psm-fetch ${res.status}`);
  return (await res.json()) as PSMFetchResponse;
}

export async function submitPSM(opts: {
  uid: string;
  sector: MasterySector;
  score: number;
  userName: string;
  energyPulse?: number;
}): Promise<{ result: PSMResult; realTalkMessage: string | null }> {
  const res = await fetch(`${BASE}/api/mastery/psm-submit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`psm-submit ${res.status}`);
  return (await res.json()) as { result: PSMResult; realTalkMessage: string | null };
}

export async function loadSectorProgress(uid: string): Promise<SectorProgress[]> {
  const res = await fetch(`${BASE}/api/mastery/sector-progress?uid=${encodeURIComponent(uid)}`);
  if (!res.ok) throw new Error(`sector-progress ${res.status}`);
  const json = (await res.json()) as { progress: SectorProgress[] };
  return json.progress;
}
