import { useEffect, useState } from 'react';
import type { KnowledgeModule, WhitelistedVideo } from '@bennett/shared';
import { buildEmbedUrl } from '@bennett/shared';
import { fetchWhitelist } from '../../services/youtube';

interface Props {
  module: KnowledgeModule;
}

/**
 * Phase 6.6 — embedded YouTube player using youtube-nocookie.com + the
 * spec's anti-recommendation parameters. Whitelisted IDs only.
 */
export function ModuleVideos({ module }: Props) {
  const [videos, setVideos] = useState<WhitelistedVideo[]>([]);
  const [active, setActive] = useState<WhitelistedVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWhitelist(module)
      .then((vs) => {
        setVideos(vs);
        setActive(vs[0] ?? null);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [module]);

  if (loading) {
    return <div className="text-muted text-xs lowercase">loading videos…</div>;
  }
  if (videos.length === 0) {
    return (
      <div className="text-muted text-xs lowercase">
        no videos in this module yet. founder adds them via the console.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {active && (
        <div className="aspect-video rounded-bn overflow-hidden bg-black">
          <iframe
            key={active.id}
            src={buildEmbedUrl(active.id)}
            title={active.title}
            className="w-full h-full"
            // Recommendation suppression is enforced server-side via embed URL params.
            // sandbox is intentionally NOT applied — YouTube embeds need access to
            // their own CDN/cookies. youtube-nocookie.com handles privacy.
            allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      )}
      {active?.founderNote && (
        <div className="text-accent text-xs lowercase">
          founder's note: {active.founderNote}
        </div>
      )}
      <div className="space-y-1">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className={`w-full text-left rounded-md p-2.5 text-sm ${
              active?.id === v.id
                ? 'bg-accent/15 text-text border border-accent/40'
                : 'bg-surface/30 text-muted border border-border/30 hover:border-accent/30'
            }`}
          >
            {v.title}
          </button>
        ))}
      </div>
    </section>
  );
}
