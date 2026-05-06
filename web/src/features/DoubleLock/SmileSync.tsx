import { useEffect, useRef, useState } from 'react';
import { SMILE_HOLD_MS, SMILE_TIMEOUT_MS } from '@bennett/shared';
import { pulse } from './feedback';

interface Props {
  onComplete: () => void;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

export function SmileSync({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef  = useRef<HTMLDivElement | null>(null);
  const [ready, setReady]       = useState(false);
  const [smiling, setSmiling]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showFriend, setShowFriend] = useState(false);
  const startedAt = useRef(Date.now());
  const holdStart = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let raf = 0;

    (async () => {
      try {
        const faceapi = await import('@vladmandic/face-api');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }),
            )
            .withFaceExpressions();
          const happy = detection?.expressions?.happy ?? 0;
          const sm = happy > 0.6;
          setSmiling(sm);
          const now = Date.now();
          if (sm) {
            if (holdStart.current === null) {
              holdStart.current = now;
              pulse(cardRef.current, 'success');
            } else if (now - holdStart.current >= SMILE_HOLD_MS) {
              stopped = true;
              onComplete();
              return;
            }
          } else {
            holdStart.current = null;
          }
          if (now - startedAt.current > SMILE_TIMEOUT_MS && !sm) {
            setShowFriend(true);
          }
          raf = window.setTimeout(tick, 250);
        };
        raf = window.setTimeout(tick, 300);
      } catch (e) {
        setError((e as Error).message);
      }
    })();

    return () => {
      stopped = true;
      if (raf) window.clearTimeout(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="text-muted text-xs uppercase tracking-wider">step 1 of 3</div>
      <div className="text-text text-xl font-semibold lowercase">smile sync</div>
      <div className="text-muted text-sm lowercase">
        {error ? error : ready ? (smiling ? 'got it. hold for a sec.' : 'give us a smile') : 'starting webcam'}
      </div>
      <div
        ref={cardRef}
        className={`relative w-full max-w-[480px] aspect-[4/3] rounded-bn overflow-hidden border ${
          smiling ? 'border-accent border-2' : 'border-border/30'
        }`}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />
      </div>
      {showFriend && (
        <div className="text-muted text-sm lowercase">hey, even a small one counts 😄</div>
      )}
    </div>
  );
}
