'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pixel } from '../Pixel';
import { DEFAULT_PALETTE, MAP_MARKER_VARIANTS, SPR_VENDOR_OFFICE, VAN_SPRITES } from '../sprites';
import type { Issue } from '@/lib/data/issues';
import type { Property } from '@/lib/data/properties';
import { VENDORS } from '@/lib/data/vendors';
import { SF_MAP_MANIFEST, clamp, clampCamera, fitCamera, projectLonLat } from '@/lib/maps/projection';
import type { DemoState, TruckRuntime } from '../useEvents';

interface MapViewProps {
  properties: Property[];
  issues: Issue[];
  state: DemoState;
  onSelectProperty: (id: string) => void;
}

interface CameraState {
  scale: number;
  tx: number;
  ty: number;
}

type Viewport = { width: number; height: number };
type MapPoint = { x: number; y: number };

const MAP_WIDTH = SF_MAP_MANIFEST.width;
const MAP_HEIGHT = SF_MAP_MANIFEST.height;
const MIN_ZOOM = 1.2;
const MAX_ZOOM = 6;

function projectProperty(property: Property): MapPoint {
  if (typeof property.lon === 'number' && typeof property.lat === 'number') {
    return projectLonLat(property.lon, property.lat);
  }
  return {
    x: (property.x / 100) * MAP_WIDTH,
    y: (property.y / 70) * MAP_HEIGHT,
  };
}

function projectVendorOffice(vendor: (typeof VENDORS)[number]): MapPoint {
  if (typeof vendor.office.lon === 'number' && typeof vendor.office.lat === 'number') {
    return projectLonLat(vendor.office.lon, vendor.office.lat);
  }
  return {
    x: (vendor.office.x / 100) * MAP_WIDTH,
    y: (vendor.office.y / 70) * MAP_HEIGHT,
  };
}

function PropertyMarker({
  point,
  property,
  issues,
  resolvedIssues,
  onClick,
}: {
  point: MapPoint;
  property: Property;
  issues: Issue[];
  resolvedIssues: string[];
  onClick: (id: string) => void;
}) {
  const propIssues = issues.filter(
    (issue) =>
      issue.propertyId === property.id &&
      !resolvedIssues.includes(issue.id) &&
      issue.status !== 'resolved',
  );
  const variant = MAP_MARKER_VARIANTS[property.variant];

  return (
    <div
      data-map-interactive="true"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => onClick(property.id)}
      style={{
        position: 'absolute',
        left: point.x - 8,
        top: point.y - 14,
        width: 18,
        height: 20,
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', width: 18, height: 20 }}>
        <Pixel sprite={variant} scale={1.4} palette={DEFAULT_PALETTE} />
        {propIssues.length > 0 ? (
          <div
            className="pulse"
            style={{
              position: 'absolute',
              top: -3,
              right: -2,
              width: 7,
              height: 7,
              background: '#ff5555',
              border: '0.75px solid #1a1326',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '4px',
              color: 'white',
              lineHeight: '7px',
            }}
          >
            {propIssues.length}
          </div>
        ) : resolvedIssues.length > 0 ? (
          <div
            style={{
              position: 'absolute',
              top: -3,
              right: -2,
              width: 7,
              height: 7,
              background: '#6cc24a',
              border: '0.75px solid #1a1326',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '4px',
              color: 'white',
              lineHeight: '7px',
            }}
          >
            ✓
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VendorOffice({ vendor }: { vendor: (typeof VENDORS)[number] }) {
  const point = projectVendorOffice(vendor);
  return (
    <div
      style={{
        position: 'absolute',
        left: point.x - 7,
        top: point.y - 10,
        width: 16,
        height: 18,
      }}
    >
      <div>
        <Pixel sprite={SPR_VENDOR_OFFICE} scale={1.5} palette={DEFAULT_PALETTE} />
      </div>
    </div>
  );
}

function Truck({
  truck,
  propertyPoints,
}: {
  truck: TruckRuntime;
  propertyPoints: Map<string, MapPoint>;
}) {
  const vendor = VENDORS.find((candidate) => candidate.id === truck.vendorId);
  const propertyPoint = propertyPoints.get(truck.propertyId);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((tick) => tick + 1), 100);
    return () => clearInterval(id);
  }, []);

  if (!vendor || !propertyPoint) return null;

  const vendorPoint = projectVendorOffice(vendor);
  const totalMs = truck.etaMinutes * 1000;
  const elapsed = truck.arrived ? totalMs : Math.min(totalMs, Date.now() - truck.startedAt);
  const progress = Math.max(0, Math.min(1, elapsed / totalMs));

  const x = vendorPoint.x + (propertyPoint.x - vendorPoint.x) * progress;
  const y = vendorPoint.y + (propertyPoint.y - vendorPoint.y) * progress;
  const facing = propertyPoint.x >= vendorPoint.x ? 1 : -1;
  const sprite = VAN_SPRITES[vendor.spriteKey] || VAN_SPRITES.plumb;
  const etaLeft = Math.max(0, Math.ceil(truck.etaMinutes * (1 - progress)));

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 10,
        top: y - 6,
        width: 20,
        height: 12,
      }}
    >
      <div
        style={{
          transform: facing < 0 ? 'scaleX(-1)' : 'none',
          transformOrigin: 'center',
        }}
      >
        <Pixel sprite={sprite} scale={1.4} palette={DEFAULT_PALETTE} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: -10,
          background: '#1a1326',
          border: '0.75px solid #ffd966',
          padding: '1px 2px',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '4px',
          color: progress >= 1 ? '#6cc24a' : '#ffd966',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {progress >= 1 ? 'ARRIVED' : `ETA ${etaLeft}m`}
      </div>
    </div>
  );
}

