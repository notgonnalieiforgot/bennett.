import { useState, type ReactNode } from 'react';

export type BentoTileSize = 'small' | 'medium' | 'large' | 'wide';

export interface BentoItem {
  id: string;
  size: BentoTileSize;
}

interface BentoGridProps<T extends BentoItem> {
  items: T[];
  onReorder: (next: T[]) => void;
  renderTile: (item: T) => ReactNode;
  /** Default columns at md+ breakpoint. iPhone (sm) is always 2. */
  columns?: 4;
}

const SIZE_CLASSES: Record<BentoTileSize, string> = {
  // sm = 2-col phone, md+ = 4-col tablet/desktop. Wide caps at 3 wide.
  small:  'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1',
  large:  'col-span-2 row-span-2',
  wide:   'col-span-2 md:col-span-3 row-span-1',
};

export function BentoGrid<T extends BentoItem>({
  items,
  onReorder,
  renderTile,
}: BentoGridProps<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (draggingId && id !== draggingId) setOverId(id);
  }

  function handleDrop(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (!draggingId || draggingId === id) {
      reset();
      return;
    }
    const from = items.findIndex((x) => x.id === draggingId);
    const to = items.findIndex((x) => x.id === id);
    if (from === -1 || to === -1) {
      reset();
      return;
    }
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    onReorder(next);
    reset();
  }

  function reset() {
    setDraggingId(null);
    setOverId(null);
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[minmax(120px,auto)]"
      style={{ gridAutoFlow: 'dense' }}
    >
      {items.map((item) => {
        const isDragging = draggingId === item.id;
        const isOver = overId === item.id;
        return (
          <div
            key={item.id}
            className={`${SIZE_CLASSES[item.size]} transition-transform ${
              isDragging ? 'opacity-30' : ''
            } ${isOver ? 'scale-[1.02]' : ''}`}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={() => setOverId(null)}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={reset}
          >
            {renderTile(item)}
          </div>
        );
      })}
    </div>
  );
}
