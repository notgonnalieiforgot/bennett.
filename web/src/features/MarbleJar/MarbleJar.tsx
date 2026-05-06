import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import type { Marble, MarbleKind } from '@bennett/shared';
import { MARBLE_RADIUS, JAR_TARGET_FILL } from '@bennett/shared';
import { MarbleDetail } from './MarbleDetail';

interface Props {
  marbles: Marble[];
  width?: number;
  height?: number;
}

interface BodyMeta {
  id: string;
  kind: MarbleKind;
  date: string;
  moduleCompleted: string | null;
}

const COLOR: Record<MarbleKind, string> = {
  clear:   'rgba(245, 245, 245, 0.85)',
  gold:    '#FFCF21',
  diamond: '#9EEBFF',
  ghost:   'rgba(245, 245, 245, 0.20)',
};

/**
 * Matter.js-driven Marble Jar. Per spec §5b: marbles settle realistically
 * at the bottom; tap a marble for date + module; lid glows at 30. Per
 * Critical Rule #6 ghost marbles are permanent — they share the jar with
 * real ones and are rendered as outline-only translucent circles.
 */
export function MarbleJar({ marbles, width = 320, height = 480 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<Map<string, Matter.Body>>(new Map());
  const metaRef = useRef<Map<number, BodyMeta>>(new Map());
  const rafRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<Marble | null>(null);

  // Engine setup — runs once.
  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.4 } });
    engineRef.current = engine;
    const wallThickness = 60;
    const walls = [
      // Floor (centered just below visible bottom edge so gravity can settle marbles inside)
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }),
      // Left wall
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true }),
      // Right wall
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true }),
    ];
    Matter.World.add(engine.world, walls);

    const tick = () => {
      Matter.Engine.update(engine, 1000 / 60);
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      bodiesRef.current.clear();
      metaRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Sync marbles → bodies.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const marble of marbles) {
      if (bodiesRef.current.has(marble.id)) continue;
      const x = MARBLE_RADIUS + Math.random() * (width - MARBLE_RADIUS * 2);
      const body = Matter.Bodies.circle(x, -MARBLE_RADIUS, MARBLE_RADIUS, {
        restitution: 0.35,
        friction: 0.05,
        density: 0.001,
        label: marble.id,
      });
      bodiesRef.current.set(marble.id, body);
      metaRef.current.set(body.id, {
        id: marble.id,
        kind: marble.kind,
        date: marble.date,
        moduleCompleted: marble.moduleCompleted,
      });
      Matter.World.add(engine.world, body);
    }
  }, [marbles, width]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Lid glow at fill threshold
    if (bodiesRef.current.size >= JAR_TARGET_FILL) {
      ctx.save();
      ctx.shadowColor = '#FF6B00';
      ctx.shadowBlur = 16;
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, width - 4, height - 4);
      ctx.restore();
    }

    for (const [, body] of bodiesRef.current) {
      const meta = metaRef.current.get(body.id);
      if (!meta) continue;
      const { x, y } = body.position;
      const r = MARBLE_RADIUS;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (meta.kind === 'ghost') {
        ctx.strokeStyle = COLOR.ghost;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = COLOR[meta.kind];
        ctx.fill();
        // glint
        ctx.beginPath();
        ctx.arc(x - r * 0.25, y - r * 0.35, r * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();
      }
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    for (const [, body] of bodiesRef.current) {
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      if (dx * dx + dy * dy <= MARBLE_RADIUS * MARBLE_RADIUS + 16) {
        const meta = metaRef.current.get(body.id);
        if (!meta) continue;
        const m = marbles.find((mm) => mm.id === meta.id);
        if (m) setSelected(m);
        return;
      }
    }
  }

  return (
    <>
      <div
        className="rounded-bn bg-surface/10 border border-border/30 overflow-hidden mx-auto"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleClick}
          className="block w-full h-full cursor-pointer"
        />
      </div>
      {selected && (
        <MarbleDetail marble={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
