// Pixel sprite renderer.
// Sprites are arrays of strings; each char looks up a color in the palette.
// '.' or ' ' is transparent.

const DEFAULT_PALETTE = {
  // primary palette
  K: '#1a1326', // ink/dark
  k: '#3d2e4a', // dark purple
  W: '#fff1d1', // wall cream
  w: '#e8d4a8', // wall shadow
  S: '#5dc8e3', // sky
  B: '#2b9fc9', // water
  b: '#1e6f9a', // deep water
  L: '#f4cf94', // land light
  l: '#e8b97a', // land dark
  R: '#c98f5a', // road
  r: '#a06f3f', // road shadow
  G: '#6cc24a', // grass
  g: '#4ea436', // grass dark
  T: '#2e7d32', // tree
  O: '#e85d3e', // orange / golden gate
  o: '#b94225', // deep orange
  Y: '#ffd966', // yellow window-on
  y: '#d4a82c', // yellow shadow
  P: '#ff8fb1', // pink
  p: '#c25e85', // pink shadow
  U: '#8b5cb8', // purple
  u: '#5e3a85', // purple shadow
  N: '#0e1024', // night
  // building/window
  Q: '#4a6fa5', // window blue
  q: '#2b4775', // window deep
  // roof variants
  A: '#c14a4a', // red roof
  a: '#8a2e2e',
  D: '#de7a3a', // orange roof
  d: '#a85020',
  E: '#6c8ec7', // blue roof
  e: '#3d5d99',
  F: '#c8a35a', // tan roof
  f: '#8a6d3a',
  // misc
  H: '#ffffff', // hot highlight
  h: '#c4b39a', // muted
  M: '#ff5555', // alarm red
  m: '#aa2222',
  C: '#b6f0a0', // console green
  X: '#000000',
};

function Pixel({ sprite, palette = DEFAULT_PALETTE, scale = 4, style, className, onClick, title }) {
  const rows = Array.isArray(sprite) ? sprite : sprite.split('\n').filter(Boolean);
  const h = rows.length;
  const w = Math.max(...rows.map(r => r.length));
  const rects = [];
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const c = palette[ch];
      if (!c) continue;
      // group horizontal runs for size
      let runLen = 1;
      while (x + runLen < row.length && row[x + runLen] === ch) runLen++;
      rects.push(<rect key={x + ',' + y} x={x} y={y} width={runLen} height={1} fill={c} />);
      x += runLen - 1;
    }
  }
  return (
    <svg
      className={'pixel-svg ' + (className || '')}
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

// Helper: render an emoji-like glyph as pixel art (water drop, lightning, etc).
function PixelGlyph({ kind, scale = 4, animate = true }) {
  const s = GLYPHS[kind];
  if (!s) return null;
  return <Pixel sprite={s} scale={scale} className={animate ? 'bob' : ''} />;
}

Object.assign(window, { Pixel, PixelGlyph, DEFAULT_PALETTE });
