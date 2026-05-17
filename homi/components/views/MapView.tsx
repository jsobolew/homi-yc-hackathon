'use client';

import { useEffect, useRef, useState } from 'react';
import { Pixel } from '../Pixel';
import {
  DEFAULT_PALETTE,
  MAP_MARKER_VARIANTS,
  SPR_BAY_BRIDGE,
  SPR_COIT,
  SPR_FERRY,
  SPR_GG_BRIDGE,
  SPR_PAINTED,
  SPR_TRANSAM,
  SPR_TREE,
  SPR_VENDOR_OFFICE,
  VAN_SPRITES,
} from '../sprites';
import type { Property } from '@/lib/data/properties';
import type { Issue } from '@/lib/data/issues';
import { VENDORS } from '@/lib/data/vendors';
import type { DemoState, TruckRuntime } from '../useEvents';

interface MapViewProps {
  properties: Property[];
  issues: Issue[];
  state: DemoState;
  onSelectProperty: (id: string) => void;
}

const MAP_W = 100;
const MAP_H = 70;

function MapBackground() {
  const palette = DEFAULT_PALETTE;
  return (
    <g>
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={palette.B} />
      <rect x="80" y="0" width="20" height={MAP_H} fill={palette.b} />
      <rect x="0" y="0" width={MAP_W} height="8" fill={palette.b} />
      <rect x="0" y="62" width={MAP_W} height="8" fill={palette.b} />

      <rect x="6" y="14" width="74" height="46" fill={palette.L} />
      <rect x="6" y="14" width="6" height="4" fill={palette.B} />
      <rect x="74" y="14" width="6" height="2" fill={palette.B} />
      <rect x="6" y="56" width="4" height="4" fill={palette.B} />
      <rect x="76" y="58" width="4" height="2" fill={palette.B} />
      <rect x="78" y="18" width="2" height="4" fill={palette.l} />
      <rect x="6" y="40" width="2" height="8" fill={palette.l} />

      <rect x="2" y="0" width="22" height="10" fill={palette.L} />
      <rect x="2" y="8" width="22" height="2" fill={palette.l} />
      <rect x="0" y="0" width="2" height="6" fill={palette.B} />
      <rect x="22" y="6" width="6" height="4" fill={palette.L} />

      <rect x="92" y="0" width="8" height={MAP_H} fill={palette.L} />
      <rect x="92" y="0" width="2" height={MAP_H} fill={palette.l} />

      <rect x="84" y="26" width="6" height="6" fill={palette.L} />
      <rect x="84" y="30" width="6" height="2" fill={palette.l} />

      <rect x="10" y="38" width="22" height="4" fill={palette.G} />
      <rect x="10" y="42" width="22" height="2" fill={palette.g} />
      <rect x="8" y="14" width="14" height="8" fill={palette.G} />
      <rect x="8" y="20" width="14" height="2" fill={palette.g} />
      <rect x="36" y="40" width="6" height="4" fill={palette.G} />
      <rect x="38" y="38" width="2" height="2" fill={palette.g} />
      <rect x="34" y="48" width="4" height="3" fill={palette.G} />
      <rect x="40" y="34" width="4" height="3" fill={palette.G} />

      {[18, 24, 30, 46, 52, 58].map((y) => (
        <rect key={`h${y}`} x="6" y={y} width="74" height="1" fill={palette.R} />
      ))}
      {[16, 22, 28, 34, 48, 54, 60, 66, 72].map((x) => (
        <rect key={`v${x}`} x={x} y="14" width="1" height="46" fill={palette.R} />
      ))}
      {Array.from({ length: 28 }).map((_, i) => (
        <rect
          key={`mkt${i}`}
          x={42 + i}
          y={50 - Math.floor(i * 0.6)}
          width="1"
          height="1"
          fill={palette.R}
        />
      ))}

      <rect x="6" y="22" width="2" height="14" fill={palette.L} />

      <rect x="50" y="4" width="3" height="1" fill={palette.W} />
      <rect x="51" y="3" width="1" height="1" fill={palette.W} />
      <rect x="60" y="6" width="3" height="1" fill={palette.A} />
      <rect x="84" y="48" width="3" height="1" fill={palette.W} />
      <rect x="85" y="47" width="1" height="1" fill={palette.W} />
    </g>
  );
}

function MapLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <foreignObject x={x} y={y} width="60" height="6" style={{ overflow: 'visible' }}>
      <div
       
        style={{
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '2.4px',
          color: '#1a1326',
          textShadow: '0.4px 0.4px 0 #fff1d1',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </foreignObject>
  );
}

