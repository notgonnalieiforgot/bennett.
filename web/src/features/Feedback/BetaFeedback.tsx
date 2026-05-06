import { useState } from 'react';
import type { BetaFeedback as Feedback } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { submitFeedback } from '../../services/feedback';
import { detectCrisis } from '../../services/crisis';
import { CrisisIntercept } from '../Crisis';

interface Props {
  open: boolean;
  trigger: Feedback['trigger'];
  onClose: () => void;
}

/**
 * Phase 5e — in-app casual feedback prompt. AI Friend voice. Per spec the
 * prompt fires after a Double-Lock complete or after a marble animation.
 * The user can dismiss without typing — this is low-stress data collection.
 */
export function BetaFeedback({ open, trigger, onClose }: Props) {
  const user = useUserStore((s) => s.user);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [crisisPatterns, setCrisisPatterns] = useState<string[] | null>(null);

  if (!open) return null;
  if (crisisPatterns) {
    return (
      <CrisisIntercept
        surface="beta_feedback"
        matchedPatterns={crisisPatterns}
        onDismiss={() => {
          setCrisisPatterns(null);
          setText('');
          onClose();
        }}
      />
    );
  }

  async function send() {
    if (!user?.uid || !text.trim()) {
      onClose();
      return;
    }
    // Client-side crisis intercept fires BEFORE the network round-trip.
    // The server has its own guard — this is the immediate-UX layer.
    const c = detectCrisis(text);
    if (c.matched) {
      setCrisisPatterns(c.matchedPatterns);
      return;
    }
    setSending(true);
    try {
      await submitFeedback({ uid: user.uid, text, trigger });
    } catch {
      // Soft-fail — we don't want to punish the user for trying to help.
    } finally {
      setSending(false);
      setText('');
      onClose();
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 flex justify-center">
      <div className="bg-bg border border-border/40 rounded-bn p-4 w-full max-w-md space-y-3 shadow-bn">
        <div className="space-y-1">
          <div className="text-text font-semibold lowercase">quick one —</div>
          <div className="text-muted text-sm lowercase">
            anything feel off or clunky in the app?
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="optional. anything counts."
          className="w-full bg-surface/30 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
        <div className="flex gap-2 justify-end text-xs">
          <button onClick={onClose} className="text-muted lowercase">
            skip
          </button>
          <button
            onClick={() => void send()}
            disabled={sending}
            className="bg-accent text-white font-semibold lowercase rounded-md px-4 py-2 disabled:opacity-60"
          >
            {sending ? 'sending…' : 'send it'}
          </button>
        </div>
      </div>
    </div>
  );
}
