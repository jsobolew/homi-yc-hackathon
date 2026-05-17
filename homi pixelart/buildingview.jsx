// === Building View ===
// Dollhouse cutaway: building exterior with all floors visible, plus active floor plan.

function BuildingCutaway({ property, issues, selectedFloor, onSelectFloor, palette, scale }) {
  // Draw a side-view cutaway. Each floor is a horizontal band.
  const floors = property.floors;
  const FLOOR_H = 22;            // pixels per floor (sprite-space)
  const W = 80;
  const totalH = floors * FLOOR_H + 14; // +roof

  const issuesByFloor = {};
  for (const i of issues) {
    if (i.propertyId !== property.id || i.status === 'resolved') continue;
    issuesByFloor[i.floor] = issuesByFloor[i.floor] || [];
    issuesByFloor[i.floor].push(i);
  }

  // Roof (peaked)
  return (
    <svg
      className="pixel-svg"
      width={W * scale}
      height={totalH * scale}
      viewBox={`0 0 ${W} ${totalH}`}
      style={{ display: 'block' }}
    >
      {/* Sky behind */}
      <rect x="0" y="0" width={W} height={totalH} fill="#2b1f3a" />

      {/* Roof */}
      <rect x="6"  y="0"  width="68" height="2" fill={palette.A} />
      <rect x="4"  y="2"  width="72" height="2" fill={palette.A} />
      <rect x="2"  y="4"  width="76" height="2" fill={palette.a} />
      <rect x="0"  y="6"  width="80" height="2" fill={palette.K} />

      {/* Chimney */}
      <rect x="58" y="-6" width="6" height="10" fill={palette.A} />
      <rect x="58" y="-6" width="6" height="2"  fill={palette.a} />
      <rect x="58" y="-10" width="6" height="2" fill={palette.h} />

      {/* Floors (from top = highest floor number) */}
      {Array.from({ length: floors }).map((_, idx) => {
        const floorNum = floors - idx;
        const y0 = 8 + idx * FLOOR_H;
        const isSel = selectedFloor === floorNum;
        const isHover = false;
        return (
          <g key={floorNum} style={{ cursor: 'pointer' }} onClick={() => onSelectFloor(floorNum)}>
            {/* Wall */}
            <rect x="0" y={y0} width={W} height={FLOOR_H} fill={isSel ? palette.Y : palette.W} />
            <rect x="0" y={y0} width={W} height="1" fill={palette.K} />
            <rect x="0" y={y0 + FLOOR_H - 1} width={W} height="1" fill={palette.K} />
            <rect x="0" y={y0} width="1" height={FLOOR_H} fill={palette.K} />
            <rect x={W-1} y={y0} width="1" height={FLOOR_H} fill={palette.K} />

            {/* Floor band */}
            <rect x="0" y={y0 + FLOOR_H - 3} width={W} height="2" fill={palette.w} />

            {/* Windows — 4 per floor */}
            {[10, 26, 42, 58].map(wx => {
              const lit = (floorNum * 7 + wx) % 3 === 0;
              return (
                <g key={wx}>
                  <rect x={wx}   y={y0 + 4} width="12" height="10" fill={palette.K} />
                  <rect x={wx+1} y={y0 + 5} width="10" height="8" fill={lit ? palette.Y : palette.Q} />
                  <rect x={wx+5} y={y0 + 5} width="2"  height="8" fill={palette.K} />
                  <rect x={wx+1} y={y0 + 8} width="10" height="1" fill={palette.K} />
                </g>
              );
            })}

            {/* Floor label badge */}
            <rect x="2" y={y0 + 2} width="6" height="3" fill={palette.K} />
            <foreignObject x="2" y={y0 + 2} width="6" height="3" style={{ overflow: 'visible' }}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '2.2px',
                color: '#ffd966',
                textAlign: 'center',
                lineHeight: '3px',
              }}>F{floorNum}</div>
            </foreignObject>

            {/* Issue markers on this floor */}
            {(issuesByFloor[floorNum] || []).map((iss, k) => {
              const ix = 70 - k * 8;
              const glyph = window.GLYPHS[window.ISSUE_TYPES[iss.type].glyph];
              return (
                <foreignObject key={iss.id} x={ix} y={y0 + 2} width="8" height="8" style={{ overflow: 'visible' }}>
                  <div xmlns="http://www.w3.org/1999/xhtml" className="bob">
                    <Pixel sprite={glyph} scale={1} palette={palette} />
                  </div>
                </foreignObject>
              );
            })}
          </g>
        );
      })}

      {/* Ground floor / entrance */}
      <rect x="0" y={8 + floors * FLOOR_H} width={W} height="6" fill={palette.R} />
      <rect x="32" y={8 + floors * FLOOR_H - 6} width="14" height="6" fill={palette.A} />
      <rect x="33" y={8 + floors * FLOOR_H - 5} width="12" height="5" fill={palette.D} />
      <rect x="37" y={8 + floors * FLOOR_H - 2} width="1" height="2" fill={palette.Y} />
    </svg>
  );
}

