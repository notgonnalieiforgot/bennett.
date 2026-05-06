export const config = { runtime: 'edge' };

export default function handler(_req: Request): Response {
  return new Response(
    JSON.stringify({ ok: true, service: 'bennett-backend', ts: Date.now() }),
    { headers: { 'content-type': 'application/json' } },
  );
}
