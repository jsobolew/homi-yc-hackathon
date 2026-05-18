// Probe AgentPhone's SSE transcript stream to lock the per-turn JSON shape.
//
// What it does:
//   1. POST /v1/calls to Piotr's phone with a 1-sentence greeting
//   2. Opens GET /v1/calls/{id}/transcript/stream
//   3. Dumps every raw SSE frame to stdout until the call ends or 90s elapse
//   4. Hangs up the call when done (or on Ctrl-C)
//
// Run:  pnpm tsx --env-file=.env.local scripts/probe-agentphone-stream.ts
//
// We use the existing PARK_AGENT_ID + a no-op greeting. Piotr only needs to
// answer for a few seconds — long enough to capture one caller turn + one
// agent turn so we can see what JSON keys come down.

import 'dotenv/config';

const BASE = 'https://api.agentphone.ai/v1';
const KEY = process.env.AGENTPHONE_API_KEY;
const AGENT = process.env.PARK_AGENT_ID;
const FROM = process.env.AGENTPHONE_FROM_NUMBER_ID;
const TO = process.env.PIOTR_PHONE;

if (!KEY || !AGENT || !FROM || !TO) {
  console.error('Missing env: AGENTPHONE_API_KEY / PARK_AGENT_ID / AGENTPHONE_FROM_NUMBER_ID / PIOTR_PHONE');
  process.exit(1);
}

const PROBE_TIMEOUT_MS = 90_000;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${path} → ${r.status}: ${text}`);
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function hangup(callId: string) {
  try {
    await api(`/calls/${callId}/end`, { method: 'POST' });
    console.log(`\n[probe] hung up ${callId}`);
  } catch (e) {
    console.log(`[probe] hangup failed (probably already ended): ${e instanceof Error ? e.message : e}`);
  }
}

async function main() {
  console.log(`[probe] placing call to ${TO} via agent ${AGENT}…`);
  const call = await api<{ callId?: string; id?: string }>(`/calls`, {
    method: 'POST',
    body: JSON.stringify({
      agentId: AGENT,
      toNumber: TO,
      fromNumberId: FROM,
      initialGreeting:
        'Hey Piotr — this is the AgentPhone SSE probe. Say hi a couple of times then we will hang up. Thanks.',
      systemPrompt:
        'You are a polite test caller. When the human says anything, respond once with a short acknowledgement like "Got it, thanks" and then say nothing more. Do not ask questions.',
    }),
  });
  const callId = call.callId ?? call.id;
  if (!callId) throw new Error(`No callId in response: ${JSON.stringify(call)}`);
  console.log(`[probe] callId=${callId}`);
  console.log(`[probe] opening SSE stream…\n`);

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort('probe-timeout'), PROBE_TIMEOUT_MS);

  const handleInterrupt = async () => {
    console.log('\n[probe] interrupt — hanging up…');
    ctrl.abort('user-interrupt');
    await hangup(callId);
    process.exit(0);
  };
  process.on('SIGINT', handleInterrupt);
  process.on('SIGTERM', handleInterrupt);

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}/calls/${callId}/transcript/stream`, {
      headers: { Authorization: `Bearer ${KEY}`, Accept: 'text/event-stream' },
      signal: ctrl.signal,
    });
  } catch (e) {
    clearTimeout(timeout);
    await hangup(callId);
    throw e;
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    await hangup(callId);
    throw new Error(`SSE upstream failed: ${upstream.status} ${await upstream.text()}`);
  }

  console.log(`[probe] SSE connected (status ${upstream.status}). Dumping raw frames:\n`);
  console.log('────────────────────────────────────────────────────────────');

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log('────────────────────────────────────────────────────────────');
        console.log('[probe] stream ended (upstream closed)');
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      // Print raw, exactly as wire — we want to see frame separators, comment
      // lines, key casing, everything.
      process.stdout.write(chunk);
    }
  } catch (e) {
    if (ctrl.signal.aborted) {
      console.log('\n────────────────────────────────────────────────────────────');
      console.log(`[probe] aborted (${ctrl.signal.reason})`);
    } else {
      console.log(`\n[probe] read error: ${e instanceof Error ? e.message : e}`);
    }
  } finally {
    clearTimeout(timeout);
    await hangup(callId);
  }
}

main().catch((e) => {
  console.error('probe crashed:', e);
  process.exit(1);
});
