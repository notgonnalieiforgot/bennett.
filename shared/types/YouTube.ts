import type { KnowledgeModule } from './UserRecord';

/**
 * Phase 6.6 — YouTube whitelist.
 *
 * Per spec §9b: "Whitelist-only video delivery within Knowledge Modules.
 * No recommendations. Only pre-approved educational video IDs are playable."
 *
 * The Founder curates `WhitelistedVideo` entries per module. Embed
 * parameters (rel=0, modestbranding=1, playsinline=1) suppress
 * recommendations and YouTube branding.
 */

export interface WhitelistedVideo {
  id: string;            // YouTube video id (NOT a URL)
  module: KnowledgeModule | 'general';
  title: string;
  /** Optional Founder annotation surfaced under the player. */
  founderNote?: string;
  /** Duration in seconds — used for module-progress credit. */
  durationSec?: number;
  addedAt: number;
}

/** Embed URL with safety parameters baked in. */
export function buildEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    rel: '0',                  // no related-videos panel
    modestbranding: '1',       // hide YouTube logo on the controls
    playsinline: '1',          // iOS inline play (don't take over screen)
    iv_load_policy: '3',       // hide annotations / cards
    fs: '1',                   // allow user-initiated fullscreen
    cc_load_policy: '0',
    disablekb: '0',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}
