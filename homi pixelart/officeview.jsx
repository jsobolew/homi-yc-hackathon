// === Office View ===
// Top-down pixelart office with desks. Each homie sits at a desk, on phone or laptop.
// Click a homie to open the AgentPanel.

function OfficeView({ homies, onSelectHomie, selectedHomieId, palette }) {
  // Layout: 3 rows of 2 desks. Each desk is a pixel sprite area.
  // Desks at fixed (x, y) coords inside an SVG viewBox of 100x70.
  const OFFICE_W = 110;
  const OFFICE_H = 72;

  // Desk positions for desks 0..5
  const desks = [
    { id: 0, x: 18, y: 14 },
    { id: 1, x: 50, y: 14 },
    { id: 2, x: 82, y: 14 },
    { id: 3, x: 18, y: 42 },
    { id: 4, x: 50, y: 42 },
    { id: 5, x: 82, y: 42 },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #2b1f3a 0%, #1a1326 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 24px',
      overflow: 'auto',
    }}>
      <div className="row" style={{ width: '100%', maxWidth: 1180, marginBottom: 14 }}>
        <div className="pixel-font" style={{ fontSize: 14, color: 'var(--ui-accent-2)' }}>
          THE HOMI OFFICE · YOUR AGENTS AT WORK
        </div>
        <div className="spacer" />
        <div className="stat"><span className="num">{homies.filter(h => h.mode === 'phone').length}</span><span className="lbl">on calls</span></div>
        <div className="stat"><span className="num">{homies.filter(h => h.mode === 'browsing' || h.mode === 'laptop').length}</span><span className="lbl">browsing</span></div>
        <div className="stat"><span className="num">{homies.length}</span><span className="lbl">homies</span></div>
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
        {/* Office floor — checkered wood tiles */}
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

        {/* Big window strip along top with sky */}
        <rect x="3"  y="2" width={OFFICE_W - 6} height="6" fill={palette.S} />
        <rect x="3"  y="6" width={OFFICE_W - 6} height="1" fill={palette.K} />
        {/* Window frame divisions */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={'wf'+i} x={3 + i * 17} y="2" width="1" height="6" fill={palette.K} />
        ))}
        {/* Tiny city silhouette behind windows */}
        <rect x="10" y="4" width="3" height="3" fill={palette.k} />
        <rect x="28" y="3" width="2" height="4" fill={palette.k} />
        <rect x="42" y="5" width="4" height="2" fill={palette.k} />
        <rect x="60" y="4" width="3" height="3" fill={palette.k} />
        <rect x="78" y="3" width="2" height="4" fill={palette.k} />
        <rect x="94" y="5" width="3" height="2" fill={palette.k} />

        {/* "HOMI" sign on back wall */}
        <foreignObject x="44" y="9" width="22" height="3" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '2.4px',
            color: '#ffd966',
            textAlign: 'center',
            textShadow: '0.4px 0.4px 0 #000',
          }}>· HOMI HQ ·</div>
        </foreignObject>

        {/* Watercooler in corner */}
        <foreignObject x="4" y="60" width="5" height="9" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <Pixel sprite={window.SPR_WATERCOOLER} scale={1} palette={palette} />
          </div>
        </foreignObject>

        {/* Plants */}
        <foreignObject x={OFFICE_W - 9} y="62" width="5" height="7" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <Pixel sprite={window.SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>
        <foreignObject x="50" y="62" width="5" height="7" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <Pixel sprite={window.SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>

        {/* Desks with homies */}
        {desks.map(d => {
          const homie = homies.find(h => h.desk === d.id);
          if (!homie) return null;
          const mode = homie.mode === 'phone' ? 'phone' : 'laptop';
          const sprite = window.homieDesk(
            ['Y','E','U','G','A','O'][homie.spriteIdx],
            ['A','P','O','E','F','U'][homie.spriteIdx],
            mode,
          );
          const isSelected = selectedHomieId === homie.id;
          return (
            <g
              key={homie.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectHomie(homie.id)}
            >
              {/* Selection ring */}
              {isSelected && (
                <rect x={d.x - 9} y={d.y - 2} width="18" height="18" fill="none" stroke={palette.Y} strokeWidth="0.5" />
              )}
              {/* Activity indicator above head */}
              <foreignObject x={d.x - 8} y={d.y - 8} width="16" height="6" style={{ overflow: 'visible' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                  background: '#1a1326',
                  border: '0.4px solid #ffd966',
                  padding: '0.5px 1px',
                  fontFamily: 'Press Start 2P, monospace',
                  fontSize: '2.2px',
                  color: mode === 'phone' ? '#ff8fb1' : '#6cc24a',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  <div>{homie.name.split(' ')[1]}</div>
                  <div style={{ color: '#fff1d1' }}>{mode === 'phone' ? '☎ on call' : '◍ browsing'}</div>
                </div>
              </foreignObject>

              {/* Homie + desk sprite */}
              <foreignObject x={d.x - 6} y={d.y} width="12" height="14" style={{ overflow: 'visible' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" className={mode === 'phone' ? 'bob' : ''}>
                  <Pixel sprite={sprite} scale={1} palette={palette} />
                </div>
              </foreignObject>

              {/* Chair behind */}
              <rect x={d.x - 4} y={d.y + 14} width="8" height="3" fill={palette.k} />
              <rect x={d.x - 4} y={d.y + 17} width="2" height="3" fill={palette.k} />
              <rect x={d.x + 2} y={d.y + 17} width="2" height="3" fill={palette.k} />
            </g>
          );
        })}

        {/* Center walkway divider */}
        <rect x="0"  y="30" width={OFFICE_W} height="1" fill={palette.K} opacity="0.2" />
      </svg>

      <div className="mono-font dim" style={{ fontSize: 16, marginTop: 12 }}>
        → click a homie to view their live browser or call transcript
      </div>
    </div>
  );
}

Object.assign(window, { OfficeView });
