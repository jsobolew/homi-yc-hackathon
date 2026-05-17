'use client';

import { Pixel } from '../Pixel';
import {
  DEFAULT_PALETTE,
  HOMIE_HATS,
  HOMIE_SHIRTS,
  SPR_PLANT,
  SPR_WATERCOOLER,
  homieDesk,
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
const OFFICE_H = 72;

const DESKS = [
  { id: 0, x: 18, y: 14 },
  { id: 1, x: 50, y: 14 },
  { id: 2, x: 82, y: 14 },
  { id: 3, x: 18, y: 42 },
  { id: 4, x: 50, y: 42 },
  { id: 5, x: 82, y: 42 },
];

function deriveMode(homie: Homie, state: DemoState): { mode: 'phone' | 'laptop'; pulsing: boolean } {
  const runtime = state.homies[homie.id];
  if (runtime?.status === 'running') {
    // Show phone for park/okafor (voice/email), laptop for everyone else
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
        width={OFFICE_W * 10}
        height={OFFICE_H * 10}
        viewBox={`0 0 ${OFFICE_W} ${OFFICE_H}`}
        style={{
          display: 'block',
          border: '4px solid #1a1326',
          boxShadow: '6px 6px 0 #000',
          background: '#3d2e4a',
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
        <rect x="0" y="0" width={OFFICE_W} height={OFFICE_H} fill="url(#floor-pattern)" />

        {/* Walls */}
        <rect x="0" y="0" width={OFFICE_W} height="2" fill={palette.K} />
        <rect x="0" y={OFFICE_H - 2} width={OFFICE_W} height="2" fill={palette.K} />
        <rect x="0" y="0" width="2" height={OFFICE_H} fill={palette.K} />
        <rect x={OFFICE_W - 2} y="0" width="2" height={OFFICE_H} fill={palette.K} />

        {/* Window strip */}
        <rect x="3" y="2" width={OFFICE_W - 6} height="6" fill={palette.S} />
        <rect x="3" y="6" width={OFFICE_W - 6} height="1" fill={palette.K} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={`wf${i}`} x={3 + i * 17} y="2" width="1" height="6" fill={palette.K} />
        ))}
        <rect x="10" y="4" width="3" height="3" fill={palette.k} />
        <rect x="28" y="3" width="2" height="4" fill={palette.k} />
        <rect x="42" y="5" width="4" height="2" fill={palette.k} />
        <rect x="60" y="4" width="3" height="3" fill={palette.k} />
        <rect x="78" y="3" width="2" height="4" fill={palette.k} />
        <rect x="94" y="5" width="3" height="2" fill={palette.k} />

        <foreignObject x="44" y="9" width="22" height="3" style={{ overflow: 'visible' }}>
          <div
           
            style={{
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '2.4px',
              color: '#ffd966',
              textAlign: 'center',
              textShadow: '0.4px 0.4px 0 #000',
            }}
          >
            · HOMI HQ ·
          </div>
        </foreignObject>

        <foreignObject x="4" y="60" width="5" height="9" style={{ overflow: 'visible' }}>
          <div>
            <Pixel sprite={SPR_WATERCOOLER} scale={1} palette={palette} />
          </div>
        </foreignObject>
        <foreignObject x={OFFICE_W - 9} y="62" width="5" height="7" style={{ overflow: 'visible' }}>
          <div>
            <Pixel sprite={SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>
        <foreignObject x="50" y="62" width="5" height="7" style={{ overflow: 'visible' }}>
          <div>
            <Pixel sprite={SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>

        {DESKS.map((d) => {
          const homie = homies.find((h) => h.desk === d.id);
          if (!homie) return null;
          const { mode, pulsing } = deriveMode(homie, state);
          const sprite = homieDesk(
            HOMIE_HATS[homie.spriteIdx],
            HOMIE_SHIRTS[homie.spriteIdx],
            mode,
          );
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
                  x={d.x - 9}
                  y={d.y - 2}
                  width="18"
                  height="20"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="0.5"
                />
              )}
              <foreignObject x={d.x - 8} y={d.y - 8} width="16" height="6" style={{ overflow: 'visible' }}>
                <div
                 
                  style={{
                    background: '#1a1326',
                    border: '0.4px solid #ffd966',
                    padding: '0.5px 1px',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '2.2px',
                    color: mode === 'phone' ? '#ff8fb1' : '#6cc24a',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  <div>{homie.name.split(' ')[1]}</div>
                  <div style={{ color: '#fff1d1' }}>{mode === 'phone' ? '☎ on call' : '◍ browsing'}</div>
                </div>
              </foreignObject>

              <foreignObject x={d.x - 6} y={d.y} width="12" height="14" style={{ overflow: 'visible' }}>
                <div className={pulsing ? 'bob' : ''}>
                  <Pixel sprite={sprite} scale={1} palette={palette} />
                </div>
              </foreignObject>

              <rect x={d.x - 4} y={d.y + 14} width="8" height="3" fill={palette.k} />
              <rect x={d.x - 4} y={d.y + 17} width="2" height="3" fill={palette.k} />
              <rect x={d.x + 2} y={d.y + 17} width="2" height="3" fill={palette.k} />
            </g>
          );
        })}

        <rect x="0" y="30" width={OFFICE_W} height="1" fill={palette.K} opacity="0.2" />
      </svg>

      <div className="mono-font dim" style={{ fontSize: 16, marginTop: 12 }}>
        → click a homie to view their live browser or call transcript
      </div>
    </div>
  );
}
