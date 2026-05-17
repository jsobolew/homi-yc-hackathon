const BASE = 'https://api.agentphone.ai/v1';

export interface TranscriptTurn {
  speaker: 'agent' | 'caller';
  text: string;
  at?: string;
}

export interface OutboundCallResult {
  callId: string;
  status: string;
  transcript: TranscriptTurn[];
  recordingUrl?: string;
  durationSec?: number;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AGENTPHONE_API_KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AgentPhone ${path} → ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

interface CallInit {
  callId?: string;
  id?: string;
}

interface CallDetail {
  callId?: string;
  id?: string;
  status?: string;
  transcript?: unknown;
  transcripts?: unknown;
  recordingUrl?: string;
  recording_url?: string;
  recordingAvailable?: boolean;
  durationSec?: number;
  duration?: number;
  durationSeconds?: number;
}

// AgentPhone returns turns shaped { transcript: <caller said>, response: <agent said>, createdAt }.
// Each turn-entry becomes up to two HomieEvent lines (caller first, then agent).
function normalizeTranscript(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: TranscriptTurn[] = [];
  for (const r of raw) {
    const rec = r as Record<string, unknown>;
    const callerText = String(rec.transcript ?? '').trim();
    const agentText = String(rec.response ?? '').trim();
    const at = rec.createdAt as string | undefined;
    if (callerText) out.push({ speaker: 'caller', text: callerText, at });
    if (agentText) out.push({ speaker: 'agent', text: agentText, at });
  }
  return out;
}

export async function placeOutboundCall(args: {
  toNumber: string;
  scenario?: string;
  greeting?: string;
  variables?: Record<string, string>;
}): Promise<{ callId: string }> {
  const body: Record<string, unknown> = {
    agentId: process.env.PARK_AGENT_ID,
    toNumber: args.toNumber,
    fromNumberId: process.env.AGENTPHONE_FROM_NUMBER_ID,
  };
  if (args.scenario) body.systemPrompt = args.scenario;
  if (args.greeting) body.initialGreeting = args.greeting;
  if (args.variables) body.variables = args.variables;

  const r = (await api('/calls', {
    method: 'POST',
    body: JSON.stringify(body),
  })) as CallInit;
  const callId = r.callId ?? r.id;
  if (!callId) throw new Error(`No call id in response: ${JSON.stringify(r)}`);
  return { callId };
}

export async function getCall(callId: string): Promise<CallDetail> {
  return api(`/calls/${callId}`) as Promise<CallDetail>;
}

export async function waitForCall(
  callId: string,
  opts: { pollMs?: number; timeoutMs?: number } = {},
): Promise<OutboundCallResult> {
  const pollMs = opts.pollMs ?? 2000;
  const timeoutMs = opts.timeoutMs ?? 5 * 60_000;
  const start = Date.now();

  while (true) {
    const d = await getCall(callId);
    const status = d.status ?? 'unknown';
    if (status === 'completed' || status === 'failed' || status === 'no-answer') {
      return {
        callId,
        status,
        transcript: normalizeTranscript(d.transcripts ?? d.transcript),
        recordingUrl: d.recordingUrl ?? d.recording_url,
        durationSec: d.durationSeconds ?? d.durationSec ?? d.duration,
      };
    }
    if (Date.now() - start > timeoutMs) {
      return {
        callId,
        status: 'timeout',
        transcript: normalizeTranscript(d.transcripts ?? d.transcript),
      };
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
}
