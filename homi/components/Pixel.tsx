import type { CSSProperties, ReactNode } from 'react';
import { DEFAULT_PALETTE, type Sprite } from './sprites';

interface PixelProps {
  sprite: Sprite | string;
  palette?: Record<string, string>;
  scale?: number;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function Pixel({
  sprite,
  palette = DEFAULT_PALETTE,
  scale = 4,
  style,
  className,
  onClick,
  title,
}: PixelProps): ReactNode {
  const rows = Array.isArray(sprite) ? sprite : sprite.split('\n').filter(Boolean);
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const rects: ReactNode[] = [];

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const c = palette[ch];
      if (!c) continue;
      let runLen = 1;
      while (x + runLen < row.length && row[x + runLen] === ch) runLen++;
      rects.push(
        <rect key={`${x},${y}`} x={x} y={y} width={runLen} height={1} fill={c} />,
      );
      x += runLen - 1;
    }
  }

  return (
    <svg
      className={`pixel-svg ${className || ''}`.trim()}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      style={style}
      onClick={onClick}
    >
      {title ? <title>{title}</title> : null}
      {rects}
    </svg>
  );
}
