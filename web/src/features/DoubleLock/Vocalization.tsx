import { useEffect, useRef, useState } from 'react';
import { useDoubleLock } from './state';
import { VOCAL_MAX_MS, VOCAL_MIN_MATCH } from '@bennett/shared';
import { pulse } from './feedback';

interface Props {
  onComplete: () => void;
}

/** Web Speech API recognition is browser-prefixed in some browsers. */
function getSpeechRecognition(): typeof SpeechRecognition | null {
  const w = window as unknown as {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function jaccard(heard: string, target: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean),
    );
  const h = norm(heard);
  const t = norm(target);
  if (t.size === 0) return 0;
  const inter = [...h].filter((w) => t.has(w)).length;
  const union = new Set([...h, ...t]).size;
  return union === 0 ? 0 : inter / union;
}

export function Vocalization({ onComplete }: Props) {
  const phrase = useDoubleLock((s) => s.phrase);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const ctor = getSpeechRecognition();
    if (!ctor) {
      setError('this browser does not support speech recognition. try chrome or edge.');
      return;
    }
    const rec = new ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    let stopped = false;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i]![0]!.transcript + ' ';
      }
      const trimmed = text.trim();
      setTranscript(trimmed);
      const s = jaccard(trimmed, phrase);
      setScore(s);
      if (s >= VOCAL_MIN_MATCH && !stopped) {
        stopped = true;
        pulse(cardRef.current, 'success');
        try { rec.stop(); } catch { /* */ }
        onComplete();
      }
    };
    rec.onerror = (e) => setError((e as { error?: string }).error ?? 'speech error');

    try { rec.start(); } catch (e) { setError((e as Error).message); }

    const timer = window.setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsed(ms);
      if (ms > VOCAL_MAX_MS) window.clearInterval(timer);
    }, 100);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      try { rec.stop(); } catch { /* */ }
    };
  }, [phrase, onComplete]);

  return (
    <div className="flex flex-col items-center gap-5 p-6 max-w-md mx-auto">
      <div className="flex flex-col items-center gap-1">
        <div className="text-muted text-xs uppercase tracking-wider">step 3 of 3</div>
        <div className="text-text text-base font-semibold lowercase">say it out loud</div>
        <div className="text-muted text-xs lowercase">the absurdity is the point</div>
      </div>
      <div
        ref={cardRef}
        className="w-full rounded-bn bg-surface/10 border border-border/20 py-8 px-5 text-center"
      >
        <div className="text-3xl font-bold lowercase">{phrase}</div>
      </div>
      <div className="w-full text-center">
        <div className="text-muted text-sm lowercase min-h-[1.5em]">
          {error ? error : transcript || "i'm listening"}
        </div>
        <div
          className={`text-xs font-medium mt-1 ${
            score >= VOCAL_MIN_MATCH ? 'text-accent' : 'text-muted'
          }`}
        >
          match: {Math.round(score * 100)}%
        </div>
      </div>
      <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-[width] duration-100"
          style={{ width: `${Math.min(elapsed / VOCAL_MAX_MS, 1) * 100}%` }}
        />
      </div>
    </div>
  );
}
