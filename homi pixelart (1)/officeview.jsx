// === Office View ===
// Top-down pixelart office with desks. Each homie sits at a desk, on phone or laptop.
// Click a homie to open the AgentPanel.

function OfficeView({ homies, onSelectHomie, selectedHomieId, palette }) {
  // Layout: 2 rows of 3 desks. Smaller viewBox = bigger homies on screen.
  const OFFICE_W = 110;
  const OFFICE_H = 84;

  // Desk positions for desks 0..5 (top-left corner of each homie sprite).
  // Homies are 24 wide; spread them across the office with margins.
  const desks = [
    { id: 0, x: 9,  y: 22 },
    { id: 1, x: 43, y: 22 },
    { id: 2, x: 77, y: 22 },
    { id: 3, x: 9,  y: 54 },
    { id: 4, x: 43, y: 54 },
    { id: 5, x: 77, y: 54 },
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

      {/* Sponsor strip — visible feature card for the hackathon */}
      <div style={{
        width: '100%', maxWidth: 1180,
        marginBottom: 12,
        padding: '10px 16px',
        background: 'linear-gradient(90deg, #0e1024 0%, #2b1f3a 50%, #0e1024 100%)',
        border: '3px solid var(--ui-border)',
        boxShadow: '4px 4px 0 var(--c-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div className="pixel-font" style={{ fontSize: 10, color: 'var(--ui-accent-2)', whiteSpace: 'nowrap' }}>
          POWERED BY
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {homies.map(h => {
            const def = window.HOMIE_HD_DEFS[h.spriteIdx];
            const sponsor = def && def.sponsor;
            const entry = sponsor && window.SPONSORS[sponsor];
            if (!entry) return null;
            return (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 8px',
                background: 'var(--ui-panel)',
                border: '2px solid var(--c-line)',
              }}>
                <window.SponsorLogo keyName={sponsor} size={48} pixelated={true} />
                <div className="col" style={{ gap: 0 }}>
                  <div className="pixel-font" style={{ fontSize: 9, color: 'var(--ui-accent-2)' }}>{entry.name.toUpperCase()}</div>
                  <div className="mono-font dim" style={{ fontSize: 13 }}>{h.name.split(' ')[1]}'s homie</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <svg
        className="pixel-svg"
        width={OFFICE_W * 9}
        height={OFFICE_H * 9}
        viewBox={`0 0 ${OFFICE_W} ${OFFICE_H}`}
        style={{
          display: 'block',
          border: '4px solid #1a1326',
          boxShadow: '6px 6px 0 #000',
          background: '#3d2e4a',
          maxWidth: '100%',
          height: 'auto',
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
        <rect x="3"  y="2" width={OFFICE_W - 6} height="10" fill={palette.S} />
        <rect x="3"  y="11" width={OFFICE_W - 6} height="1" fill={palette.K} />
        {/* Window frame divisions */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={'wf'+i} x={3 + i * 18} y="2" width="1" height="10" fill={palette.K} />
        ))}
        {/* Tiny city silhouette behind windows */}
        <rect x="10" y="6"  width="3" height="5" fill={palette.k} />
        <rect x="24" y="4"  width="2" height="7" fill={palette.k} />
        <rect x="38" y="7"  width="5" height="4" fill={palette.k} />
        <rect x="56" y="5"  width="3" height="6" fill={palette.k} />
        <rect x="72" y="3"  width="2" height="8" fill={palette.k} />
        <rect x="86" y="6"  width="4" height="5" fill={palette.k} />
        <rect x="98" y="4"  width="2" height="7" fill={palette.k} />

        {/* "HOMI HQ" sign on back wall */}
        <foreignObject x="40" y="14" width="30" height="5" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '3.6px',
            color: '#ffd966',
            textAlign: 'center',
            textShadow: '0.5px 0.5px 0 #000',
            letterSpacing: '0.5px',
          }}>· HOMI HQ ·</div>
        </foreignObject>

        {/* Watercooler in corner */}
        <foreignObject x="4" y="72" width="6" height="11" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <Pixel sprite={window.SPR_WATERCOOLER} scale={1} palette={palette} />
          </div>
        </foreignObject>

        {/* Plants */}
        <foreignObject x={OFFICE_W - 10} y="75" width="6" height="9" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <Pixel sprite={window.SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>
        <foreignObject x="52" y="75" width="6" height="9" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <Pixel sprite={window.SPR_PLANT} scale={1} palette={palette} />
          </div>
        </foreignObject>

        {/* Mid wall divider line */}
        <rect x="3" y="44" width={OFFICE_W - 6} height="1" fill={palette.K} opacity="0.2" />

        {/* Desks with homies */}
        {desks.map(d => {
          const homie = homies.find(h => h.desk === d.id);
          if (!homie) return null;
          const mode = homie.mode === 'phone' ? 'phone' : 'laptop';
          const isSelected = selectedHomieId === homie.id;
          return (
            <g
              key={homie.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectHomie(homie.id)}
            >
              {/* Selection ring */}
              {isSelected && (
                <rect
                  x={d.x - 2} y={d.y - 2}
                  width="28" height="32"
                  fill="none"
                  stroke={palette.Y}
                  strokeWidth="0.6"
                  strokeDasharray="1.4 1"
                />
              )}

              {/* Status badge above head */}
              <foreignObject x={d.x - 4} y={d.y - 14} width="32" height="12" style={{ overflow: 'visible' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
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
                }}>
                  <div style={{ color: '#fff1d1' }}>{homie.name.split(' ')[1].toUpperCase()}</div>
                  <div>{mode === 'phone' ? '☎ ON CALL' : '◍ BROWSING'}</div>
                </div>
              </foreignObject>

              {/* HD homie + desk sprite (composite — embeds sponsor logo) */}
              <foreignObject x={d.x} y={d.y} width="24" height="28" style={{ overflow: 'visible' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" className={mode === 'phone' ? 'bob' : ''}>
                  <window.HomieDeskHD defIdx={homie.spriteIdx} mode={mode} scale={1} palette={palette} />
                </div>
              </foreignObject>

              {/* Chair back behind the desk */}
              <rect x={d.x + 4} y={d.y + 26} width="16" height="3" fill={palette.k} />
              <rect x={d.x + 4} y={d.y + 29} width="3"  height="4" fill={palette.k} />
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

Object.assign(window, { OfficeView });