// --- Floor plan: a top-down room layout for the selected floor ---
function FloorPlan({ property, floor, issues, onTapIssue, palette, dispatchedIssues }) {
  // Generic floor: 4 rooms (A, B, C, D) + hall
  const palette2 = palette;
  const floorIssues = issues.filter(i => i.propertyId === property.id && i.floor === floor && i.status !== 'resolved');

  const rooms = [
    { id: 'A', x: 6,  y: 6,  w: 22, h: 16, label: 'UNIT A · Bed/Bath' },
    { id: 'B', x: 30, y: 6,  w: 18, h: 16, label: 'UNIT B · Studio' },
    { id: 'C', x: 6,  y: 26, w: 18, h: 16, label: 'UNIT C · 1BR' },
    { id: 'D', x: 26, y: 26, w: 22, h: 16, label: 'UNIT D · 2BR' },
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
        style={{ display: 'block', background: '#3d2e4a', border: '4px solid #1a1326', boxShadow: '4px 4px 0 #000' }}
      >
        {/* Floor base */}
        <rect x="0" y="0" width="54" height="48" fill={palette2.w} />
        {/* Hallway */}
        <rect x="6" y="22" width="42" height="4" fill={palette2.h} />
        <rect x="26" y="6"  width="2" height="36" fill={palette2.h} />

        {/* Rooms */}
        {rooms.map(r => {
          const roomIss = floorIssues.find(i => i.room === r.id);
          return (
            <g key={r.id}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={palette2.W} />
              <rect x={r.x} y={r.y} width={r.w} height="1" fill={palette2.K} />
              <rect x={r.x} y={r.y + r.h - 1} width={r.w} height="1" fill={palette2.K} />
              <rect x={r.x} y={r.y} width="1" height={r.h} fill={palette2.K} />
              <rect x={r.x + r.w - 1} y={r.y} width="1" height={r.h} fill={palette2.K} />

              {/* Door notch */}
              <rect x={r.x + Math.floor(r.w/2) - 1} y={r.y + (r.y < 20 ? r.h - 1 : 0)} width="3" height="1" fill={palette2.W} />

              {/* Furniture hints */}
              {/* Bed */}
              <rect x={r.x + 2} y={r.y + 2} width="6" height="4" fill={palette2.E} />
              <rect x={r.x + 2} y={r.y + 2} width="6" height="1" fill={palette2.e} />
              {/* Couch */}
              <rect x={r.x + r.w - 8} y={r.y + r.h - 5} width="6" height="3" fill={palette2.D} />
              {/* Kitchen counter */}
              <rect x={r.x + 2} y={r.y + r.h - 4} width="5" height="2" fill={palette2.F} />

              {/* Room label */}
              <foreignObject x={r.x + 1} y={r.y + 1} width={r.w - 2} height="3" style={{ overflow: 'visible' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                  fontFamily: 'Press Start 2P, monospace',
                  fontSize: '2.4px',
                  color: '#1a1326',
                }}>{r.id}</div>
              </foreignObject>

              {/* Issue cloud */}
              {roomIss && (
                <IssueCloud
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2 - 2}
                  issue={roomIss}
                  palette={palette2}
                  dispatched={!!dispatchedIssues[roomIss.id]}
                  onTap={() => onTapIssue(roomIss)}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend / instruction */}
      <div className="mono-font" style={{ fontSize: 16, color: 'var(--ui-muted)' }}>
        → tap an issue cloud to dispatch a homie
      </div>
    </div>
  );
}

// Tappable cloud with the issue glyph inside.
function IssueCloud({ x, y, issue, palette, onTap, dispatched }) {
  const type = window.ISSUE_TYPES[issue.type];
  const glyph = window.GLYPHS[type.glyph];
  // Place a cloud (12w x 6h) centered, with glyph (8w x ~7h) above
  return (
    <g style={{ cursor: 'pointer' }} onClick={onTap}>
      {/* Pulse halo */}
      <rect x={x - 7} y={y - 1} width="14" height="8" fill="#ff5555" opacity="0.18" />
      {/* The cloud */}
      <foreignObject x={x - 6} y={y} width="12" height="6" style={{ overflow: 'visible' }}>
        <div xmlns="http://www.w3.org/1999/xhtml" className="bob">
          <Pixel sprite={window.GLYPHS.cloud} scale={1} palette={palette} />
        </div>
      </foreignObject>
      {/* The glyph above the cloud */}
      <foreignObject x={x - 4} y={y - 7} width="8" height="8" style={{ overflow: 'visible' }}>
        <div xmlns="http://www.w3.org/1999/xhtml" className="bob">
          <Pixel sprite={glyph} scale={1} palette={palette} />
        </div>
      </foreignObject>
      {/* Status text */}
      <foreignObject x={x - 10} y={y + 6} width="20" height="3" style={{ overflow: 'visible' }}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '2px',
          color: dispatched ? '#6cc24a' : '#ff5555',
          textAlign: 'center',
          textShadow: '0.3px 0.3px 0 #1a1326',
        }}>{dispatched ? 'HOMIE ENROUTE' : 'TAP TO FIX'}</div>
      </foreignObject>
    </g>
  );
}

// --- Main BuildingView ---
function BuildingView({ property, issues, onBack, onTapIssue, dispatchedIssues, onSelectHomie, homies, palette }) {
  const [selectedFloor, setSelectedFloor] = React.useState(() => {
    const first = issues.find(i => i.propertyId === property.id && i.status !== 'resolved');
    return first ? first.floor : property.floors;
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0e1024 0%, #2b1f3a 100%)',
      overflow: 'auto',
      padding: '24px 32px',
    }}>
      {/* Header */}
      <div className="row" style={{ gap: 16, marginBottom: 18 }}>
        <button className="btn ghost" onClick={onBack}>← MAP</button>
        <div className="pixel-font" style={{ fontSize: 16, color: 'var(--ui-accent-2)' }}>
          {property.name.toUpperCase()}
        </div>
        <div className="tag info">{property.neighborhood.toUpperCase()}</div>
        <div className="dim mono-font" style={{ fontSize: 18 }}>
          {property.floors} floors · {property.units} units
        </div>
        <div className="spacer" />
        <div className="stat"><span className="num">{issues.filter(i => i.propertyId === property.id && i.status === 'open').length}</span><span className="lbl">open</span></div>
        <div className="stat"><span className="num">{issues.filter(i => i.propertyId === property.id && i.status === 'dispatched').length}</span><span className="lbl">enroute</span></div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Cutaway */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="panel-title" style={{ alignSelf: 'flex-start' }}>DOLLHOUSE CUTAWAY</div>
          <BuildingCutaway
            property={property}
            issues={issues}
            selectedFloor={selectedFloor}
            onSelectFloor={setSelectedFloor}
            palette={palette}
            scale={4}
          />
          <div className="mono-font dim" style={{ fontSize: 16 }}>
            click a floor to inspect
          </div>
        </div>

        {/* Floor plan + activity */}
        <div className="col" style={{ gap: 18 }}>
          <div className="panel">
            <div className="panel-title">FLOOR PLAN</div>
            <FloorPlan
              property={property}
              floor={selectedFloor}
              issues={issues}
              onTapIssue={onTapIssue}
              palette={palette}
              dispatchedIssues={dispatchedIssues}
            />
          </div>

          {/* Activity feed for this property */}
          <div className="panel">
            <div className="panel-title">LIVE ACTIVITY · {property.name.toUpperCase()}</div>
            <BuildingActivity property={property} issues={issues} homies={homies} onSelectHomie={onSelectHomie} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingActivity({ property, issues, homies, onSelectHomie }) {
  const propIssues = issues.filter(i => i.propertyId === property.id);
  return (
    <div className="col" style={{ gap: 6 }}>
      {propIssues.length === 0 && <div className="dim">No issues here. All good!</div>}
      {propIssues.map(iss => {
        const type = window.ISSUE_TYPES[iss.type];
        const homie = iss.assignedHomie ? homies.find(h => h.id === iss.assignedHomie) : null;
        const statusTag = iss.status === 'resolved'
          ? <span className="tag success">FIXED</span>
          : iss.status === 'dispatched'
          ? <span className="tag warn">ENROUTE</span>
          : <span className="tag danger">OPEN</span>;
        return (
          <div key={iss.id} className="row" style={{
            padding: '8px 10px',
            background: 'var(--ui-bg)',
            border: '2px solid var(--c-line)',
            gap: 12,
          }}>
            <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pixel sprite={window.GLYPHS[type.glyph]} scale={3} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono-font" style={{ fontSize: 18 }}>{type.label} · F{iss.floor} unit {iss.room}</div>
              <div className="dim mono-font" style={{ fontSize: 14 }}>
                {iss.ageMin < 60 ? `${iss.ageMin}m ago` : `${Math.floor(iss.ageMin/60)}h ${iss.ageMin%60}m ago`}
                {homie ? ` · ${homie.name} on it` : ''}
              </div>
            </div>
            {statusTag}
            {homie && (
              <button className="btn ghost" style={{ fontSize: 8 }} onClick={() => onSelectHomie(homie.id)}>VIEW HOMIE</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { BuildingView });