export function MapView({ properties, issues, state, onSelectProperty }: MapViewProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [camera, setCamera] = useState<CameraState>(() => fitCamera(1200, 800));

  const propertyPoints = useMemo(() => {
    const points = new Map<string, MapPoint>();
    for (const property of properties) {
      points.set(property.id, projectProperty(property));
    }
    return points;
  }, [properties]);

  useEffect(() => {
    function recomputeViewport() {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      setViewport({
        width: rect.width,
        height: rect.height,
      });
    }

    recomputeViewport();
    const observer = new ResizeObserver(recomputeViewport);
    if (stageRef.current) observer.observe(stageRef.current);
    window.addEventListener('resize', recomputeViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recomputeViewport);
    };
  }, []);

  useEffect(() => {
    if (!viewport.width || !viewport.height) return;
    setCamera(fitCamera(viewport.width, viewport.height));
  }, [viewport.width, viewport.height]);

  useEffect(() => {
    function endDrag() {
      dragRef.current = null;
    }

    window.addEventListener('pointerup', endDrag);
    return () => window.removeEventListener('pointerup', endDrag);
  }, []);

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const nextScale = clamp(camera.scale * zoomFactor, MIN_ZOOM, MAX_ZOOM);
    const worldX = (pointerX - camera.tx) / camera.scale;
    const worldY = (pointerY - camera.ty) / camera.scale;
    const nextTx = pointerX - worldX * nextScale;
    const nextTy = pointerY - worldY * nextScale;
    const clamped = clampCamera(viewport.width, viewport.height, nextScale, nextTx, nextTy);

    setCamera({
      scale: nextScale,
      tx: clamped.tx,
      ty: clamped.ty,
    });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-map-interactive="true"]')) {
      return;
    }
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      tx: camera.tx,
      ty: camera.ty,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const clamped = clampCamera(
      viewport.width,
      viewport.height,
      camera.scale,
      dragRef.current.tx + dx,
      dragRef.current.ty + dy,
    );
    setCamera((current) => ({
      ...current,
      tx: clamped.tx,
      ty: clamped.ty,
    }));
  }

  function handleDoubleClick() {
    if (!viewport.width || !viewport.height) return;
    setCamera(fitCamera(viewport.width, viewport.height));
  }

  return (
    <div
      ref={stageRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #0e1024 0%, #2b1f3a 100%)',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          filter: 'drop-shadow(10px 14px 0 rgba(0,0,0,.38))',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'block',
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
          }}
        >
          <img
            src="/maps/sf-map.svg"
            alt="San Francisco operations map"
            draggable={false}
            style={{
              display: 'block',
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {VENDORS.map((vendor) => (
            <VendorOffice key={vendor.id} vendor={vendor} />
          ))}

          {properties.map((property) => {
            const point = propertyPoints.get(property.id);
            if (!point) return null;
            return (
              <PropertyMarker
                key={property.id}
                point={point}
                property={property}
                issues={issues}
                resolvedIssues={state.resolvedIssues}
                onClick={onSelectProperty}
              />
            );
          })}

          {state.trucks.map((truck) => (
            <Truck key={truck.routeId} truck={truck} propertyPoints={propertyPoints} />
          ))}
        </div>
      </div>

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
          top: 8,
          right: 8,
          background: 'rgba(26,19,38,0.85)',
          border: '2px solid #1a1326',
          padding: '4px 8px',
          fontFamily: 'VT323, monospace',
          fontSize: '14px',
          color: '#fff1d1',
        }}
      >
        wheel: zoom · drag: pan · dblclick: reset
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
          <span className="dot green"></span>&nbsp;vendor office
        </span>
        <span>
          <span className="dot blue"></span>&nbsp;vendor enroute
        </span>
      </div>
    </div>
  );
}