function Truck({ truck, properties }: { truck: TruckRuntime; properties: Property[] }) {
  const vendor = VENDORS.find((v) => v.id === truck.vendorId);
  const property = properties.find((p) => p.id === truck.propertyId);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  if (!vendor || !property) return null;

  // Sped-up time: every wall-second = 1 simulated minute. truck arrives over etaMinutes seconds.
  const totalMs = truck.etaMinutes * 1000;
  const elapsed = truck.arrived ? totalMs : Math.min(totalMs, Date.now() - truck.startedAt);
  const t = Math.max(0, Math.min(1, elapsed / totalMs));
  void tick;

  const x = vendor.office.x + (property.x - vendor.office.x) * t;
  const y = vendor.office.y + (property.y - vendor.office.y) * t;
  const facing = property.x >= vendor.office.x ? 1 : -1;
  const sprite = VAN_SPRITES[vendor.spriteKey] || VAN_SPRITES.plumb;
  const etaLeft = Math.max(0, Math.ceil(truck.etaMinutes * (1 - t)));

  return (
    <g transform={`translate(${x - 7}, ${y - 4})`}>
      <foreignObject x="0" y="0" width="14" height="8" style={{ overflow: 'visible' }}>
        <div
         
          style={{
            transform: facing < 0 ? 'scaleX(-1)' : 'none',
            transformOrigin: 'center',
          }}
        >
          <Pixel sprite={sprite} scale={1} palette={DEFAULT_PALETTE} />
        </div>
      </foreignObject>
      <foreignObject x="-4" y="-7" width="22" height="6" style={{ overflow: 'visible' }}>
        <div
         
          style={{
            background: '#1a1326',
            border: '0.4px solid #ffd966',
            padding: '0.5px 1px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '2.2px',
            color: t >= 1 ? '#6cc24a' : '#ffd966',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {t >= 1 ? 'ARRIVED' : `ETA ${etaLeft}m`}
        </div>
      </foreignObject>
    </g>
  );
}

function PropertyMarker({
  property,
  issues,
  resolvedIssues,
  onClick,
}: {
  property: Property;
  issues: Issue[];
  resolvedIssues: string[];
  onClick: (id: string) => void;
}) {
  const propIssues = issues.filter(
    (i) => i.propertyId === property.id && !resolvedIssues.includes(i.id) && i.status !== 'resolved',
  );
  const variant = MAP_MARKER_VARIANTS[property.variant];
  return (
    <foreignObject
      x={property.x - 6}
      y={property.y - 11}
      width="12"
      height="14"
      style={{ overflow: 'visible', cursor: 'pointer' }}
      onClick={() => onClick(property.id)}
    >
      <div style={{ position: 'relative' }}>
        <Pixel sprite={variant} scale={1} palette={DEFAULT_PALETTE} />
        {propIssues.length > 0 && (
          <div
            className="pulse"
            style={{
              position: 'absolute',
              top: -4,
              right: -3,
              width: 5,
              height: 5,
              background: '#ff5555',
              border: '0.5px solid #1a1326',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '2.8px',
              color: 'white',
              lineHeight: '5px',
              textAlign: 'center',
            }}
          >
            {propIssues.length}
          </div>
        )}
        {propIssues.length === 0 && resolvedIssues.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -3,
              width: 5,
              height: 5,
              background: '#6cc24a',
              border: '0.5px solid #1a1326',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '2.8px',
              color: 'white',
              lineHeight: '5px',
              textAlign: 'center',
            }}
          >
            ✓
          </div>
        )}
      </div>
    </foreignObject>
  );
}

function VendorOffice({ vendor }: { vendor: (typeof VENDORS)[number] }) {
  return (
    <foreignObject
      x={vendor.office.x - 5}
      y={vendor.office.y - 8}
      width="10"
      height="11"
      style={{ overflow: 'visible' }}
    >
      <div>
        <Pixel sprite={SPR_VENDOR_OFFICE} scale={1} palette={DEFAULT_PALETTE} />
      </div>
    </foreignObject>
  );
}

