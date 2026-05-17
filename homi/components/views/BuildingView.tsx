'use client';

import { useState } from 'react';
import { Pixel } from '../Pixel';
import { DEFAULT_PALETTE, GLYPHS, GLYPHS_HD } from '../sprites';
import { ISSUE_TYPES } from '@/lib/data/issueTypes';
import type { Issue } from '@/lib/data/issues';
import type { Property } from '@/lib/data/properties';
import type { Homie } from '@/lib/data/homies';
import type { DemoState } from '../useEvents';

interface BuildingViewProps {
  property: Property;
  issues: Issue[];
  homies: Homie[];
  state: DemoState;
  dispatchedIssues: Record<string, string>;
  onBack: () => void;
  onTapIssue: (issue: Issue) => void;
  onSelectHomie: (id: string) => void;
}

function BuildingCutaway({
  property,
  issues,
  selectedFloor,
  onSelectFloor,
}: {
  property: Property;
  issues: Issue[];
  selectedFloor: number;
  onSelectFloor: (n: number) => void;
}) {
  const palette = DEFAULT_PALETTE;
  const FLOOR_H = 22;
  const W = 80;
  const floors = property.floors;
  const totalH = floors * FLOOR_H + 14;

  const issuesByFloor: Record<number, Issue[]> = {};
  for (const i of issues) {
    if (i.propertyId !== property.id || i.status === 'resolved') continue;
    (issuesByFloor[i.floor] = issuesByFloor[i.floor] || []).push(i);
  }

  return (
    <svg
      className="pixel-svg"
      width={W * 4}
      height={totalH * 4}
      viewBox={`0 0 ${W} ${totalH}`}
      style={{ display: 'block' }}
    >
      <rect x="0" y="0" width={W} height={totalH} fill="#2b1f3a" />
      <rect x="6" y="0" width="68" height="2" fill={palette.A} />
      <rect x="4" y="2" width="72" height="2" fill={palette.A} />
      <rect x="2" y="4" width="76" height="2" fill={palette.a} />
      <rect x="0" y="6" width="80" height="2" fill={palette.K} />

      {Array.from({ length: floors }).map((_, idx) => {
        const floorNum = floors - idx;
        const y0 = 8 + idx * FLOOR_H;
        const isSel = selectedFloor === floorNum;
        return (
          <g key={floorNum} style={{ cursor: 'pointer' }} onClick={() => onSelectFloor(floorNum)}>
            <rect x="0" y={y0} width={W} height={FLOOR_H} fill={isSel ? palette.Y : palette.W} />
            <rect x="0" y={y0} width={W} height="1" fill={palette.K} />
            <rect x="0" y={y0 + FLOOR_H - 1} width={W} height="1" fill={palette.K} />
            <rect x="0" y={y0} width="1" height={FLOOR_H} fill={palette.K} />
            <rect x={W - 1} y={y0} width="1" height={FLOOR_H} fill={palette.K} />
            <rect x="0" y={y0 + FLOOR_H - 3} width={W} height="2" fill={palette.w} />

            {[10, 26, 42, 58].map((wx) => {
              const lit = (floorNum * 7 + wx) % 3 === 0;
              return (
                <g key={wx}>
                  <rect x={wx} y={y0 + 4} width="12" height="10" fill={palette.K} />
                  <rect
                    x={wx + 1}
                    y={y0 + 5}
                    width="10"
                    height="8"
                    fill={lit ? palette.Y : palette.Q}
                  />
                  <rect x={wx + 5} y={y0 + 5} width="2" height="8" fill={palette.K} />
                  <rect x={wx + 1} y={y0 + 8} width="10" height="1" fill={palette.K} />
                </g>
              );
            })}

            <rect x="2" y={y0 + 2} width="6" height="3" fill={palette.K} />
            <foreignObject x="2" y={y0 + 2} width="6" height="3" style={{ overflow: 'visible' }}>
              <div
               
                style={{
                  fontFamily: 'Press Start 2P, monospace',
                  fontSize: '2.2px',
                  color: '#ffd966',
                  textAlign: 'center',
                  lineHeight: '3px',
                }}
              >
                F{floorNum}
              </div>
            </foreignObject>

            {(issuesByFloor[floorNum] || []).map((iss, k) => {
              const ix = 70 - k * 8;
              const glyph = GLYPHS[ISSUE_TYPES[iss.type].glyph];
              return (
                <foreignObject
                  key={iss.id}
                  x={ix}
                  y={y0 + 2}
                  width="8"
                  height="8"
                  style={{ overflow: 'visible' }}
                >
                  <div className="bob">
                    <Pixel sprite={glyph} scale={1} palette={palette} />
                  </div>
                </foreignObject>
              );
            })}
          </g>
        );
      })}

      <rect x="0" y={8 + floors * FLOOR_H} width={W} height="6" fill={palette.R} />
      <rect x="32" y={8 + floors * FLOOR_H - 6} width="14" height="6" fill={palette.A} />
      <rect x="33" y={8 + floors * FLOOR_H - 5} width="12" height="5" fill={palette.D} />
      <rect x="37" y={8 + floors * FLOOR_H - 2} width="1" height="2" fill={palette.Y} />
    </svg>
  );
}

