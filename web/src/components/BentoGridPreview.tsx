import { useState } from 'react';
import { BentoGrid, type BentoItem } from './BentoGrid';
import { Surface } from '../themes';

interface DemoTile extends BentoItem {
  title: string;
}

const INITIAL: DemoTile[] = [
  { id: '1', title: 'marble jar',    size: 'large' },
  { id: '2', title: 'energy',        size: 'small' },
  { id: '3', title: 'shield',        size: 'small' },
  { id: '4', title: 'knowledge bar', size: 'wide' },
  { id: '5', title: 'arena',         size: 'medium' },
  { id: '6', title: 'modules',       size: 'medium' },
  { id: '7', title: 'bulletin',      size: 'small' },
  { id: '8', title: 'settings',      size: 'small' },
];

export function BentoGridPreview() {
  const [tiles, setTiles] = useState<DemoTile[]>(INITIAL);
  return (
    <BentoGrid
      items={tiles}
      onReorder={setTiles}
      renderTile={(t) => (
        <Surface className="h-full flex flex-col cursor-grab active:cursor-grabbing">
          <div className="text-text font-semibold lowercase">{t.title}</div>
          <div className="mt-auto text-muted text-xs lowercase">{t.size}</div>
        </Surface>
      )}
    />
  );
}