export function MapView({ properties, issues, state, onSelectProperty }: MapViewProps) {
  const palette = DEFAULT_PALETTE;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(9);

  useEffect(() => {
    function recompute() {
      if (!wrapperRef.current) return;
      const parent = wrapperRef.current.parentElement;
      if (!parent) return;
      const availW = parent.clientWidth - 48;
      const availH = parent.clientHeight - 48;
      const maxS = Math.min(Math.floor(availW / MAP_W), Math.floor(availH / MAP_H));
      setFitScale(Math.max(3, Math.min(maxS, 12)));
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0e1024 0%, #2b1f3a 100%)',
        overflow: 'hidden',
      }}
    >
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <svg
          className="pixel-svg"
          width={MAP_W * fitScale}
          height={MAP_H * fitScale}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{
            display: 'block',
            border: '4px solid #1a1326',
            boxShadow: '6px 6px 0 #000',
          }}
        >
          <MapBackground />

          <g transform="translate(-2, -2)">
            <foreignObject x="0" y="0" width="40" height="22" style={{ overflow: 'visible' }}>
              <div>
                <Pixel sprite={SPR_GG_BRIDGE} scale={1} palette={palette} />
              </div>
            </foreignObject>
          </g>

          <foreignObject x="68" y="29" width="28" height="8" style={{ overflow: 'visible' }}>
            <div>
              <Pixel sprite={SPR_BAY_BRIDGE} scale={1} palette={palette} />
            </div>
          </foreignObject>

          <foreignObject x="57" y="14" width="14" height="25" style={{ overflow: 'visible' }}>
            <div>
              <Pixel sprite={SPR_TRANSAM} scale={1} palette={palette} />
            </div>
          </foreignObject>

          <foreignObject x="56" y="10" width="8" height="18" style={{ overflow: 'visible' }}>
            <div>
              <Pixel sprite={SPR_COIT} scale={1} palette={palette} />
            </div>
          </foreignObject>

          <foreignObject x="38" y="32" width="20" height="12" style={{ overflow: 'visible' }}>
            <div>
              <Pixel sprite={SPR_PAINTED} scale={1} palette={palette} />
            </div>
          </foreignObject>

          <foreignObject x="72" y="22" width="10" height="16" style={{ overflow: 'visible' }}>
            <div>
              <Pixel sprite={SPR_FERRY} scale={1} palette={palette} />
            </div>
          </foreignObject>

          {[
            [10, 14], [13, 16], [17, 14], [20, 16],
            [12, 38], [16, 38], [20, 38], [24, 38], [28, 38],
            [37, 41], [40, 41], [36, 49],
          ].map(([tx, ty], i) => (
            <foreignObject
              key={`t${i}`}
              x={tx}
              y={ty}
              width="6"
              height="6"
              style={{ overflow: 'visible' }}
            >
              <div>
                <Pixel sprite={SPR_TREE} scale={1} palette={palette} />
              </div>
            </foreignObject>
          ))}

          <MapLabel x={3} y={11} text="MARIN" />
          <MapLabel x={8} y={46} text="GG PARK" />
          <MapLabel x={14} y={32} text="SUNSET" />
          <MapLabel x={32} y={22} text="MARINA" />
          <MapLabel x={34} y={48} text="TWIN PEAKS" />
          <MapLabel x={42} y={32} text="ALAMO" />
          <MapLabel x={44} y={58} text="MISSION" />
          <MapLabel x={58} y={46} text="SoMa" />
          <MapLabel x={60} y={20} text="FINANCIAL" />
          <MapLabel x={74} y={50} text="BAY BRIDGE" />

          {VENDORS.map((v) => (
            <VendorOffice key={v.id} vendor={v} />
          ))}

          {properties.map((p) => (
            <PropertyMarker
              key={p.id}
              property={p}
              issues={issues}
              resolvedIssues={state.resolvedIssues}
              onClick={onSelectProperty}
            />
          ))}

          {state.trucks.map((t) => (
            <Truck key={t.routeId} truck={t} properties={properties} />
          ))}
        </svg>

        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(26,19,38,0.85)',
            border: '2px solid #ffd966',
            padding: '4px 8px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '8px',
            color: '#ffd966',
          }}
        >
          SAN&nbsp;FRANCISCO · OPS&nbsp;LIVE
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(26,19,38,0.9)',
            border: '2px solid #1a1326',
            padding: '6px 10px',
            fontFamily: 'VT323, monospace',
            fontSize: '14px',
            color: '#fff1d1',
            display: 'flex',
            gap: 14,
          }}
        >
          <span>
            <span className="dot red"></span>&nbsp;issue
          </span>
          <span>
            <span className="dot yellow"></span>&nbsp;property
          </span>
          <span>
            <span className="dot green"></span>&nbsp;homie working
          </span>
          <span>
            <span className="dot blue"></span>&nbsp;vendor enroute
          </span>
        </div>
      </div>
    </div>
  );
}
