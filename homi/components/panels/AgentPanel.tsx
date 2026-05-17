'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Pixel } from '../Pixel';
import { HomieHD } from '../HomieHD';
import { SPONSORS, type SponsorKey, SponsorLogo } from '../SponsorLogo';
import { DEFAULT_PALETTE, GLYPHS_HD, HOMIE_HD_DEFS } from '../sprites';
import type { Homie } from '@/lib/data/homies';
import type { Issue } from '@/lib/data/issues';
import type { Property } from '@/lib/data/properties';
import { ISSUE_TYPES } from '@/lib/data/issueTypes';
import { TRANSCRIPTS } from '@/lib/data/transcripts';
import type { ActivityItem, HomieRuntime, TranscriptLine } from '../useEvents';

interface AgentPanelProps {
  homie: Homie;
  runtime: HomieRuntime | undefined;
  mode: 'preview' | 'live';
  issue?: Issue | null;
  property?: Property | null;
  onClose: () => void;
}

function toneClass(tone: ActivityItem['tone']) {
  switch (tone) {
    case 'success':
      return 'success';
    case 'warn':
      return 'warn';
    case 'danger':
      return 'danger';
    case 'info':
      return 'info';
    default:
      return '';
  }
}

function activityLabel(kind: ActivityItem['kind']) {
  switch (kind) {
    case 'started':
      return 'START';
    case 'transcript':
      return 'CALL';
    case 'browser_navigate':
      return 'NAV';
    case 'browser_action':
      return 'STEP';
    case 'browser_page':
      return 'PAGE';
    case 'memory_read':
      return 'READ';
    case 'memory_write':
      return 'WRITE';
    case 'payment':
      return 'PAY';
    case 'email_sent':
      return 'MAIL';
    case 'handoff_in':
      return 'IN';
    case 'handoff_out':
      return 'OUT';
    case 'done':
      return 'DONE';
    case 'error':
      return 'ERR';
  }
}

function activityTitle(homie: Homie) {
  if (homie.id === 'brooks') return 'MEMORY THREAD';
  if (homie.id === 'park' || homie.id === 'okafor') return 'CALL THREAD';
  return 'ACTION THREAD';
}

function currentMode(homie: Homie) {
  if (homie.id === 'brooks') return 'shared memory';
  if (homie.id === 'park' || homie.id === 'okafor') return 'live call';
  return 'browser workflow';
}

function buildPreviewRuntime(homie: Homie): HomieRuntime {
  const transcript = TRANSCRIPTS[homie.id];
  const previewLines: TranscriptLine[] = transcript?.lines.map((line) => ({
    who: line.who,
    text: line.t,
  })) ?? [];
  const previewActivity: ActivityItem[] = previewLines.map((line) => ({
    kind: 'transcript',
    title:
      line.who === 'you'
        ? 'Homie spoke'
        : line.who === 'them'
          ? 'Counterparty replied'
          : 'System note',
    detail: line.text,
    tone: line.who === 'them' ? 'success' : line.who === 'sys' ? 'info' : 'default',
  }));

  const runtime: HomieRuntime = {
    id: homie.id,
    status: 'idle',
    task: homie.task,
    transcript: previewLines,
    browserPages: [],
    activity: previewActivity,
    summary: 'Previewing seeded homie activity',
  };

  if (transcript?.kind === 'browser') {
    runtime.currentUrl = transcript.url;
    runtime.browserPages = transcript.pages.map((page) => ({
      url: page.url,
      body: page.body,
    }));
  }

  if (homie.id === 'brooks') {
    runtime.lastMemoryRead = {
      query: 'Ricky\'s Plumbing past deals',
      result: '2 matches · avg $550',
    };
    runtime.lastMemoryWrite = {
      key: 'deal.1247-castro.leak.2026-05-17',
      value: 'vendor=ricky $640 booked 3:40pm saved $80',
    };
  }

  return runtime;
}

function BrowserSurface({ runtime }: { runtime: HomieRuntime | undefined }) {
  const pages = runtime?.browserPages ?? [];
  const lastPage = pages[pages.length - 1];
  const isRunning = runtime?.status === 'running';
  return (
    <div className="browser-shell">
      <div className="browser-bar">
        <div className="browser-dot"></div>
        <div className="browser-dot y"></div>
        <div className="browser-dot g"></div>
        <div className="browser-url">{lastPage?.url || runtime?.currentUrl || 'about:blank'}</div>
      </div>
      <div className="browser-body">
        {lastPage ? (
          lastPage.body.map((line, i) => (
            <div
              key={`${line}-${i}`}
              style={{
                fontFamily: 'VT323, monospace',
                color:
                  line.startsWith('>')
                    ? '#c14a4a'
                    : line.toUpperCase() === line && line.length > 4
                      ? '#1a1326'
                      : '#3d2e4a',
                fontWeight: line.toUpperCase() === line && line.length > 4 ? 'bold' : 'normal',
              }}
            >
              {line || ' '}
            </div>
          ))
        ) : isRunning ? (
          <div style={{ color: '#8a6d3a' }}>waiting for live browser output…</div>
        ) : (
          <div style={{ color: '#8a6d3a' }}>no live browser run for this homie yet</div>
        )}
      </div>
    </div>
  );
}

