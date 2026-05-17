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
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #2b1f3a 0%, #1a1326 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 24px',
        overflow: 'auto',
      }}
    >
      <div className="row" style={{ width: '100%', maxWidth: 1180, marginBottom: 14 }}>
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
          border: '4px solid #1a1326',
          boxShadow: '6px 6px 0 #000',
          background: '#3d2e4a',
          height: 'min(85vh, 1400px)',
          width: 'auto',
          maxWidth: '100%',
        }}
      >
        <defs>
          <pattern id="floor-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={palette.F} />
            <rect width="4" height="4" fill={palette.f} />
            <rect x="4" y="4" width="4" height="4" fill={palette.f} />
          </pattern>
        </defs>

        {/* Floor (entire canvas, will be covered by window + walls on top) */}
        <rect x="0" y="0" width={OFFICE_W} height={OFFICE_H} fill="url(#floor-pattern)" />

        {/* Walls — outer frame */}
        <rect x="0" y="0" width={OFFICE_W} height="2" fill={palette.K} />
        <rect x="0" y={OFFICE_H - 2} width={OFFICE_W} height="2" fill={palette.K} />
        <rect x="0" y="0" width="2" height={OFFICE_H} fill={palette.K} />
        <rect x={OFFICE_W - 2} y="0" width="2" height={OFFICE_H} fill={palette.K} />

        {/* ===== Window scene: sky gradient + Golden Gate + bay ===== */}
        {/* Window inset: x=3..107, y=2..26 (24 tall) */}
        {/* Sky bands — dusk over the bay */}
        <rect x="3" y="2" width="104" height="4" fill="#3d2e4a" />
        <rect x="3" y="6" width="104" height="3" fill="#5e3a85" />
        <rect x="3" y="9" width="104" height="3" fill="#8b5cb8" />
        <rect x="3" y="12" width="104" height="3" fill="#c25e85" />
        <rect x="3" y="15" width="104" height="2" fill="#e85d3e" />
        <rect x="3" y="17" width="104" height="2" fill="#ffd966" />
        <rect x="3" y="19" width="104" height="2" fill="#e8b97a" />

        {/* Distant Marin headland silhouette (left) */}
        <polygon points="3,21 8,18 14,16 22,18 28,21" fill="#1f2440" />
        <polygon points="3,21 10,19 16,20 22,21" fill="#2a1854" />

        {/* Distant Presidio headland silhouette (right) */}
        <polygon points="84,21 90,17 96,15 102,18 107,21" fill="#1f2440" />
        <polygon points="86,21 94,19 100,20 107,21" fill="#2a1854" />

        {/* Bay water — calm horizontal bands */}
        <rect x="3" y="21" width="104" height="2" fill="#2b9fc9" />
        <rect x="3" y="23" width="104" height="2" fill="#1e6f9a" />
        <rect x="3" y="25" width="104" height="1" fill="#0e1024" />

        {/* ===== Golden Gate Bridge ===== */}
        {/* Main suspension cables — curve sagging from tower tops to mid-deck and back up */}
        {/* Left half: x=30->54, y=8->17 sag */}
        <polygon points="30,7 31,7 32,8 33,9 35,11 38,13 42,15 46,16 50,16 54,17 54,18 50,17 46,17 42,16 38,14 35,12 33,10 32,9 31,8 30,8" fill="#1a1326" />
        {/* Right half: x=54->78, y=17->8 rise */}
        <polygon points="54,17 58,16 62,16 66,15 70,13 73,11 75,9 76,8 77,7 78,7 78,8 77,8 76,9 75,10 73,12 70,14 66,16 62,17 58,17 54,18" fill="#1a1326" />

        {/* Suspender cables (verticals from main cable down to deck) */}
        {[34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74].map((x) => {
          // Approximate cable y at this x — parabolic sag
          const t = (x - 30) / 48;
          const cableY = 8 + Math.round(9 * 4 * t * (1 - t));
          return <line key={`sus${x}`} x1={x} y1={cableY} x2={x} y2={20} stroke="#1a1326" strokeWidth="0.4" />;
        })}

        {/* Bridge deck (roadway) — spans between towers */}
        <rect x="27" y="20" width="54" height="1" fill="#1a1326" />
        <rect x="27" y="20" width="54" height="0.5" fill="#3d2e4a" />

        {/* Left tower (international orange) */}
        <rect x="29" y="6" width="3" height="15" fill="#c14a4a" />
        <rect x="28" y="6" width="5" height="1" fill="#c14a4a" />
        <rect x="29" y="8" width="3" height="1" fill="#8a2e2e" />
        <rect x="29" y="14" width="3" height="1" fill="#8a2e2e" />
        {/* Tower top crown */}
        <rect x="30" y="5" width="1" height="1" fill="#c14a4a" />

        {/* Right tower */}
        <rect x="76" y="6" width="3" height="15" fill="#c14a4a" />
        <rect x="75" y="6" width="5" height="1" fill="#c14a4a" />
        <rect x="76" y="8" width="3" height="1" fill="#8a2e2e" />
        <rect x="76" y="14" width="3" height="1" fill="#8a2e2e" />
        <rect x="77" y="5" width="1" height="1" fill="#c14a4a" />

        {/* Fog rolling in at the base of the bridge */}
        <rect x="20" y="19" width="70" height="1" fill="#e8d4a8" opacity="0.35" />
        <rect x="30" y="20" width="50" height="1" fill="#e8d4a8" opacity="0.25" />

        {/* Window mullions — 6 vertical bars give the "looking through glass" feel */}
        <rect x="3" y="2" width="104" height="1" fill="#1a1326" />
        <rect x="3" y="26" width="104" height="1" fill="#1a1326" />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={`wf${i}`} x={3 + i * 17} y="2" width="0.7" height="24" fill="#1a1326" />
        ))}
        <rect x={106.3} y="2" width="0.7" height="24" fill="#1a1326" />
        {/* Horizontal mullion at mid-height to break up the panes */}
        <rect x="3" y="13" width="104" height="0.5" fill="#1a1326" opacity="0.6" />

        {/* ===== Wall band under the window — paneling strip ===== */}
        <rect x="3" y="27" width="104" height="2" fill="#3d2e4a" />
        <rect x="3" y="27" width="104" height="0.6" fill="#1a1326" />

        {/* ===== Floor accent (central rug between desk rows) ===== */}
        <rect x="20" y="79" width="70" height="3" fill="#8b5cb8" opacity="0.55" />
        <rect x="22" y="79" width="66" height="1" fill="#c14a4a" opacity="0.4" />

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
