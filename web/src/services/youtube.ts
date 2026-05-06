import type { KnowledgeModule, WhitelistedVideo } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function fetchWhitelist(module?: KnowledgeModule): Promise<WhitelistedVideo[]> {
  const url = module
    ? `${BASE}/api/youtube/whitelist?module=${encodeURIComponent(module)}`
    : `${BASE}/api/youtube/whitelist`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`whitelist ${res.status}`);
  const json = (await res.json()) as { videos: WhitelistedVideo[] };
  return json.videos;
}
