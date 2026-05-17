// === Homi App ===

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mapScale": 9,
  "officeScale": 8,
  "showLabels": true,
  "vendorFrequency": "normal"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const [view, setView] = React.useState('map'); // map | building | office
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(null);
  const [selectedHomieId, setSelectedHomieId] = React.useState(null);
  const [issues, setIssues] = React.useState(window.INITIAL_ISSUES);
  const [homies, setHomies] = React.useState(window.INITIAL_HOMIES);
  const [dispatchedIssues, setDispatchedIssues] = React.useState({});
  const [toast, setToast] = React.useState(null); // { homie, issue, property }

  const palette = window.DEFAULT_PALETTE;

  const selectedProperty = selectedPropertyId
    ? window.PROPERTIES.find(p => p.id === selectedPropertyId)
    : null;
  const selectedHomie = selectedHomieId ? homies.find(h => h.id === selectedHomieId) : null;
  const homieIssue = selectedHomie && selectedHomie.issueId ? issues.find(i => i.id === selectedHomie.issueId) : null;
  const homieIssueProperty = homieIssue ? window.PROPERTIES.find(p => p.id === homieIssue.propertyId) : null;

  // Cross-navigation: clicking VIEW HOMIE from BuildingView goes to office view
  // but we keep the homie panel open.
  function selectHomie(homieId) {
    setSelectedHomieId(homieId);
    setView('office');
  }

  function selectProperty(propertyId) {
    setSelectedPropertyId(propertyId);
    setView('building');
  }

  // When user taps an issue cloud, auto-dispatch a free homie if not already
  function dispatchHomieToIssue(issue) {
    if (dispatchedIssues[issue.id]) return;

    // Pick a free homie or assign one
    const freeHomie = homies.find(h => !h.issueId || h.issueId === issue.id) || homies[Math.floor(Math.random() * homies.length)];
    setDispatchedIssues(prev => ({ ...prev, [issue.id]: freeHomie.id }));

    // Update issue status
    setIssues(prev => prev.map(i =>
      i.id === issue.id
        ? { ...i, status: 'dispatched', assignedHomie: freeHomie.id }
        : i
    ));

    // Update homie task
    setHomies(prev => prev.map(h =>
      h.id === freeHomie.id
        ? { ...h, mode: 'phone', task: `Negotiating ${window.ISSUE_TYPES[issue.type].label.toLowerCase()} fix`, issueId: issue.id }
        : h
    ));

    const property = window.PROPERTIES.find(p => p.id === issue.propertyId);
    setToast({ homie: freeHomie, issue, property });

    // Schedule resolution
    setTimeout(() => {
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, status: 'resolved' } : i));
    }, 18000);
  }

  return (
    <div className="app">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark"><Pixel sprite={window.SPR_LOGO} scale={2} palette={palette} /></span>
          HOMI<span style={{ color: 'var(--ui-accent)' }}>.</span>
        </div>

        <div className="tabs">
          <button className={'tab ' + (view === 'map' ? 'active' : '')} onClick={() => setView('map')}>SF MAP</button>
          <button className={'tab ' + (view === 'building' ? 'active' : '')} disabled={!selectedProperty} onClick={() => selectedProperty && setView('building')}>
            BUILDING{selectedProperty ? ' · ' + selectedProperty.name.split(' ')[0] : ''}
          </button>
          <button className={'tab ' + (view === 'office' ? 'active' : '')} onClick={() => setView('office')}>HOMIE OFFICE</button>
        </div>

        <div className="topbar-right">
          <div className="stat"><span className="num">{window.PROPERTIES.length}</span><span className="lbl">properties</span></div>
          <div className="stat"><span className="num">{issues.filter(i => i.status === 'open').length}</span><span className="lbl">open</span></div>
          <div className="stat"><span className="num">{issues.filter(i => i.status === 'dispatched').length}</span><span className="lbl">enroute</span></div>
          <div className="stat" style={{ borderColor: 'var(--ui-success)' }}>
            <span className="num" style={{ color: 'var(--ui-success)' }}>${
              (homies.length * 86).toLocaleString()
            }</span><span className="lbl">saved today</span>
          </div>
        </div>
      </div>

      {/* Main stage */}
      <div className="stage">
        {view === 'map' && (
          <MapView
            properties={window.PROPERTIES}
            issues={issues}
            onSelectProperty={selectProperty}
            mapScale={tweaks.mapScale}
            palette={palette}
          />
        )}
        {view === 'building' && selectedProperty && (
          <BuildingView
            property={selectedProperty}
            issues={issues}
            onBack={() => setView('map')}
            onTapIssue={dispatchHomieToIssue}
            dispatchedIssues={dispatchedIssues}
            onSelectHomie={selectHomie}
            homies={homies}
            palette={palette}
          />
        )}
        {view === 'office' && (
          <OfficeView
            homies={homies}
            onSelectHomie={(id) => setSelectedHomieId(id)}
            selectedHomieId={selectedHomieId}
            palette={palette}
          />
        )}

        {/* Agent panel — visible in office view when a homie is selected */}
        {view === 'office' && selectedHomie && (
          <AgentPanel
            homie={selectedHomie}
            issue={homieIssue}
            property={homieIssueProperty}
            onClose={() => setSelectedHomieId(null)}
            palette={palette}
          />
        )}

        {/* Dispatch toast */}
        {toast && (
          <DispatchToast
            homie={toast.homie}
            issue={toast.issue}
            property={toast.property}
            onDone={() => setToast(null)}
          />
        )}
      </div>

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Map view">
            <window.TweakSlider
              label="Map scale (zoom)"
              value={tweaks.mapScale}
              min={5} max={14} step={1}
              onChange={v => setTweak('mapScale', v)}
            />
          </window.TweakSection>
          <window.TweakSection title="Office view">
            <window.TweakSlider
              label="Office scale"
              value={tweaks.officeScale}
              min={4} max={12} step={1}
              onChange={v => setTweak('officeScale', v)}
            />
          </window.TweakSection>
          <window.TweakSection title="Demo">
            <window.TweakButton onClick={() => {
              // Spawn a new random issue
              const prop = window.PROPERTIES[Math.floor(Math.random() * window.PROPERTIES.length)];
              const types = Object.keys(window.ISSUE_TYPES);
              const type = types[Math.floor(Math.random() * types.length)];
              const newIss = {
                id: 'i' + Math.random().toString(36).slice(2, 7),
                propertyId: prop.id,
                floor: Math.ceil(Math.random() * prop.floors),
                room: ['A','B','C','D'][Math.floor(Math.random() * 4)],
                type,
                status: 'open',
                ageMin: 1,
              };
              setIssues(prev => [...prev, newIss]);
            }}>SPAWN ISSUE</window.TweakButton>
            <window.TweakButton onClick={() => {
              setIssues(window.INITIAL_ISSUES);
              setDispatchedIssues({});
              setHomies(window.INITIAL_HOMIES);
            }}>RESET</window.TweakButton>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
