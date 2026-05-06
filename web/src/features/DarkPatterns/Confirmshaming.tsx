import { useEffect, useRef, useState } from 'react';
import {
  CONFIRMSHAMING_PHRASE,
  isConfirmshamingMatch,
  type ConfirmshamingTrigger,
} from '@bennett/shared';

interface Props {
  open: boolean;
  trigger: ConfirmshamingTrigger;
  onConfirm: () => void;
}

const COPY: Record<ConfirmshamingTrigger, string> = {
  exit_focus_session:    "leaving the focus session means u didn't finish.",
  close_doer_tab_early:  'ur paying for the war room. closing it early is the leak.',
  skip_double_lock:      "the gate is the gate. there's no skip.",
};

/**
 * The friction-exit modal. Per Critical Rule #5: no dismiss/cancel/X.
 * Escape is suppressed at the document level. Click-outside-to-close is
 * NOT supported. The user either types the exact phrase (case-insensitive)
 * and proceeds, or stays.
 */
export function Confirmshaming({ open, trigger, onConfirm }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setText('');
    inputRef.current?.focus();

    // Escape MUST NOT close. Capture-phase listener with preventDefault +
    // stopPropagation so nothing downstream sees the key.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  if (!open) return null;
  const matched = isConfirmshamingMatch(text);

  return (
    <div
      role="dialog"
      aria-modal="true"
      // No onClick handler — clicks outside the inner card do NOT close.
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
    >
      <div className="bg-bg text-text rounded-bn border border-border/40 p-7 max-w-md w-[92%] flex flex-col gap-4">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold lowercase">u sure?</h2>
          <p className="text-muted text-sm lowercase">{COPY[trigger]}</p>
        </div>

        <div className="space-y-1.5">
          <div className="text-muted text-[11px] font-medium lowercase">
            type this exactly to leave:
          </div>
          <div className="font-mono text-sm text-accent bg-surface/40 rounded-md px-3 py-2">
            {CONFIRMSHAMING_PHRASE}
          </div>
        </div>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && matched) {
              onConfirm();
            }
          }}
          className={`bg-surface/30 border rounded-md px-3 py-3 font-mono text-sm outline-none ${
            matched ? 'border-accent' : 'border-border/40'
          }`}
          aria-label="type the exact phrase to leave"
          autoFocus
        />

        <button
          onClick={() => matched && onConfirm()}
          disabled={!matched}
          className={`rounded-[12px] py-3 px-4 font-semibold lowercase ${
            matched
              ? 'bg-accent text-white'
              : 'bg-muted/40 text-muted cursor-not-allowed'
          }`}
        >
          {matched ? 'leave' : 'type the phrase to leave'}
        </button>
      </div>
    </div>
  );
}
