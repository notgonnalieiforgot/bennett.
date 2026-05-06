import type { MasterySector } from '@bennett/shared';
import { SECTOR_LABELS } from '@bennett/shared';

interface Props {
  sector: MasterySector;
  score: number;
  onClose: () => void;
}

/**
 * Per spec §2 — full-screen "Founder Vetted. Mastery Certified." treatment.
 * Chrome / Bennett Orange regardless of active theme: this is a moment.
 */
export function CertificateOfMastery({ sector, score, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{
        background:
          'linear-gradient(135deg, #ECECEC 0%, #B8B8B8 35%, #F5F5F5 65%, #C8C8C8 100%)',
      }}
    >
      <div className="max-w-md w-full text-black text-center space-y-5">
        <div className="text-[12px] font-bold tracking-[0.35em] text-black/70">
          CERTIFICATE OF MASTERY
        </div>
        <div
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-white text-5xl"
          style={{
            background: '#FF6B00',
            boxShadow: '0 0 32px rgba(255,107,0,0.45)',
          }}
        >
          ✓
        </div>
        <div className="text-3xl font-extrabold">{SECTOR_LABELS[sector]}</div>
        <div className="text-sm font-mono text-black/70">
          score · {Math.round(score * 100)}%
        </div>
        <div className="space-y-1 pt-2">
          <div className="text-2xl font-bold">Founder Vetted.</div>
          <div className="text-2xl font-bold">Mastery Certified.</div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 inline-block rounded-[14px] px-8 py-3 text-white font-semibold"
          style={{ background: '#FF6B00' }}
        >
          continue
        </button>
      </div>
    </div>
  );
}
