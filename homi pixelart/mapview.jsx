// === SF Map View ===
// Top-down stylized pixelart map of San Francisco.
// ViewBox: 100w x 70h. Scaled up via wrapper transform.

const MAP_W = 100;
const MAP_H = 70;

function MapBackground() {
  // Composes the SF map background as SVG rects.
  // Land shape is built from a few rect bands so the silhouette is roughly SF-like.
  const palette = window.DEFAULT_PALETTE;
  return (
    <g>
      {/* Water everywhere */}
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={palette.B} />
      {/* Deeper bay water (top-right & bottom-right) */}
      <rect x="80" y="0" width="20" height={MAP_H} fill={palette.b} />
      <rect x="0" y="0" width={MAP_W} height="8" fill={palette.b} />
      <rect x="0" y="62" width={MAP_W} height="8" fill={palette.b} />

      {/* === SF Peninsula land === */}
      {/* Main body */}
      <rect x="6"  y="14" width="74" height="46" fill={palette.L} />
      {/* Trim some corners for organic shape */}
      <rect x="6"  y="14" width="6"  height="4"  fill={palette.B} />
      <rect x="74" y="14" width="6"  height="2"  fill={palette.B} />
      <rect x="6"  y="56" width="4"  height="4"  fill={palette.B} />
      <rect x="76" y="58" width="4"  height="2"  fill={palette.B} />
      {/* Coast detail */}
      <rect x="78" y="18" width="2"  height="4"  fill={palette.l} />
      <rect x="6"  y="40" width="2"  height="8"  fill={palette.l} />

      {/* Marin Headlands (top-left land bump above GG bridge) */}
      <rect x="2"  y="0"  width="22" height="10" fill={palette.L} />
      <rect x="2"  y="8"  width="22" height="2"  fill={palette.l} />
      <rect x="0"  y="0"  width="2"  height="6"  fill={palette.B} />
      <rect x="22" y="6"  width="6"  height="4"  fill={palette.L} />

      {/* East Bay sliver */}
      <rect x="92" y="0"  width="8"  height={MAP_H} fill={palette.L} />
      <rect x="92" y="0"  width="2"  height={MAP_H} fill={palette.l} />

      {/* Treasure Island (middle right) */}
      <rect x="84" y="26" width="6"  height="6"  fill={palette.L} />
      <rect x="84" y="30" width="6"  height="2"  fill={palette.l} />

      {/* === Parks === */}
      {/* Golden Gate Park (huge horizontal park) */}
      <rect x="10" y="38" width="22" height="4"  fill={palette.G} />
      <rect x="10" y="42" width="22" height="2"  fill={palette.g} />
      {/* Presidio (top left forest) */}
      <rect x="8"  y="14" width="14" height="8"  fill={palette.G} />
      <rect x="8"  y="20" width="14" height="2"  fill={palette.g} />
      {/* Twin Peaks */}
      <rect x="36" y="40" width="6"  height="4"  fill={palette.G} />
      <rect x="38" y="38" width="2"  height="2"  fill={palette.g} />
      {/* Mission Dolores Park */}
      <rect x="34" y="48" width="4"  height="3"  fill={palette.G} />
      {/* Alamo Square (where painted ladies are) */}
      <rect x="40" y="34" width="4"  height="3"  fill={palette.G} />

      {/* === Roads (grid) === */}
      {/* Horizontal */}
      {[18, 24, 30, 46, 52, 58].map(y => (
        <rect key={'h'+y} x="6" y={y} width="74" height="1" fill={palette.R} />
      ))}
      {/* Vertical */}
      {[16, 22, 28, 34, 48, 54, 60, 66, 72].map(x => (
        <rect key={'v'+x} x={x} y="14" width="1" height="46" fill={palette.R} />
      ))}
      {/* Market St diagonal (SF's signature) — approximated as a series of pixels */}
      {Array.from({length: 28}).map((_, i) => (
        <rect key={'mkt'+i} x={42 + i} y={50 - Math.floor(i*0.6)} width="1" height="1" fill={palette.R} />
      ))}

      {/* === Sand / beach edge (Ocean Beach) === */}
      <rect x="6"  y="22" width="2"  height="14" fill={palette.Y} opacity="0.6" />
      <rect x="6"  y="22" width="2"  height="14" fill={palette.L} />

      {/* === Boats === */}
      <rect x="50" y="4"  width="3"  height="1" fill={palette.W} />
      <rect x="51" y="3"  width="1"  height="1" fill={palette.W} />
      <rect x="60" y="6"  width="3"  height="1" fill={palette.A} />
      <rect x="84" y="48" width="3"  height="1" fill={palette.W} />
      <rect x="85" y="47" width="1"  height="1" fill={palette.W} />
    </g>
  );
}

