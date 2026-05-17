'use client';

import { useEffect, useRef } from 'react';
import { Pixel } from '../Pixel';
import { HomieHD } from '../HomieHD';
import { SPONSORS, type SponsorKey } from '../SponsorLogo';
import { SponsorLogo } from '../SponsorLogo';
import { GLYPHS_HD, HOMIE_HD_DEFS, DEFAULT_PALETTE } from '../sprites';
import type { Homie } from '@/lib/data/homies';
import type { HomieRuntime } from '../useEvents';
import type { Issue } from '@/lib/data/issues';
import type { Property } from '@/lib/data/properties';
import { ISSUE_TYPES } from '@/lib/data/issueTypes';

interface AgentPanelProps {
  homie: Homie;
  runtime: HomieRuntime | undefined;
  issue?: Issue | null;
  property?: Property | null;
  onClose: () => void;
}

function TranscriptPanel({ runtime }: { runtime: HomieRuntime | undefined }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lines = runtime?.transcript ?? [];

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);

  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        <Pixel sprite={GLYPHS_HD.phone} scale={3} />
        <div>
          <div className="pixel-font" style={{ fontSize: 9, color: 'var(--ui-accent)' }}>
            LIVE TRANSCRIPT
          </div>
          <div className="mono-font" style={{ fontSize: 16 }}>{runtime?.task || 'idle'}</div>
        </div>
        <div className="spacer" />
        {runtime?.status === 'running' && <div className="tag danger blink">REC</div>}
        {runtime?.status === 'done' && <div className="tag success">DONE</div>}
      </div>
      <div className="console" ref={ref}>
        {lines.map((ln, i) => (
          <div key={i} className={`line ${ln.who}`}>
            <span className="dim">
              {ln.who === 'sys' ? '*' : ln.who === 'you' ? 'homie:' : 'them:'}
            </span>{' '}
            {ln.text}
          </div>
        ))}
        {runtime?.status === 'running' && lines.length === 0 && (
          <div className="line dim blink">▌</div>
        )}
        {runtime?.summary && runtime.status === 'done' && (
          <div className="line" style={{ color: '#ffd966', marginTop: 6 }}>
            ⇒ {runtime.summary}
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserPanel({ runtime }: { runtime: HomieRuntime | undefined }) {
  const pages = runtime?.browserPages ?? [];
  const lastPage = pages[pages.length - 1];
  const lines = runtime?.transcript ?? [];

  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        <Pixel sprite={GLYPHS_HD.laptop} scale={3} />
        <div>
          <div className="pixel-font" style={{ fontSize: 9, color: 'var(--ui-accent-2)' }}>
            LIVE BROWSER
          </div>
          <div className="mono-font" style={{ fontSize: 16 }}>{runtime?.task || 'idle'}</div>
        </div>
        <div className="spacer" />
        {runtime?.status === 'running' && <div className="tag warn">WORKING</div>}
        {runtime?.status === 'done' && <div className="tag success">DONE</div>}
      </div>

      <div className="browser">
        <div className="browser-bar">
          <div className="browser-dot"></div>
          <div className="browser-dot y"></div>
          <div className="browser-dot g"></div>
          <div className="browser-url">{lastPage?.url || runtime?.currentUrl || 'about:blank'}</div>
        </div>
        <div className="browser-body">
          {lastPage?.body.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'VT323, monospace',
                color: line.startsWith('>') ? '#c14a4a' : line.toUpperCase() === line && line.length > 4 ? '#1a1326' : '#3d2e4a',
                fontWeight: line.toUpperCase() === line && line.length > 4 ? 'bold' : 'normal',
              }}
            >
              {line || ' '}
            </div>
          )) || <div style={{ color: '#8a6d3a' }}>loading…</div>}
        </div>
      </div>

      <div className="console">
        {lines.map((ln, i) => (
          <div key={i} className="line sys">
            <span className="dim">*</span> {ln.text}
          </div>
        ))}
        {runtime?.status === 'running' && lines.length === 0 && (
          <div className="line dim blink">▌</div>
        )}
        {runtime?.summary && runtime.status === 'done' && (
          <div className="line" style={{ color: '#ffd966', marginTop: 6 }}>
            ⇒ {runtime.summary}
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryPanel({ runtime }: { runtime: HomieRuntime | undefined }) {
  const lines = runtime?.transcript ?? [];
  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        <Pixel sprite={GLYPHS_HD.money} scale={3} />
        <div>
          <div className="pixel-font" style={{ fontSize: 9, color: 'var(--ui-accent-2)' }}>
            SHARED MEMORY · SUPERMEMORY
          </div>
          <div className="mono-font" style={{ fontSize: 16 }}>{runtime?.task || 'idle'}</div>
        </div>
        <div className="spacer" />
        {runtime?.status === 'running' && <div className="tag warn">SYNCING</div>}
        {runtime?.status === 'done' && <div className="tag success">DONE</div>}
      </div>

      {runtime?.lastMemoryRead && (
        <div className="panel" style={{ padding: 8 }}>
          <div className="panel-title" style={{ fontSize: 8 }}>READ</div>
          <div className="mono-font" style={{ fontSize: 15 }}>q: {runtime.lastMemoryRead.query}</div>
          <div className="mono-font" style={{ fontSize: 15, color: '#ffd966' }}>
            ⇒ {runtime.lastMemoryRead.result}
          </div>
        </div>
      )}
      {runtime?.lastMemoryWrite && (
        <div className="panel" style={{ padding: 8 }}>
          <div className="panel-title" style={{ fontSize: 8 }}>WRITE</div>
          <div className="mono-font" style={{ fontSize: 15 }}>{runtime.lastMemoryWrite.key}</div>
          <div className="mono-font" style={{ fontSize: 15, color: '#b6f0a0' }}>
            {runtime.lastMemoryWrite.value}
          </div>
        </div>
      )}

      <div className="console">
        {lines.map((ln, i) => (
          <div key={i} className="line sys">
            <span className="dim">*</span> {ln.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentPanel({ homie, runtime, issue, property, onClose }: AgentPanelProps) {
  const palette = DEFAULT_PALETTE;
  const def = HOMIE_HD_DEFS[homie.spriteIdx];
  const sponsorKey = def?.sponsor as SponsorKey | undefined;
  const sponsor = sponsorKey ? SPONSORS[sponsorKey] : null;

  let body: React.ReactNode;
  if (homie.id === 'brooks') body = <MemoryPanel runtime={runtime} />;
  else if (homie.id === 'park' || homie.id === 'okafor') body = <TranscriptPanel runtime={runtime} />;
  else body = <BrowserPanel runtime={runtime} />;

  return (
    <div className="side-panel">
      <div className="panel" style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            background: 'linear-gradient(180deg, var(--ui-panel-2) 0%, var(--ui-panel) 100%)',
            borderBottom: '3px solid var(--c-line)',
          }}
        >
          <div style={{ background: 'var(--c-line)', padding: 4, lineHeight: 0 }}>
            <HomieHD defIdx={homie.spriteIdx} scale={3} palette={palette} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="pixel-font" style={{ fontSize: 10, color: 'var(--ui-accent-2)' }}>
              {homie.name.toUpperCase()}
            </div>
            <div className="mono-font dim" style={{ fontSize: 16 }}>{homie.role}</div>
            <div className="mono-font" style={{ fontSize: 16, color: 'var(--ui-text)' }}>
              {runtime?.task || homie.task}
            </div>
          </div>
          <button className="btn ghost" style={{ fontSize: 8 }} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Sponsor bar — prominent partner branding */}
        {sponsor && sponsorKey && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: '#0e1024',
              borderBottom: '3px solid var(--c-line)',
            }}
          >
            <SponsorLogo keyName={sponsorKey} size={56} pixelated={true} />
            <div className="col" style={{ gap: 2, flex: 1 }}>
              <div className="pixel-font" style={{ fontSize: 8, color: 'var(--ui-muted)' }}>
                SPONSORED HOMIE
              </div>
              <div className="pixel-font" style={{ fontSize: 11, color: 'var(--ui-accent-2)' }}>
                {sponsor.name.toUpperCase()}
              </div>
              <div className="mono-font dim" style={{ fontSize: 14 }}>
                this homie is sponsored by {sponsor.name}
              </div>
            </div>
          </div>
        )}

        {issue && property && (
          <div
            style={{
              padding: '8px 12px',
              background: 'var(--ui-bg)',
              borderBottom: '3px solid var(--c-line)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Pixel sprite={GLYPHS_HD[ISSUE_TYPES[issue.type].glyph]} scale={3} />
            <div className="col" style={{ gap: 0, flex: 1 }}>
              <div className="mono-font" style={{ fontSize: 16 }}>
                {ISSUE_TYPES[issue.type].label}
              </div>
              <div className="dim mono-font" style={{ fontSize: 14 }}>
                {property.name} · F{issue.floor} unit {issue.room}
              </div>
            </div>
            <span className={`tag ${runtime?.status === 'done' ? 'success' : 'warn'}`}>
              {runtime?.status === 'done' ? 'DONE' : 'ACTIVE'}
            </span>
          </div>
        )}

        <div style={{ padding: 12 }}>{body}</div>
      </div>
    </div>
  );
}