function IssueCloud({
  x,
  y,
  issue,
  dispatched,
  onTap,
}: {
  x: number;
  y: number;
  issue: Issue;
  dispatched: boolean;
  onTap: () => void;
}) {
  const palette = DEFAULT_PALETTE;
  const type = ISSUE_TYPES[issue.type];
  const glyph = GLYPHS[type.glyph];
  return (
    <g style={{ cursor: 'pointer' }} onClick={onTap}>
      <rect x={x - 7} y={y - 1} width="14" height="8" fill="#ff5555" opacity="0.18" />
      <foreignObject x={x - 6} y={y} width="12" height="6" style={{ overflow: 'visible' }}>
        <div className="bob">
          <Pixel sprite={GLYPHS.cloud} scale={1} palette={palette} />
        </div>
      </foreignObject>
      <foreignObject x={x - 4} y={y - 7} width="8" height="8" style={{ overflow: 'visible' }}>
        <div className="bob">
          <Pixel sprite={glyph} scale={1} palette={palette} />
        </div>
      </foreignObject>
      <foreignObject x={x - 10} y={y + 6} width="20" height="3" style={{ overflow: 'visible' }}>
        <div
         
          style={{
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '2px',
            color: dispatched ? '#6cc24a' : '#ff5555',
            textAlign: 'center',
            textShadow: '0.3px 0.3px 0 #1a1326',
          }}
        >
          {dispatched ? 'HOMIE ENROUTE' : 'TAP TO FIX'}
        </div>
      </foreignObject>
    </g>
  );
}

