// Live transcript stream from AgentPhone via SSE.
//
// Endpoint: GET /v1/calls/{call_id}/transcript/stream
//   - replays prior turns on connect, then streams new ones live
//   - frames: `event: <type>\ndata: <json>\n\n`
//   - event types observed in probe: `connected`, `turn`, `ended`
//   - heartbeats arrive as `: heartbeat` comment lines (we skip them)
//   - turn payload: { role: 'agent' | 'user', content: string, createdAt: ISO }
//   - ended payload: { callId, status, endedAt, durationSeconds }
//   - connected payload: { callId, status, agentId, agentName, direction,
//                          fromNumber, toNumber, startedAt }

const BASE = 'https://api.agentphone.ai/v1';

export interface ConnectedEvent {
  type: 'connected';
  callId: string;
  status: string;
  startedAt: string;
}

export interface TurnEvent {
  type: 'turn';
  role: 'agent' | 'user';
  content: string;
  createdAt: string;
}

export interface EndedEvent {
  type: 'ended';
  callId: string;
  status: string;
  endedAt: string;
  durationSeconds?: number;
}

export type CallStreamEvent = ConnectedEvent | TurnEvent | EndedEvent;

export interface StreamOptions {
  signal?: AbortSignal;
}

/**
 * Stream live transcript turns for an AgentPhone call. Yields parsed events
 * until the upstream closes (after `ended`) or the signal aborts.
 */
export async function* streamCallTranscript(
  callId: string,
  opts: StreamOptions = {},
): AsyncGenerator<CallStreamEvent> {
  if (!process.env.AGENTPHONE_API_KEY) {
    throw new Error('AGENTPHONE_API_KEY not set');
  }

  const upstream = await fetch(`${BASE}/calls/${callId}/transcript/stream`, {
    headers: {
      Authorization: `Bearer ${process.env.AGENTPHONE_API_KEY}`,
      Accept: 'text/event-stream',
    },
    signal: opts.signal,
  });
  if (!upstream.ok || !upstream.body) {
    throw new Error(
      `AgentPhone SSE failed: ${upstream.status} ${await upstream.text()}`,
    );
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseFrame(frame);
        if (parsed) yield parsed;
      }
    }
  } finally {
    try {
      reader.cancel();
    } catch {
      // ignore
    }
  }
}

function parseFrame(frame: string): CallStreamEvent | null {
  // Skip comment frames (heartbeats start with `:`).
  if (!frame.trim() || frame.startsWith(':')) return null;

  let eventName = 'message';
  let dataLines: string[] = [];
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) eventName = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }

  switch (eventName) {
    case 'connected':
      return {
        type: 'connected',
        callId: String(payload.callId ?? ''),
        status: String(payload.status ?? ''),
        startedAt: String(payload.startedAt ?? ''),
      };
    case 'turn': {
      const role = payload.role === 'agent' ? 'agent' : 'user';
      return {
        type: 'turn',
        role,
        content: String(payload.content ?? ''),
        createdAt: String(payload.createdAt ?? ''),
      };
    }
    case 'ended':
      return {
        type: 'ended',
        callId: String(payload.callId ?? ''),
        status: String(payload.status ?? ''),
        endedAt: String(payload.endedAt ?? ''),
        durationSeconds:
          typeof payload.durationSeconds === 'number'
            ? payload.durationSeconds
            : undefined,
      };
    default:
      return null;
  }
}
