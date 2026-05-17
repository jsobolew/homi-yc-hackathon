'use client';

import { Pixel } from '../Pixel';
import { HomieDeskHD } from '../HomieHD';
import {
  DEFAULT_PALETTE,
  SPR_PLANT,
  SPR_WATERCOOLER,
} from '../sprites';
import type { Homie, HomieMode } from '@/lib/data/homies';
import type { DemoState } from '../useEvents';

interface OfficeViewProps {
  homies: Homie[];
  state: DemoState;
  selectedHomieId: string | null;
  onSelectHomie: (id: string) => void;
}

const OFFICE_W = 110;
const OFFICE_H = 144;

// 2 rows × 3 desks. Each homie occupies sprite (28) + badge above (14) = 42px
// vertical, so rows are spaced 48 apart to avoid the bottom badges covering the
// top chests.
const DESKS = [
  { id: 0, x: 9, y: 44 },
  { id: 1, x: 43, y: 44 },
  { id: 2, x: 77, y: 44 },
  { id: 3, x: 9, y: 92 },
  { id: 4, x: 43, y: 92 },
  { id: 5, x: 77, y: 92 },
];

function deriveMode(homie: Homie, state: DemoState): { mode: 'phone' | 'laptop'; pulsing: boolean } {
  const runtime = state.homies[homie.id];
  if (runtime?.status === 'running') {
    const phoneIds = new Set(['park', 'okafor']);
    return { mode: phoneIds.has(homie.id) ? 'phone' : 'laptop', pulsing: true };
  }
  const m: HomieMode = homie.mode;
  return { mode: m === 'phone' ? 'phone' : 'laptop', pulsing: false };
}