function TranscriptSurface({ runtime }: { runtime: HomieRuntime | undefined }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lines = runtime?.transcript ?? [];
  const isRunning = runtime?.status === 'running';

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);

  return (
    <div className="console" ref={ref} style={{ maxHeight: 240 }}>
      {lines.length === 0 && (
        <div className="line dim">
          {isRunning ? 'waiting for the call to connect…' : 'no live call in progress for this homie'}
        </div>
      )}
      {lines.map((ln, i) => (
        <div key={`${ln.text}-${i}`} className={`line ${ln.who}`}>
          <span className="dim">
            {ln.who === 'sys' ? '*' : ln.who === 'you' ? 'homie:' : 'them:'}
          </span>{' '}
          {ln.text}
        </div>
      ))}
    </div>
  );
}

function MemorySurface({ runtime }: { runtime: HomieRuntime | undefined }) {
  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="info-card" style={{ padding: 12 }}>
        <div className="panel-title" style={{ fontSize: 8 }}>LATEST READ</div>
        <div className="mono-font" style={{ fontSize: 16 }}>
          {runtime?.lastMemoryRead?.query || 'No reads yet'}
        </div>
        {runtime?.lastMemoryRead && (
          <div className="mono-font" style={{ fontSize: 16, color: '#ffd966' }}>
            ⇒ {runtime.lastMemoryRead.result}
          </div>
        )}
      </div>
      <div className="info-card" style={{ padding: 12 }}>
        <div className="panel-title" style={{ fontSize: 8 }}>LATEST WRITE</div>
        <div className="mono-font" style={{ fontSize: 16 }}>
          {runtime?.lastMemoryWrite?.key || 'No writes yet'}
        </div>
        {runtime?.lastMemoryWrite && (
          <div className="mono-font" style={{ fontSize: 16, color: '#b6f0a0' }}>
            {runtime.lastMemoryWrite.value}
          </div>
        )}
      </div>
    </div>
  );
}

