import type { PersonaContext, PersonaResponse } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return (await res.json()) as TRes;
}

async function get<TRes>(path: string): Promise<TRes> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return (await res.json()) as TRes;
}

export const api = {
  persona: (ctx: PersonaContext) => post<PersonaContext, PersonaResponse>('/api/persona', ctx),
  usernameCheck: (q: string) =>
    get<{ available: boolean; reason?: string }>(
      `/api/username-check?q=${encodeURIComponent(q)}`,
    ),
  health: () => get<{ ok: boolean }>('/api/health'),
};
