export type HomieId = 'ramirez' | 'park' | 'okafor' | 'sato' | 'chen' | 'brooks';

export type Who = 'sys' | 'you' | 'them';

export type HomieEvent =
  | { type: 'started'; homieId: HomieId; task: string; issueId: string }
  | { type: 'transcript_line'; homieId: HomieId; who: Who; text: string }
  | { type: 'browser_navigate'; homieId: HomieId; url: string }
  | { type: 'browser_frame'; homieId: HomieId; sessionUrl: string }
  | { type: 'browser_action'; homieId: HomieId; action: string }
  | { type: 'browser_page'; homieId: HomieId; url: string; body: string[] }
  | { type: 'memory_write'; homieId: HomieId; key: string; value: string }
  | { type: 'memory_read'; homieId: HomieId; query: string; result: string }
  | {
      type: 'payment';
      homieId: HomieId;
      amountCents: number;
      vendor: string;
      chargeId: string;
      dashboardUrl: string;
    }
  | { type: 'email_sent'; homieId: HomieId; to: string; subject: string; inboxUrl?: string }
  | {
      type: 'truck_dispatched';
      vendorId: string;
      propertyId: string;
      etaMinutes: number;
      routeId: string;
    }
  | { type: 'truck_arrived'; vendorId: string; propertyId: string; routeId: string }
  | { type: 'issue_resolved'; issueId: string }
  | { type: 'handoff'; fromHomieId: HomieId; toHomieId: HomieId; reason: string }
  | { type: 'done'; homieId: HomieId; summary: string }
  | { type: 'error'; homieId: HomieId; message: string; recoverable: boolean };

export type DispatchId = string;

export interface Dispatch {
  id: DispatchId;
  issueId: string;
  startedAt: number;
  status: 'running' | 'done' | 'error';
}

export interface DispatchOutcome {
  vendorId?: string;
  vendorName?: string;
  vendorPhone?: string;
  priceCents?: number;
  etaText?: string;
  savingsCents?: number;
  vendorConfirmed?: boolean;
  outcomeSource?: 'parsed' | 'fallback' | 'mixed';
}

export interface DispatchContext {
  dispatchId: DispatchId;
  issueId: string;
  propertyId: string;
  propertyAddress: string;
  vendorTrade: string;
  issueLabel: string; // e.g. "Broken pipe", "Heating out"
  // Mutable, shared across the chain. Each agent reads/writes as it learns.
  outcome: DispatchOutcome;
}