function FloorPlan({
  property,
  floor,
  issues,
  dispatchedIssues,
  onTapIssue,
}: {
  property: Property;
  floor: number;
  issues: Issue[];
  dispatchedIssues: Record<string, string>;
  onTapIssue: (i: Issue) => void;
}) {
  const palette = DEFAULT_PALETTE;
  const floorIssues = issues.filter(
    (i) => i.propertyId === property.id && i.floor === floor && i.status !== 'resolved',
  );

  const rooms = [
    { id: 'A', x: 6, y: 6, w: 22, h: 16 },
    { id: 'B', x: 30, y: 6, w: 18, h: 16 },
    { id: 'C', x: 6, y: 26, w: 18, h: 16 },
    { id: 'D', x: 26, y: 26, w: 22, h: 16 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="row" style={{ gap: 12 }}>
        <div className="pixel-font" style={{ fontSize: 12, color: 'var(--ui-accent-2)' }}>
          FLOOR {floor} · PLAN
        </div>
        <div className="dim mono-font" style={{ fontSize: 16 }}>
          {floorIssues.length} active {floorIssues.length === 1 ? 'issue' : 'issues'}
        </div>
      </div>

      <svg
        className="pixel-svg"
        width={54 * 8}
        height={48 * 8}
        viewBox="0 0 54 48"
        style={{
          display: 'block',
          background: '#3d2e4a',
          border: '4px solid #1a1326',
          boxShadow: '4px 4px 0 #000',
        }}
      >
        <rect x="0" y="0" width="54" height="48" fill={palette.w} />
        <rect x="6" y="22" width="42" height="4" fill={palette.h} />
        <rect x="26" y="6" width="2" height="36" fill={palette.h} />

        {rooms.map((r) => {
          const roomIss = floorIssues.find((i) => i.room === r.id);
          return (
            <g key={r.id}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={palette.W} />
              <rect x={r.x} y={r.y} width={r.w} height="1" fill={palette.K} />
              <rect x={r.x} y={r.y + r.h - 1} width={r.w} height="1" fill={palette.K} />
              <rect x={r.x} y={r.y} width="1" height={r.h} fill={palette.K} />
              <rect x={r.x + r.w - 1} y={r.y} width="1" height={r.h} fill={palette.K} />
              <rect
                x={r.x + Math.floor(r.w / 2) - 1}
                y={r.y + (r.y < 20 ? r.h - 1 : 0)}
                width="3"
                height="1"
                fill={palette.W}
              />
              <rect x={r.x + 2} y={r.y + 2} width="6" height="4" fill={palette.E} />
              <rect x={r.x + 2} y={r.y + 2} width="6" height="1" fill={palette.e} />
              <rect x={r.x + r.w - 8} y={r.y + r.h - 5} width="6" height="3" fill={palette.D} />
              <rect x={r.x + 2} y={r.y + r.h - 4} width="5" height="2" fill={palette.F} />
              <foreignObject
                x={r.x + 1}
                y={r.y + 1}
                width={r.w - 2}
                height="3"
                style={{ overflow: 'visible' }}
              >
                <div
                 
                  style={{
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '2.4px',
                    color: '#1a1326',
                  }}
                >
                  {r.id}
                </div>
              </foreignObject>

              {roomIss && (
                <IssueCloud
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2 - 2}
                  issue={roomIss}
                  dispatched={!!dispatchedIssues[roomIss.id]}
                  onTap={() => onTapIssue(roomIss)}
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="mono-font" style={{ fontSize: 16, color: 'var(--ui-muted)' }}>
        → tap an issue cloud to dispatch a homie
      </div>
    </div>
  );
}

function BuildingActivity({
  property,
  issues,
  homies,
  state,
  onSelectHomie,
}: {
  property: Property;
  issues: Issue[];
  homies: Homie[];
  state: DemoState;
  onSelectHomie: (id: string) => void;
}) {
  const propIssues = issues.filter((i) => i.propertyId === property.id);
  return (
    <div className="col" style={{ gap: 6 }}>
      {propIssues.length === 0 && <div className="dim">No issues here. All good!</div>}
      {propIssues.map((iss) => {
        const type = ISSUE_TYPES[iss.type];
        const homie = iss.assignedHomie ? homies.find((h) => h.id === iss.assignedHomie) : null;
        const resolved = state.resolvedIssues.includes(iss.id) || iss.status === 'resolved';
        const dispatched = iss.status === 'dispatched';
        const tag = resolved ? (
          <span className="tag success">FIXED</span>
        ) : dispatched ? (
          <span className="tag warn">ENROUTE</span>
        ) : (
          <span className="tag danger">OPEN</span>
        );
        return (
          <div
            key={iss.id}
            className="row"
            style={{
              padding: '8px 10px',
              background: 'var(--ui-bg)',
              border: '2px solid var(--c-line)',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pixel sprite={GLYPHS_HD[type.glyph]} scale={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono-font" style={{ fontSize: 18 }}>
                {type.label} · F{iss.floor} unit {iss.room}
              </div>
              <div className="dim mono-font" style={{ fontSize: 14 }}>
                {iss.ageMin < 60 ? `${iss.ageMin}m ago` : `${Math.floor(iss.ageMin / 60)}h ${iss.ageMin % 60}m ago`}
                {homie ? ` · ${homie.name} on it` : ''}
              </div>
            </div>
            {tag}
            {homie && (
              <button
                className="btn ghost"
                style={{ fontSize: 8 }}
                onClick={() => onSelectHomie(homie.id)}
              >
                VIEW HOMIE
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BuildingView({
  property,
  issues,
  homies,
  state,
  dispatchedIssues,
  onBack,
  onTapIssue,
  onSelectHomie,
}: BuildingViewProps) {
  const [selectedFloor, setSelectedFloor] = useState<number>(() => {
    const first = issues.find((i) => i.propertyId === property.id && i.status !== 'resolved');
    return first ? first.floor : property.floors;
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #0e1024 0%, #2b1f3a 100%)',
        overflow: 'auto',
        padding: '24px 32px',
      }}
    >
      <div className="row" style={{ gap: 16, marginBottom: 18 }}>
        <button className="btn ghost" onClick={onBack}>
          ← MAP
        </button>
        <div className="pixel-font" style={{ fontSize: 16, color: 'var(--ui-accent-2)' }}>
          {property.name.toUpperCase()}
        </div>
        <div className="tag info">{property.neighborhood.toUpperCase()}</div>
        <div className="dim mono-font" style={{ fontSize: 18 }}>
          {property.floors} floors · {property.units} units
        </div>
        <div className="spacer" />
        <div className="stat">
          <span className="num">
            {issues.filter((i) => i.propertyId === property.id && i.status === 'open').length}
          </span>
          <span className="lbl">open</span>
        </div>
        <div className="stat">
          <span className="num">
            {issues.filter((i) => i.propertyId === property.id && i.status === 'dispatched').length}
          </span>
          <span className="lbl">enroute</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 28,
          alignItems: 'start',
        }}
      >
        <div
          className="panel"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <div className="panel-title" style={{ alignSelf: 'flex-start' }}>
            DOLLHOUSE CUTAWAY
          </div>
          <BuildingCutaway
            property={property}
            issues={issues}
            selectedFloor={selectedFloor}
            onSelectFloor={setSelectedFloor}
          />
          <div className="mono-font dim" style={{ fontSize: 16 }}>
            click a floor to inspect
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          <div className="panel">
            <div className="panel-title">FLOOR PLAN</div>
            <FloorPlan
              property={property}
              floor={selectedFloor}
              issues={issues}
              dispatchedIssues={dispatchedIssues}
              onTapIssue={onTapIssue}
            />
          </div>
          <div className="panel">
            <div className="panel-title">LIVE ACTIVITY · {property.name.toUpperCase()}</div>
            <BuildingActivity
              property={property}
              issues={issues}
              homies={homies}
              state={state}
              onSelectHomie={onSelectHomie}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
