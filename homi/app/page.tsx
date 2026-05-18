'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pixel } from '@/components/Pixel';
import { DEFAULT_PALETTE, SPR_LOGO } from '@/components/sprites';
import { MapView } from '@/components/views/MapView';
import { BuildingView } from '@/components/views/BuildingView';
import { OfficeView } from '@/components/views/OfficeView';
import { AgentPanel } from '@/components/panels/AgentPanel';
import { useEvents } from '@/components/useEvents';
import { PROPERTIES } from '@/lib/data/properties';
import { INITIAL_ISSUES, type Issue } from '@/lib/data/issues';
import { INITIAL_HOMIES, type Homie } from '@/lib/data/homies';
import type { HomieId } from '@/lib/types';

interface IntakeBanner {
  issueId: string;
  propertyName: string;
  from: string;
  subject: string;
}

type View = 'map' | 'building' | 'office';
type OfficeMode = 'preview' | 'live';

export default function Home() {
  const [view, setView] = useState<View>('map');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedHomieId, setSelectedHomieId] = useState<HomieId | null>(null);
  const [officeMode, setOfficeMode] = useState<OfficeMode>('preview');
  const [homies] = useState<Homie[]>(INITIAL_HOMIES);
  const [dispatchedIssues, setDispatchedIssues] = useState<Record<string, string>>({});
  const [baseIssues, setBaseIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [intakeBanner, setIntakeBanner] = useState<IntakeBanner | null>(null);
  const knownIssueIds = useRef(new Set<string>(INITIAL_ISSUES.map((i) => i.id)));

  const { state, start, reset } = useEvents();
  const palette = DEFAULT_PALETTE;

  useEffect(() => {
    const es = new EventSource('/api/issues/stream');

    es.addEventListener('snapshot', (m) => {
      try {
        const { issues } = JSON.parse((m as MessageEvent).data) as { issues: Issue[] };
        if (Array.isArray(issues)) {
          for (const issue of issues) knownIssueIds.current.add(issue.id);
          setBaseIssues(issues);
        }
      } catch {
        // ignore parse errors
      }
    });

    es.onmessage = (m) => {
      try {
        const payload = JSON.parse(m.data) as { type: string; issue?: Issue };
        if (payload.type === 'new_issue' && payload.issue) {
          const issue = payload.issue;
          if (knownIssueIds.current.has(issue.id)) return;
          knownIssueIds.current.add(issue.id);
          setBaseIssues((prev) => [...prev, issue]);
          const property = PROPERTIES.find((p) => p.id === issue.propertyId);
          setIntakeBanner({
            issueId: issue.id,
            propertyName: property?.name ?? issue.propertyId,
            from: issue.intake?.from ?? 'tenant',
            subject: issue.intake?.subject ?? 'New issue',
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // Let the browser retry; just close so we don't leak.
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    if (!intakeBanner) return;
    const id = setTimeout(() => setIntakeBanner(null), 8000);
    return () => clearTimeout(id);
  }, [intakeBanner]);

  const issues = useMemo<Issue[]>(
    () =>
      baseIssues.map((issue) => {
        if (state.resolvedIssues.includes(issue.id)) {
          return { ...issue, status: 'resolved' };
        }
        if (dispatchedIssues[issue.id]) {
          return { ...issue, status: 'dispatched', assignedHomie: 'ramirez' };
        }
        return issue;
      }),
    [baseIssues, dispatchedIssues, state.resolvedIssues],
  );

  const selectedProperty = useMemo(
    () => (selectedPropertyId ? PROPERTIES.find((p) => p.id === selectedPropertyId) ?? null : null),
    [selectedPropertyId],
  );
  const selectedHomie = useMemo(
    () => (selectedHomieId ? homies.find((h) => h.id === selectedHomieId) ?? null : null),
    [selectedHomieId, homies],
  );
  const officeHomie =
    (officeMode === 'live' && view === 'office' && state.activeHomie
      ? homies.find((h) => h.id === state.activeHomie)
      : selectedHomie) ??
    homies[0];

  function selectProperty(propertyId: string) {
    setSelectedPropertyId(propertyId);
    setView('building');
  }

  function selectHomie(id: string) {
    setSelectedHomieId(id as HomieId);
    setOfficeMode('preview');
    setView('office');
  }

  function watchLive(id?: string | null) {
    const target = (id ?? state.activeHomie ?? 'ramirez') as HomieId;
    setSelectedHomieId(target);
    setOfficeMode('live');
    setView('office');
  }

  async function dispatchIssue(issue: Issue) {
    if (dispatchedIssues[issue.id]) return;
    setDispatchedIssues((prev) => ({ ...prev, [issue.id]: 'pending' }));
    setSelectedHomieId('ramirez');
    setOfficeMode('live');
    await start(issue.id);
  }

  function resetAll() {
    setDispatchedIssues({});
    setSelectedHomieId(null);
    setOfficeMode('preview');
    setSelectedPropertyId(null);
    reset();
    setView('map');
  }

  // When a dispatch is active, every homie panel should show the dispatched
  // issue (they're all working on it). Only fall back to the per-homie demo
  // flavor (homies.ts → issueId) when no dispatch is in flight.
  const homieIssue =
    (state.issueId && issues.find((i) => i.id === state.issueId)) ||
    (officeHomie
      ? issues.find((i) => i.assignedHomie === officeHomie.id || i.id === officeHomie.issueId)
      : null) ||
    null;
  const homieIssueProperty = homieIssue
    ? PROPERTIES.find((p) => p.id === homieIssue.propertyId) || null
    : null;

  const savedTotal = state.payments.reduce((sum, p) => sum + Math.max(0, 72000 - p.amountCents), 0);

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Pixel sprite={SPR_LOGO} scale={2} palette={palette} />
          </span>
          HOMI<span style={{ color: 'var(--ui-accent)' }}>.</span>
        </div>

        <div className="tabs">
          <button
            className={`tab ${view === 'map' ? 'active' : ''}`}
            onClick={() => setView('map')}
          >
            SF MAP
          </button>
          <button
            className={`tab ${view === 'building' ? 'active' : ''}`}
            disabled={!selectedProperty}
            onClick={() => selectedProperty && setView('building')}
          >
            BUILDING{selectedProperty ? ' · ' + selectedProperty.name.split(' ')[0] : ''}
          </button>
          <button
            className={`tab ${view === 'office' ? 'active' : ''}`}
            onClick={() => setView('office')}
          >
            HOMIE OFFICE
          </button>
        </div>

        <div className="topbar-right">
          <div className="stat">
            <span className="num">{PROPERTIES.length}</span>
            <span className="lbl">properties</span>
          </div>
          <div className="stat">
            <span className="num">
              {issues.filter((i) => i.status === 'open').length}
            </span>
            <span className="lbl">open</span>
          </div>
          <div className="stat">
            <span className="num">
              {issues.filter((i) => i.status === 'dispatched').length}
            </span>
            <span className="lbl">enroute</span>
          </div>
          <div className="stat" style={{ borderColor: 'var(--ui-success)' }}>
            <span className="num" style={{ color: 'var(--ui-success)' }}>
              ${(savedTotal / 100).toLocaleString()}
            </span>
            <span className="lbl">saved today</span>
          </div>
          <button className="btn ghost" onClick={resetAll} style={{ fontSize: 8 }}>
            RESET
          </button>
        </div>
      </div>

      {intakeBanner && (
        <div
          onClick={() => {
            const issue = baseIssues.find((i) => i.id === intakeBanner.issueId);
            if (issue) selectProperty(issue.propertyId);
            setIntakeBanner(null);
          }}
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: '#1a1326',
            border: '2px solid #ffd966',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.6)',
            padding: '10px 16px',
            cursor: 'pointer',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 9,
            color: '#fff1d1',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: 520,
          }}
        >
          <div style={{ color: '#ffd966' }}>
            ✉  NEW ISSUE · {intakeBanner.propertyName.toUpperCase()}
          </div>
          <div style={{ fontSize: 8, color: '#fff1d1', opacity: 0.9 }}>
            from {intakeBanner.from} — {intakeBanner.subject}
          </div>
          <div style={{ fontSize: 8, color: '#6cc24a', marginTop: 2 }}>
            → click to open property
          </div>
        </div>
      )}

      <div className="stage">
        {view === 'map' && (
          <MapView
            properties={PROPERTIES}
            issues={issues}
            state={state}
            onSelectProperty={selectProperty}
          />
        )}
        {view === 'building' && selectedProperty && (
          <BuildingView
            property={selectedProperty}
            issues={issues}
            homies={homies}
            state={state}
            dispatchedIssues={dispatchedIssues}
            onBack={() => setView('map')}
            onTapIssue={dispatchIssue}
            onSelectHomie={selectHomie}
            onWatchLive={watchLive}
          />
        )}
        {view === 'office' && officeHomie && (
          <div className="office-layout">
            <div className="office-scene">
              <div className="office-scene-inner">
                <OfficeView
                  homies={homies}
                  state={state}
                  selectedHomieId={officeHomie.id}
                  onSelectHomie={(id) => {
                    setSelectedHomieId(id as HomieId);
                    setOfficeMode('preview');
                  }}
                />
              </div>
            </div>
            <div className="office-rail">
              <AgentPanel
                homie={officeHomie}
                runtime={state.homies[officeHomie.id]}
                mode={officeMode}
                issue={homieIssue}
                property={homieIssueProperty}
                onClose={() => {
                  setSelectedHomieId(state.activeHomie ?? homies[0].id);
                  setOfficeMode('live');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
