'use client';

import { useEffect, useMemo, useState } from 'react';
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

type View = 'map' | 'building' | 'office';

export default function Home() {
  const [view, setView] = useState<View>('map');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedHomieId, setSelectedHomieId] = useState<HomieId | null>(null);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [homies] = useState<Homie[]>(INITIAL_HOMIES);
  const [dispatchedIssues, setDispatchedIssues] = useState<Record<string, string>>({});

  const { state, start, reset } = useEvents();
  const palette = DEFAULT_PALETTE;

  const selectedProperty = useMemo(
    () => (selectedPropertyId ? PROPERTIES.find((p) => p.id === selectedPropertyId) ?? null : null),
    [selectedPropertyId],
  );
  const selectedHomie = useMemo(
    () => (selectedHomieId ? homies.find((h) => h.id === selectedHomieId) ?? null : null),
    [selectedHomieId, homies],
  );

  // Auto-switch the side panel to whichever homie is active in the chain.
  useEffect(() => {
    if (view === 'office' && state.activeHomie) {
      setSelectedHomieId(state.activeHomie);
    }
  }, [state.activeHomie, view]);

  // Mark resolved issues server-side state so map markers update.
  useEffect(() => {
    if (state.resolvedIssues.length === 0) return;
    setIssues((prev) =>
      prev.map((i) => (state.resolvedIssues.includes(i.id) ? { ...i, status: 'resolved' } : i)),
    );
  }, [state.resolvedIssues]);

  function selectProperty(propertyId: string) {
    setSelectedPropertyId(propertyId);
    setView('building');
  }

  function selectHomie(id: string) {
    setSelectedHomieId(id as HomieId);
    setView('office');
  }

  async function dispatchIssue(issue: Issue) {
    if (dispatchedIssues[issue.id]) return;
    setDispatchedIssues((prev) => ({ ...prev, [issue.id]: 'pending' }));
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issue.id ? { ...i, status: 'dispatched', assignedHomie: 'ramirez' } : i,
      ),
    );
    setView('office');
    setSelectedHomieId('ramirez');
    await start(issue.id);
  }

  function resetAll() {
    setIssues(INITIAL_ISSUES);
    setDispatchedIssues({});
    setSelectedHomieId(null);
    setSelectedPropertyId(null);
    reset();
    setView('map');
  }

  const homieIssue = selectedHomie
    ? issues.find((i) => i.assignedHomie === selectedHomie.id) || null
    : null;
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
          />
        )}
        {view === 'office' && (
          <OfficeView
            homies={homies}
            state={state}
            selectedHomieId={selectedHomieId}
            onSelectHomie={(id) => setSelectedHomieId(id as HomieId)}
          />
        )}

        {view === 'office' && selectedHomie && (
          <AgentPanel
            homie={selectedHomie}
            runtime={state.homies[selectedHomie.id]}
            issue={homieIssue}
            property={homieIssueProperty}
            onClose={() => setSelectedHomieId(null)}
          />
        )}
      </div>
    </div>
  );
}
