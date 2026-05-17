'use client';

import { useEffect, useReducer } from 'react';
import type { HomieEvent, HomieId, Who } from '@/lib/types';

export interface TranscriptLine {
  who: Who;
  text: string;
}

export interface BrowserPageView {
  url: string;
  body: string[];
}

export interface HomieRuntime {
  id: HomieId;
  status: 'idle' | 'running' | 'done' | 'error';
  task: string;
  transcript: TranscriptLine[];
  currentUrl?: string;
  browserPages: BrowserPageView[];
  lastMemoryWrite?: { key: string; value: string };
  lastMemoryRead?: { query: string; result: string };
  summary?: string;
}

export interface TruckRuntime {
  routeId: string;
  vendorId: string;
  propertyId: string;
  etaMinutes: number;
  startedAt: number;
  arrived: boolean;
}

export interface PaymentRuntime {
  amountCents: number;
  vendor: string;
  chargeId: string;
  dashboardUrl: string;
}

export interface EmailRuntime {
  to: string;
  subject: string;
}

export interface DemoState {
  issueId: string | null;
  dispatchId: string | null;
  finished: boolean;
  homies: Partial<Record<HomieId, HomieRuntime>>;
  trucks: TruckRuntime[];
  payments: PaymentRuntime[];
  emails: EmailRuntime[];
  resolvedIssues: string[];
  activeHomie: HomieId | null;
  memoryLog: { homieId: HomieId; kind: 'read' | 'write'; key?: string; query?: string; value: string }[];
}

const initial: DemoState = {
  issueId: null,
  dispatchId: null,
  finished: false,
  homies: {},
  trucks: [],
  payments: [],
  emails: [],
  resolvedIssues: [],
  activeHomie: null,
  memoryLog: [],
};

function ensureHomie(state: DemoState, id: HomieId): HomieRuntime {
  const existing = state.homies[id];
  if (existing) return existing;
  return {
    id,
    status: 'idle',
    task: '',
    transcript: [],
    browserPages: [],
  };
}

function updateHomie(state: DemoState, id: HomieId, patch: Partial<HomieRuntime>): DemoState {
  const cur = ensureHomie(state, id);
  return {
    ...state,
    homies: { ...state.homies, [id]: { ...cur, ...patch } },
  };
}

function reduce(state: DemoState, e: HomieEvent): DemoState {
  switch (e.type) {
    case 'started':
      return {
        ...updateHomie(state, e.homieId, {
          id: e.homieId,
          status: 'running',
          task: e.task,
          transcript: [],
          browserPages: [],
          summary: undefined,
        }),
        activeHomie: e.homieId,
      };

    case 'transcript_line': {
      const cur = ensureHomie(state, e.homieId);
      return updateHomie(state, e.homieId, {
        transcript: [...cur.transcript, { who: e.who, text: e.text }],
      });
    }

    case 'browser_navigate':
      return updateHomie(state, e.homieId, { currentUrl: e.url });

    case 'browser_page': {
      const cur = ensureHomie(state, e.homieId);
      return updateHomie(state, e.homieId, {
        currentUrl: e.url,
        browserPages: [...cur.browserPages, { url: e.url, body: e.body }],
      });
    }

    case 'browser_action': {
      const cur = ensureHomie(state, e.homieId);
      return updateHomie(state, e.homieId, {
        transcript: [...cur.transcript, { who: 'sys', text: e.action }],
      });
    }

    case 'browser_frame':
      return updateHomie(state, e.homieId, { currentUrl: e.sessionUrl });

    case 'memory_write':
      return {
        ...updateHomie(state, e.homieId, {
          lastMemoryWrite: { key: e.key, value: e.value },
        }),
        memoryLog: [
          ...state.memoryLog,
          { homieId: e.homieId, kind: 'write', key: e.key, value: e.value },
        ],
      };

    case 'memory_read':
      return {
        ...updateHomie(state, e.homieId, {
          lastMemoryRead: { query: e.query, result: e.result },
        }),
        memoryLog: [
          ...state.memoryLog,
          { homieId: e.homieId, kind: 'read', query: e.query, value: e.result },
        ],
      };

    case 'payment':
      return {
        ...state,
        payments: [
          ...state.payments,
          {
            amountCents: e.amountCents,
            vendor: e.vendor,
            chargeId: e.chargeId,
            dashboardUrl: e.dashboardUrl,
          },
        ],
      };

    case 'email_sent':
      return {
        ...state,
        emails: [...state.emails, { to: e.to, subject: e.subject }],
      };

    case 'truck_dispatched':
      return {
        ...state,
        trucks: [
          ...state.trucks,
          {
            routeId: e.routeId,
            vendorId: e.vendorId,
            propertyId: e.propertyId,
            etaMinutes: e.etaMinutes,
            startedAt: Date.now(),
            arrived: false,
          },
        ],
      };

    case 'truck_arrived':
      return {
        ...state,
        trucks: state.trucks.map((t) =>
          t.routeId === e.routeId ? { ...t, arrived: true } : t,
        ),
      };

    case 'issue_resolved':
      return { ...state, resolvedIssues: [...state.resolvedIssues, e.issueId] };

    case 'handoff':
      return { ...state, activeHomie: e.toHomieId };

    case 'done':
      return updateHomie(state, e.homieId, { status: 'done', summary: e.summary });

    case 'error':
      return updateHomie(state, e.homieId, { status: 'error', summary: e.message });
  }
}

type Action =
  | { kind: 'event'; event: HomieEvent }
  | { kind: 'reset' }
  | { kind: 'start'; issueId: string }
  | { kind: 'dispatch'; id: string }
  | { kind: 'finish' };

function rootReducer(state: DemoState, action: Action): DemoState {
  switch (action.kind) {
    case 'event':
      return reduce(state, action.event);
    case 'reset':
      return initial;
    case 'start':
      return { ...initial, issueId: action.issueId };
    case 'dispatch':
      return { ...state, dispatchId: action.id };
    case 'finish':
      return { ...state, finished: true };
  }
}

export function useEvents() {
  const [state, dispatch] = useReducer(rootReducer, initial);

  useEffect(() => {
    if (!state.issueId) return;
    const es = new EventSource(`/api/stream?issueId=${encodeURIComponent(state.issueId)}`);

    es.onmessage = (m) => {
      try {
        const event = JSON.parse(m.data) as HomieEvent;
        dispatch({ kind: 'event', event });
      } catch {
        // ignore parse errors
      }
    };
    es.addEventListener('dispatch', (m) => {
      try {
        const { dispatchId } = JSON.parse((m as MessageEvent).data) as { dispatchId: string };
        dispatch({ kind: 'dispatch', id: dispatchId });
      } catch {
        // ignore parse errors
      }
    });
    es.addEventListener('finish', () => {
      dispatch({ kind: 'finish' });
      es.close();
    });
    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [state.issueId]);

  const start = (issueId: string) => {
    dispatch({ kind: 'start', issueId });
  };

  const reset = () => dispatch({ kind: 'reset' });

  return { state, start, reset };
}