// --- Landmark labels with pixel-text feel (small text floating near landmark) ---
function MapLabel({ x, y, text, color = '#1a1326' }) {
  return (
    <foreignObject x={x} y={y} width="60" height="6" style={{ overflow: 'visible' }}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={{
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '2.4px',
        color: color,
        textShadow: '0.4px 0.4px 0 #fff1d1',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}>{text}</div>
    </foreignObject>
  );
}

// --- Animated truck moving along a route ---
function MapTruck({ route, palette, onArrive, speed = 0.4 }) {
  const [t, setT] = React.useState(0);
  const [showMoney, setShowMoney] = React.useState(false);

  React.useEffect(() => {
    if (t >= 1) return;
    const id = setInterval(() => {
      setT(prev => {
        const next = prev + 0.012 * speed * 4;
        if (next >= 1) {
          setShowMoney(true);
          setTimeout(() => onArrive && onArrive(), 1800);
          return 1;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(id);
  }, [t, speed, onArrive]);

  const x = route.from.x + (route.to.x - route.from.x) * t;
  const y = route.from.y + (route.to.y - route.from.y) * t;
  const facing = route.to.x >= route.from.x ? 1 : -1;

  const sprMap = {
    plumb: window.SPR_VAN_PLUMB,
    elec:  window.SPR_VAN_ELEC,
    hvac:  window.SPR_VAN_HVAC,
    pest:  window.SPR_VAN_PEST,
  };
  const sprite = sprMap[route.vendor.spriteKey] || window.SPR_VAN_PLUMB;

  return (
    <g transform={`translate(${x - 7}, ${y - 4})`}>
      <foreignObject x="0" y="0" width="14" height="8" style={{ overflow: 'visible' }}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ transform: facing < 0 ? 'scaleX(-1)' : 'none', transformOrigin: 'center' }}>
          <Pixel sprite={sprite} scale={1} palette={palette} />
        </div>
      </foreignObject>
      {showMoney && (
        <foreignObject x="0" y="-10" width="40" height="8" style={{ overflow: 'visible' }}>
          <div xmlns="http://www.w3.org/1999/xhtml" className="float-money" style={{ left: 7 + 'px', position: 'relative', fontSize: '2.6px', whiteSpace: 'nowrap' }}>
            ${Math.round(route.vendor.baseQuote * (0.85 + Math.random() * 0.2))}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// --- A property marker on the map ---
function PropertyMarker({ property, issues, onClick, palette }) {
  const propIssues = issues.filter(i => i.propertyId === property.id && i.status !== 'resolved');
  const variant = window.MARKER_VARIANTS[property.variant];
  // The marker sprite is 10w x 9h. Center it on the property point.
  return (
    <foreignObject
      x={property.x - 5}
      y={property.y - 9}
      width="10"
      height="11"
      style={{ overflow: 'visible', cursor: 'pointer' }}
      onClick={() => onClick(property.id)}
    >
      <div xmlns="http://www.w3.org/1999/xhtml" style={{ position: 'relative' }}>
        <Pixel sprite={variant} scale={1} palette={palette} />
        {propIssues.length > 0 && (
          <div style={{
            position: 'absolute',
            top: -4, right: -2,
            width: 4, height: 4,
            background: '#ff5555',
            border: '0.5px solid #1a1326',
            borderRadius: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '2.4px',
            color: 'white',
            lineHeight: '4px',
            textAlign: 'center',
          }} className="pulse">
            {propIssues.length}
          </div>
        )}
      </div>
    </foreignObject>
  );
}

// --- Vendor logo popup that appears briefly when a homie sources/negotiates ---
function VendorPopup({ vendor, x, y, onDone }) {
  React.useEffect(() => {
    const id = setTimeout(onDone, 4200);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <foreignObject x={x - 16} y={y - 14} width="32" height="14" style={{ overflow: 'visible' }}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={{
        background: '#1a1326',
        border: '0.4px solid #ffd966',
        padding: '0.6px 1px',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '2.2px',
        color: '#ffd966',
        whiteSpace: 'nowrap',
        boxShadow: '1px 1px 0 #000',
        animation: 'float-up 4.2s ease-out forwards',
      }}>
        <div>{vendor.name}</div>
        <div style={{ color: '#b6f0a0' }}>quote ${vendor.baseQuote}</div>
      </div>
    </foreignObject>
  );
}

// --- Main MapView ---
function MapView({ properties, issues, onSelectProperty, mapScale, palette }) {
  const [trucks, setTrucks] = React.useState(() => window.makeTruckRoutes().map((r, i) => ({ ...r, key: 'init-'+i })));
  const [popups, setPopups] = React.useState([]);
  const wrapperRef = React.useRef(null);
  const [fitScale, setFitScale] = React.useState(mapScale);

  // Auto-fit: pick the largest integer scale that fits the available stage,
  // capped to user's mapScale setting.
  React.useEffect(() => {
    function recompute() {
      if (!wrapperRef.current) return;
      const parent = wrapperRef.current.parentElement;
      if (!parent) return;
      const availW = parent.clientWidth  - 48;
      const availH = parent.clientHeight - 48;
      const maxS = Math.min(Math.floor(availW / MAP_W), Math.floor(availH / MAP_H));
      setFitScale(Math.max(3, Math.min(maxS, mapScale)));
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [mapScale]);

  // Periodically spawn new trucks
  React.useEffect(() => {
    const id = setInterval(() => {
      const routes = window.makeTruckRoutes();
      const r = routes[Math.floor(Math.random() * routes.length)];
      setTrucks(prev => [...prev, { ...r, key: 'k-' + Math.random() }]);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Periodically pop a vendor quote bubble somewhere
  React.useEffect(() => {
    const id = setInterval(() => {
      const v = window.VENDORS[Math.floor(Math.random() * window.VENDORS.length)];
      const p = properties[Math.floor(Math.random() * properties.length)];
      const key = 'pop-' + Math.random();
      setPopups(prev => [...prev, { key, vendor: v, x: p.x, y: p.y - 18 }]);
    }, 3800);
    return () => clearInterval(id);
  }, [properties]);

  const effectiveScale = fitScale;

  // Stage container scales viewBox up so pixels render chunky.
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0e1024 0%, #2b1f3a 100%)',
      overflow: 'hidden',
    }}>
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <svg
          className="pixel-svg"
          width={MAP_W * effectiveScale}
          height={MAP_H * effectiveScale}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ display: 'block', border: '4px solid #1a1326', boxShadow: '6px 6px 0 #000' }}
        >
          <MapBackground />

          {/* Landmark: Golden Gate Bridge (placed across the gap in NW) */}
          <g transform="translate(-2, -2)">
            <foreignObject x="0" y="0" width="40" height="22" style={{ overflow: 'visible' }}>
              <div xmlns="http://www.w3.org/1999/xhtml">
                <Pixel sprite={window.SPR_GG_BRIDGE} scale={1} palette={palette} />
              </div>
            </foreignObject>
          </g>

          {/* Bay Bridge (east, across) */}
          <foreignObject x="68" y="29" width="28" height="8" style={{ overflow: 'visible' }}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <Pixel sprite={window.SPR_BAY_BRIDGE} scale={1} palette={palette} />
            </div>
          </foreignObject>

          {/* Transamerica Pyramid */}
          <foreignObject x="57" y="14" width="14" height="25" style={{ overflow: 'visible' }}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <Pixel sprite={window.SPR_TRANSAM} scale={1} palette={palette} />
            </div>
          </foreignObject>

          {/* Coit Tower */}
          <foreignObject x="56" y="10" width="8" height="18" style={{ overflow: 'visible' }}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <Pixel sprite={window.SPR_COIT} scale={1} palette={palette} />
            </div>
          </foreignObject>

          {/* Painted Ladies */}
          <foreignObject x="38" y="32" width="20" height="12" style={{ overflow: 'visible' }}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <Pixel sprite={window.SPR_PAINTED} scale={1} palette={palette} />
            </div>
          </foreignObject>

          {/* Ferry Building */}
          <foreignObject x="72" y="22" width="10" height="16" style={{ overflow: 'visible' }}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <Pixel sprite={window.SPR_FERRY} scale={1} palette={palette} />
            </div>
          </foreignObject>

          {/* Some trees in the Presidio + GG Park */}
          {[
            [10, 14], [13, 16], [17, 14], [20, 16],
            [12, 38], [16, 38], [20, 38], [24, 38], [28, 38],
            [37, 41], [40, 41], [36, 49],
          ].map(([tx, ty], i) => (
            <foreignObject key={'t'+i} x={tx} y={ty} width="6" height="6" style={{ overflow: 'visible' }}>
              <div xmlns="http://www.w3.org/1999/xhtml">
                <Pixel sprite={window.SPR_TREE} scale={1} palette={palette} />
              </div>
            </foreignObject>
          ))}

          {/* Landmark labels — kept inside map bounds */}
          <MapLabel x="3"  y="11" text="MARIN" />
          <MapLabel x="8"  y="44" text="GG PARK" />
          <MapLabel x="14" y="30" text="SUNSET" />
          <MapLabel x="34" y="20" text="MARINA" />
          <MapLabel x="36" y="46" text="TWIN PEAKS" />
          <MapLabel x="44" y="36" text="ALAMO SQ" />
          <MapLabel x="46" y="56" text="MISSION" />
          <MapLabel x="58" y="42" text="SoMa" />
          <MapLabel x="64" y="20" text="FINANCIAL" />
          <MapLabel x="76" y="48" text="BAY BRIDGE" />

          {/* Properties */}
          {properties.map(p => (
            <PropertyMarker
              key={p.id}
              property={p}
              issues={issues}
              onClick={onSelectProperty}
              palette={palette}
            />
          ))}

          {/* Trucks */}
          {trucks.map(tr => (
            <MapTruck
              key={tr.key}
              route={tr}
              palette={palette}
              onArrive={() => setTrucks(prev => prev.filter(x => x.key !== tr.key))}
            />
          ))}

          {/* Vendor popups */}
          {popups.map(p => (
            <VendorPopup
              key={p.key}
              vendor={p.vendor}
              x={p.x}
              y={p.y}
              onDone={() => setPopups(prev => prev.filter(x => x.key !== p.key))}
            />
          ))}
        </svg>

        {/* Compass / scale chip */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(26,19,38,0.85)',
          border: '2px solid #ffd966',
          padding: '4px 8px',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '8px',
          color: '#ffd966',
        }}>SAN&nbsp;FRANCISCO · OPS&nbsp;LIVE</div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(26,19,38,0.9)',
          border: '2px solid #1a1326',
          padding: '6px 10px',
          fontFamily: 'VT323, monospace',
          fontSize: '14px',
          color: '#fff1d1',
          display: 'flex', gap: 14,
        }}>
          <span><span className="dot red"></span>&nbsp;issue</span>
          <span><span className="dot yellow"></span>&nbsp;property</span>
          <span><span className="dot green"></span>&nbsp;homie working</span>
          <span><span className="dot blue"></span>&nbsp;vendor enroute</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MapView });
