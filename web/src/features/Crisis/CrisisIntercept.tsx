import { useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { logCrisisEvent, type CrisisSurface } from '../../services/crisis';

interface Props {
  surface: CrisisSurface;
  matchedPatterns: string[];
  onDismiss: () => void;
}

/**
 * Crisis safety panel. Voice is calm + clinical, NOT Bennett lingo.
 * Capital letters allowed. No friction typing — single-tap dismiss.
 * Resources are taps to `tel:` / `sms:` / `https:` URIs.
 */
export function CrisisIntercept({ surface, matchedPatterns, onDismiss }: Props) {
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user?.uid) return;
    void logCrisisEvent({
      uid: user.uid,
      surface,
      matchedPatterns,
      action: 'shown',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, surface]);

  function dismiss() {
    if (user?.uid) {
      void logCrisisEvent({
        uid: user.uid,
        surface,
        matchedPatterns,
        action: 'dismissed',
      });
    }
    onDismiss();
  }

  function open(action: string, resourceId: string) {
    if (user?.uid) {
      void logCrisisEvent({
        uid: user.uid,
        surface,
        matchedPatterns,
        action: `opened_resource:${resourceId}`,
      });
    }
    window.location.assign(action);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-6 overflow-y-auto"
      style={{ background: '#F7F7F7' }}
    >
      <div className="max-w-lg w-full bg-white text-black rounded-[14px] p-7 space-y-5 shadow-xl">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold">You're not alone.</h1>
          <p className="text-base text-black/70">
            Real people are available right now.
          </p>
        </header>

        <p className="text-sm text-black/85 leading-relaxed">
          If you're thinking about hurting yourself or ending your life, please reach out. The lines below are free, confidential, and answered by trained humans 24/7.
        </p>

        <div className="space-y-2.5">
          <Hotline
            title="988 Suicide & Crisis Lifeline"
            detail="Call or text 988. Free, confidential, 24/7."
            onClick={() => open('tel:988', '988_lifeline')}
          />
          <Hotline
            title="Crisis Text Line"
            detail="Text HOME to 741741."
            onClick={() => open('sms:741741?&body=HOME', 'crisis_text_line')}
          />
          <Hotline
            title="The Trevor Project (LGBTQ+ youth)"
            detail="Call 1-866-488-7386 or text START to 678-678."
            onClick={() => open('tel:18664887386', 'trevor_project')}
          />
          <Hotline
            title="International — find a helpline"
            detail="findahelpline.com locates a free crisis line in your country."
            onClick={() => open('https://findahelpline.com', 'findahelpline')}
          />
        </div>

        <div className="space-y-1 text-xs text-black/60">
          <p className="font-medium">Bennett is not a substitute for mental health care.</p>
          <p>Your message wasn't shared with anyone.</p>
        </div>

        <button
          onClick={dismiss}
          className="w-full rounded-[10px] py-3 border border-black/30 text-sm font-semibold"
        >
          I'm safe right now
        </button>
      </div>
    </div>
  );
}

function Hotline({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[10px] bg-white border border-black/15 p-4 hover:border-black/40 transition-colors"
    >
      <div className="font-semibold text-[15px]">{title}</div>
      <div className="text-[13px] text-black/70">{detail}</div>
    </button>
  );
}