export function OfficeView({ homies, state, selectedHomieId, onSelectHomie }: OfficeViewProps) {
  const palette = DEFAULT_PALETTE;

  const onCallCount = homies.filter((h) => deriveMode(h, state).mode === 'phone').length;
  const browsingCount = homies.length - onCallCount;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        background:
          'linear-gradient(180deg, rgba(61, 46, 74, 0.96) 0%, rgba(26, 19, 38, 0.98) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '18px 18px 14px',
        border: '4px solid #1a1326',
        boxShadow: '8px 8px 0 #000',
      }}
    >
      <div className="row" style={{ width: '100%', marginBottom: 14 }}>
        <div className="pixel-font" style={{ fontSize: 14, color: 'var(--ui-accent-2)' }}>
          THE HOMI OFFICE · YOUR AGENTS AT WORK
        </div>
        <div className="spacer" />
        <div className="stat">
          <span className="num">{onCallCount}</span>
          <span className="lbl">on calls</span>
        </div>
        <div className="stat">
          <span className="num">{browsingCount}</span>
          <span className="lbl">browsing</span>
        </div>
        <div className="stat">
          <span className="num">{homies.length}</span>
          <span className="lbl">homies</span>
        </div>
      </div>

      <svg
        className="pixel-svg"
        viewBox={`0 0 ${OFFICE_W} ${OFFICE_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: 'block',
          border: '4px solid #130d1f',
          boxShadow: '6px 6px 0 #000',
          background: '#3d2e4a',
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          aspectRatio: `${OFFICE_W} / ${OFFICE_H}`,
        }}
      >
        <defs>
          <pattern id="floor-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={palette.F} />
            <rect width="4" height="4" fill={palette.f} />
            <rect x="4" y="4" width="4" height="4" fill={palette.f} />
          </pattern>
        </defs>

        {/* Floor */}
        <rect x="0" y="0" width={OFFICE_W} height={OFFICE_H} fill="url(#floor-pattern)" />

        {/* Walls — outer frame */}
        <rect x="0" y="0" width={OFFICE_W} height="2" fill={palette.K} />
        <rect x="0" y={OFFICE_H - 2} width={OFFICE_W} height="2" fill={palette.K} />
        <rect x="0" y="0" width="2" height={OFFICE_H} fill={palette.K} />
        <rect x={OFFICE_W - 2} y="0" width="2" height={OFFICE_H} fill={palette.K} />

        {/* Window wall */}
        <rect x="2" y="2" width="106" height="30" fill="#20172d" />
        <rect x="4" y="4" width="102" height="26" fill="#3d2e4a" />
        <rect x="4" y="4" width="102" height="4" fill="#4f3769" />
        <rect x="4" y="8" width="102" height="4" fill="#6b478d" />
        <rect x="4" y="12" width="102" height="4" fill="#96518b" />
        <rect x="4" y="16" width="102" height="3" fill="#cf5a68" />
        <rect x="4" y="19" width="102" height="3" fill="#ea8352" />
        <rect x="4" y="22" width="102" height="2" fill="#ffd966" />
        <rect x="4" y="24" width="102" height="3" fill="#318bb2" />
        <rect x="4" y="27" width="102" height="3" fill="#1a5379" />

        <polygon points="4,25 14,18 24,17 33,20 42,23 56,25" fill="#1b2040" />
        <polygon points="62,25 72,20 82,16 92,17 100,20 106,24 106,25" fill="#1b2040" />
        <polygon points="4,26 16,21 28,22 41,25" fill="#28194f" />
        <polygon points="73,25 84,21 97,22 106,24 106,26" fill="#28194f" />

        <polygon points="23,10 26,10 30,12 34,14 40,18 49,21 57,22 57,23 49,22 39,19 34,15 30,13 26,11 23,11" fill="#1a1326" />
        <polygon points="57,22 66,21 74,19 80,16 84,13 87,11 89,10 91,10 91,11 89,11 87,12 84,14 80,17 74,20 66,22 57,23" fill="#1a1326" />
        {[29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84].map((x) => {
          const t = (x - 23) / 68;
          const cableY = 10 + Math.round(12 * 4 * t * (1 - t));
          return <line key={`sus${x}`} x1={x} y1={cableY} x2={x} y2={24} stroke="#1a1326" strokeWidth="0.4" />;
        })}
        <rect x="22" y="24" width="70" height="1" fill="#1a1326" />
        <rect x="27" y="9" width="3" height="16" fill="#c14a4a" />
        <rect x="26" y="9" width="5" height="1" fill="#c14a4a" />
        <rect x="28" y="8" width="1" height="1" fill="#c14a4a" />
        <rect x="84" y="9" width="3" height="16" fill="#c14a4a" />
        <rect x="83" y="9" width="5" height="1" fill="#c14a4a" />
        <rect x="85" y="8" width="1" height="1" fill="#c14a4a" />
        <rect x="18" y="23" width="76" height="1" fill="#fff1d1" opacity="0.22" />

        {[4, 24, 46, 68, 88, 106].map((x, i) => (
          <rect key={`mullion-${i}`} x={x} y="4" width="1" height="26" fill="#1a1326" />
        ))}
        <rect x="4" y="16" width="102" height="1" fill="#1a1326" opacity="0.75" />
        <rect x="2" y="31" width="106" height="3" fill="#2a1d37" />
        <rect x="2" y="31" width="106" height="1" fill="#110b1b" />

        {/* Floor accent */}
        <rect x="13" y="84" width="84" height="4" fill="#8b5cb8" opacity="0.5" />
        <rect x="16" y="84" width="78" height="1" fill="#c14a4a" opacity="0.5" />

        {/* ===== Decorations — break corner (bottom-left) ===== */}
        {/* Watercooler */}
        <foreignObject x="6" y="129" width="6" height="11" style={{ overflow: 'visible' }}>
          <div>
            <Pixel sprite={SPR_WATERCOOLER} scale={1} palette={palette} />
          </div>
        </foreignObject>
        {/* Mini coffee station next to watercooler */}
        <rect x="14" y="133" width="9" height="6" fill="#3d2e4a" />
        <rect x="14" y="132" width="9" height="1" fill="#1a1326" />
        <rect x="15" y="134" width="3" height="3" fill="#1a1326" />
        <rect x="19" y="134" width="3" height="2" fill="#8a2e2e" />
        <rect x="19" y="136" width="3" height="1" fill="#c14a4a" />
        {/* Coffee mug */}
        <rect x="16" y="131" width="2" height="2" fill="#fff1d1" />

        {/* ===== Decorations — plant cluster (bottom-right) ===== */}
        <foreignObject x={OFFICE_W - 12} y="130" width="6" height="9" style={{ overflow: 'visible' }}>
          <div>
            <Pixel sprite={SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>
        <foreignObject x={OFFICE_W - 18} y="133" width="6" height="9" style={{ overflow: 'visible' }}>
          <div>
            <Pixel sprite={SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>

        {DESKS.map((d) => {
          const homie = homies.find((h) => h.desk === d.id);
          if (!homie) return null;
          const { mode, pulsing } = deriveMode(homie, state);
          const isSelected = selectedHomieId === homie.id;
          const isActive = state.activeHomie === homie.id;
          const ringColor = isActive ? palette.M : isSelected ? palette.Y : null;

          return (
            <g
              key={homie.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectHomie(homie.id)}
            >
              {ringColor && (
                <rect
                  x={d.x - 2}
                  y={d.y - 2}
                  width="28"
                  height="32"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="0.6"
                  strokeDasharray="1.4 1"
                />
              )}

              {/* Status badge above head */}
              <foreignObject
                x={d.x - 4}
                y={d.y - 14}
                width="32"
                height="12"
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    background: '#1a1326',
                    border: '0.5px solid #ffd966',
                    padding: '1px 1.5px',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '3px',
                    color: mode === 'phone' ? '#ff8fb1' : '#6cc24a',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    boxShadow: '0.6px 0.6px 0 #000',
                  }}
                >
                  <div style={{ color: '#fff1d1' }}>{homie.name.split(' ')[1].toUpperCase()}</div>
                  <div>{mode === 'phone' ? '☎ ON CALL' : '◍ BROWSING'}</div>
                </div>
              </foreignObject>

              {/* HD homie + desk sprite (composite — embeds sponsor logo + secondary badge) */}
              <foreignObject x={d.x} y={d.y} width="24" height="28" style={{ overflow: 'visible' }}>
                <div className={pulsing ? 'bob' : ''}>
                  <HomieDeskHD defIdx={homie.spriteIdx} mode={mode} scale={1} palette={palette} />
                </div>
              </foreignObject>

              {/* Chair back behind the desk */}
              <rect x={d.x + 4} y={d.y + 26} width="16" height="3" fill={palette.k} />
              <rect x={d.x + 4} y={d.y + 29} width="3" height="4" fill={palette.k} />
              <rect x={d.x + 17} y={d.y + 29} width="3" height="4" fill={palette.k} />
            </g>
          );
        })}
      </svg>

      <div className="mono-font dim" style={{ fontSize: 16, marginTop: 12 }}>
        → click a homie to view their live browser or call transcript
      </div>
    </div>
  );
}