export function AgentPanel({ homie, runtime, mode, issue, property, onClose }: AgentPanelProps) {
  const palette = DEFAULT_PALETTE;
  const def = HOMIE_HD_DEFS[homie.spriteIdx];
  const sponsorKey = def?.sponsor as SponsorKey | undefined;
  const sponsorSecondaryKey = def?.sponsorSecondary as SponsorKey | undefined;
  const sponsor = sponsorKey ? SPONSORS[sponsorKey] : null;
  const isPreview = mode === 'preview';
  const displayRuntime = isPreview ? runtime ?? buildPreviewRuntime(homie) : runtime;
  const activity = displayRuntime?.activity ?? [];
  const latestActivity = activity[activity.length - 1];

  const body = useMemo(() => {
    if (homie.id === 'brooks') return <MemorySurface runtime={displayRuntime} />;
    if (homie.id === 'park' || homie.id === 'okafor') return <TranscriptSurface runtime={displayRuntime} />;
    return <BrowserSurface runtime={displayRuntime} />;
  }, [displayRuntime, homie.id]);

  const statusTone =
    displayRuntime?.status === 'done'
      ? 'success'
      : displayRuntime?.status === 'error'
        ? 'danger'
        : displayRuntime?.status === 'running'
          ? 'warn'
          : 'info';

  return (
    <div className="side-panel">
      <div className="panel office-panel" style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: 14,
            background: 'linear-gradient(180deg, var(--ui-panel-2) 0%, var(--ui-panel) 100%)',
            borderBottom: '3px solid var(--c-line)',
          }}
        >
          <div style={{ background: 'var(--c-line)', padding: 6, lineHeight: 0 }}>
            <HomieHD
              defIdx={homie.spriteIdx}
              scale={3}
              palette={palette}
              sponsorKey={sponsorKey}
              sponsorSecondaryKey={sponsorSecondaryKey}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pixel-font" style={{ fontSize: 10, color: 'var(--ui-accent-2)' }}>
              {homie.name.toUpperCase()}
            </div>
            <div className="mono-font dim" style={{ fontSize: 16 }}>{homie.role}</div>
            <div className="mono-font" style={{ fontSize: 18, color: 'var(--ui-text)' }}>
              {displayRuntime?.task || homie.task}
            </div>
            <div className="mono-font dim" style={{ fontSize: 15 }}>
              {currentMode(homie)} · {isPreview ? 'preview' : displayRuntime?.status || 'waiting'}
            </div>
          </div>
          <button className="btn ghost" style={{ fontSize: 8 }} onClick={onClose}>
            FOCUS
          </button>
        </div>

        <div className="office-panel-scroll">
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="metric-grid">
              <div className="metric-card">
                <div className="label">status</div>
                <div className="value">{isPreview ? 'preview' : displayRuntime?.status || 'waiting'}</div>
              </div>
              <div className="metric-card">
                <div className="label">latest event</div>
                <div className="value">{activity.length}</div>
              </div>
              <div className="metric-card">
                <div className="label">current url</div>
                <div className="mono-font" style={{ fontSize: 16, color: 'var(--ui-text)' }}>
                  {displayRuntime?.currentUrl || 'n/a'}
                </div>
              </div>
              <div className="metric-card">
                <div className="label">summary</div>
                <div className="mono-font" style={{ fontSize: 16, color: 'var(--ui-text)' }}>
                  {displayRuntime?.summary ||
                    latestActivity?.detail ||
                    (displayRuntime?.status === 'running'
                      ? 'Waiting for activity'
                      : isPreview
                        ? 'Showing seeded preview'
                        : 'No live run yet')}
                </div>
              </div>
            </div>

            {sponsor && sponsorKey && (
              <div className="info-card" style={{ padding: 12 }}>
                <div className="row" style={{ gap: 12 }}>
                  <SponsorLogo keyName={sponsorKey} size={60} variant="panel" />
                  <div style={{ flex: 1 }}>
                    <div className="panel-title" style={{ fontSize: 8, marginBottom: 6 }}>
                      PRIMARY PARTNER
                    </div>
                    <div className="pixel-font" style={{ fontSize: 11, color: 'var(--ui-accent-2)' }}>
                      {sponsor.name.toUpperCase()}
                    </div>
                    <div className="mono-font dim" style={{ fontSize: 15 }}>
                      fitted as the chest mark on this homie&apos;s hoodie
                    </div>
                  </div>
                  {sponsorSecondaryKey && (
                    <div className="col" style={{ alignItems: 'center', gap: 4 }}>
                      <SponsorLogo keyName={sponsorSecondaryKey} size={34} variant="capBadge" />
                      <div className="pixel-font" style={{ fontSize: 7, color: 'var(--ui-muted)' }}>
                        CAP
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(issue || property) && (
              <div className="info-card" style={{ padding: 12 }}>
                <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                  {issue ? <Pixel sprite={GLYPHS_HD[ISSUE_TYPES[issue.type].glyph]} scale={3} /> : null}
                  <div style={{ flex: 1 }}>
                    <div className="panel-title" style={{ fontSize: 8, marginBottom: 6 }}>
                      ASSIGNED WORK
                    </div>
                    <div className="mono-font" style={{ fontSize: 18 }}>
                      {issue ? ISSUE_TYPES[issue.type].label : 'No live issue'}
                    </div>
                    <div className="mono-font dim" style={{ fontSize: 15 }}>
                      {property ? `${property.name} · floor ${issue?.floor ?? '-'} · unit ${issue?.room ?? '-'}` : 'No property selected'}
                    </div>
                  </div>
                  <div className={`tag ${statusTone}`}>
                    {displayRuntime?.status === 'done'
                      ? 'DONE'
                      : displayRuntime?.status === 'error'
                        ? 'ERROR'
                        : isPreview
                          ? 'PREVIEW'
                          : 'LIVE'}
                  </div>
                </div>
              </div>
            )}

            <div className="col" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <Pixel
                  sprite={
                    homie.id === 'brooks'
                      ? GLYPHS_HD.money
                      : homie.id === 'park' || homie.id === 'okafor'
                        ? GLYPHS_HD.phone
                        : GLYPHS_HD.laptop
                  }
                  scale={3}
                />
                <div>
                  <div className="panel-title" style={{ marginBottom: 4 }}>
                    LIVE SURFACE
                  </div>
                  <div className="mono-font dim" style={{ fontSize: 15 }}>
                    {currentMode(homie)}
                  </div>
                </div>
              </div>
              {body}
            </div>

            <div className="col" style={{ gap: 8 }}>
              <div className="panel-title" style={{ marginBottom: 0 }}>
                {activityTitle(homie)}
              </div>
              <div className="activity-list">
                {activity.length === 0 && (
                  <div className="activity-item info">
                    <div className="kicker">IDLE</div>
                    <div className="mono-font" style={{ fontSize: 16 }}>
                      {displayRuntime?.status === 'running'
                        ? 'Run started, waiting for first activity event.'
                        : isPreview
                          ? 'Showing seeded preview activity for this homie.'
                          : 'No live runtime activity yet for this homie.'}
                    </div>
                  </div>
                )}
                {activity.slice().reverse().map((item, index) => (
                  <div
                    key={`${item.kind}-${index}-${item.detail ?? ''}`}
                    className={`activity-item ${toneClass(item.tone)}`}
                  >
                    <div className="kicker">{activityLabel(item.kind)}</div>
                    <div>
                      <div className="mono-font" style={{ fontSize: 18, color: 'var(--ui-text)' }}>
                        {item.title}
                      </div>
                      {item.detail && (
                        <div className="mono-font dim" style={{ fontSize: 16 }}>
                          {item.detail}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
