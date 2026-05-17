// === Agent Panel ===
// Slides in from the right when a homie is selected.
// Shows their live activity: phone transcript and/or browser pages.

function useStreamingLines(lines, intervalMs = 1400) {
  const [visible, setVisible] = React.useState(1);
  React.useEffect(() => {
    setVisible(1);
  }, [lines]);
  React.useEffect(() => {
    if (visible >= lines.length) return;
    const id = setTimeout(() => setVisible(v => Math.min(v + 1, lines.length)), intervalMs);
    return () => clearTimeout(id);
  }, [visible, lines, intervalMs]);
  return lines.slice(0, visible);
}

function PhoneTranscript({ transcript }) {
  const linesToShow = useStreamingLines(transcript.lines, 1500);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [linesToShow.length]);

  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        <Pixel sprite={window.GLYPHS.phone} scale={3} />
        <div>
          <div className="pixel-font" style={{ fontSize: 9, color: 'var(--ui-accent)' }}>LIVE CALL</div>
          <div className="mono-font" style={{ fontSize: 16 }}>{transcript.callee}</div>
        </div>
        <div className="spacer" />
        <div className="tag danger blink">REC</div>
      </div>
      <div className="console" ref={ref}>
        {linesToShow.map((ln, i) => (
          <div key={i} className={'line ' + ln.who}>
            <span className="dim">{ln.who === 'sys' ? '*' : ln.who === 'you' ? 'homie:' : 'them:'}</span>
            {' '}{ln.t}
          </div>
        ))}
        {linesToShow.length < transcript.lines.length && (
          <div className="line dim blink">▌</div>
        )}
      </div>
    </div>
  );
}

function BrowserPreview({ transcript }) {
  const [pageIdx, setPageIdx] = React.useState(0);
  const linesToShow = useStreamingLines(transcript.lines, 1300);

  // Advance page when half of lines are visible
  React.useEffect(() => {
    if (transcript.pages && transcript.pages.length > 1) {
      if (linesToShow.length >= Math.ceil(transcript.lines.length / 2)) {
        setPageIdx(1);
      } else {
        setPageIdx(0);
      }
    }
  }, [linesToShow.length, transcript]);

  const page = transcript.pages ? transcript.pages[pageIdx] : null;

  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        <Pixel sprite={window.GLYPHS.laptop} scale={3} />
        <div>
          <div className="pixel-font" style={{ fontSize: 9, color: 'var(--ui-accent-2)' }}>LIVE BROWSER</div>
          <div className="mono-font" style={{ fontSize: 16 }}>homie is browsing the web</div>
        </div>
      </div>

      {/* Browser window */}
      <div className="browser">
        <div className="browser-bar">
          <div className="browser-dot"></div>
          <div className="browser-dot y"></div>
          <div className="browser-dot g"></div>
          <div className="browser-url">{page ? page.url : transcript.url}</div>
        </div>
        <div className="browser-body">
          {page && page.body.map((line, i) => (
            <div key={i} style={{
              fontFamily: 'VT323, monospace',
              color: line.startsWith('>') ? '#c14a4a' : line.startsWith('TOP') || line.startsWith('BOOKING') || line.startsWith('VENDOR') || line.startsWith('SPARKLEPROS') || line.startsWith('DIAMOND') || line.startsWith('RICKY') || line.startsWith('NEW') || line.startsWith('BUGOUT') ? '#1a1326' : '#3d2e4a',
              fontWeight: line.startsWith('TOP') || line.startsWith('BOOKING') || line.startsWith('VENDOR') ? 'bold' : 'normal',
            }}>{line || '\u00a0'}</div>
          ))}
        </div>
      </div>

      {/* Action log below */}
      <div className="console">
        {linesToShow.map((ln, i) => (
          <div key={i} className={'line sys'}>
            <span className="dim">*</span> {ln.t}
          </div>
        ))}
        {linesToShow.length < transcript.lines.length && <div className="line dim blink">▌</div>}
      </div>
    </div>
  );
}

function AgentPanel({ homie, issue, property, onClose, palette }) {
  const transcript = window.TRANSCRIPTS[homie.id];
  const sprite = window.HOMIE_SPRITES[homie.spriteIdx];

  return (
    <div className="side-panel" style={{ width: 420 }}>
      <div className="panel" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 12,
          background: 'linear-gradient(180deg, var(--ui-panel-2) 0%, var(--ui-panel) 100%)',
          borderBottom: '3px solid var(--c-line)',
        }}>
          <div style={{ background: 'var(--c-line)', padding: 4 }}>
            <Pixel sprite={sprite} scale={3} palette={palette} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="pixel-font" style={{ fontSize: 10, color: 'var(--ui-accent-2)' }}>{homie.name.toUpperCase()}</div>
            <div className="mono-font dim" style={{ fontSize: 16 }}>{homie.role}</div>
            <div className="mono-font" style={{ fontSize: 16, color: 'var(--ui-text)' }}>{homie.task}</div>
          </div>
          <button className="btn ghost" style={{ fontSize: 8 }} onClick={onClose}>✕</button>
        </div>

        {/* Context */}
        {issue && property && (
          <div style={{
            padding: '8px 12px',
            background: 'var(--ui-bg)',
            borderBottom: '3px solid var(--c-line)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <Pixel sprite={window.GLYPHS[window.ISSUE_TYPES[issue.type].glyph]} scale={3} />
            <div className="col" style={{ gap: 0, flex: 1 }}>
              <div className="mono-font" style={{ fontSize: 16 }}>
                {window.ISSUE_TYPES[issue.type].label}
              </div>
              <div className="dim mono-font" style={{ fontSize: 14 }}>
                {property.name} · F{issue.floor} unit {issue.room}
              </div>
            </div>
            <span className="tag warn">ACTIVE</span>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 12 }}>
          {transcript && transcript.kind === 'phone' && <PhoneTranscript transcript={transcript} />}
          {transcript && transcript.kind === 'browser' && <BrowserPreview transcript={transcript} />}
        </div>
      </div>
    </div>
  );
}

// Simpler floating notification when a homie is dispatched
function DispatchToast({ homie, issue, property, onDone }) {
  React.useEffect(() => {
    const id = setTimeout(onDone, 3600);
    return () => clearTimeout(id);
  }, [onDone]);
  const sprite = window.HOMIE_SPRITES[homie.spriteIdx];
  return (
    <div style={{
      position: 'absolute',
      bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--ui-panel)',
      border: '3px solid var(--ui-accent-2)',
      boxShadow: '4px 4px 0 var(--c-dark)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 50,
    }}>
      <Pixel sprite={sprite} scale={3} />
      <div className="col" style={{ gap: 2 }}>
        <div className="pixel-font" style={{ fontSize: 10, color: 'var(--ui-accent-2)' }}>HOMIE DISPATCHED</div>
        <div className="mono-font" style={{ fontSize: 16 }}>
          {homie.name} → {window.ISSUE_TYPES[issue.type].label} · {property.name}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AgentPanel, DispatchToast });
