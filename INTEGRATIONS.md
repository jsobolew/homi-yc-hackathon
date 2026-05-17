# Homi — Sponsor Integration Plan

Companion to `SPEC.md` + `BUILD_PLAN.md`. Records what we learned from researching each sponsor SDK, the exact code shape each integration takes, and the order we wire them up.

Status at the time of writing: foundations + mocks ship end-to-end. Sponsor APIs all unwired. Keys in hand: **Gemini, Supermemory, AgentMail, AgentPhone** (key, no number yet). Awaiting: **Stripe, Browser Use, Moss, Sponge**.

---

## 0. Big finding before anything else — voice architecture changed

**AgentPhone is built on Retell AI under the hood.** Confirmed by `retellCallId` in their public response shape. They do NOT expose raw audio (no WebRTC, no Twilio-style media streams, no PCM webhooks). They run their own LLM + TTS + STT and return a transcript at the end.

The pipeline originally drawn in `SPEC.md` §3 and `BUILD_PLAN.md` §8 (AgentPhone → audio bridge → Gemini Live → spoken negotiation) is **not possible** with the public AgentPhone API.

**Decision: AgentPhone-only Park.** We pass our negotiator system prompt to AgentPhone's built-in conversation engine. AgentPhone's voice (Retell's voice list) does the call. Demo narration becomes *"AgentPhone's voice agent haggling on behalf of Homi"* — still a real call to a real plumber, still impressive, and **plays better at the AgentPhone hackathon** than admitting we couldn't bridge into a different model.

Gemini stays the brain of the *orchestration* (Brooks, Okafor, Chen, Sato, Ramirez). Just not the mouth on Park.

Action item: update `SPEC.md` §3 (sponsor table) and §8 (voice pipeline) to reflect this. Task #21.

---

## 1. Per-sponsor integration spec

### 1.1 Supermemory — `lib/tools/supermemory.ts` (Brooks)

**Install:**
```bash
pnpm add supermemory @supermemory/tools
```

**Env:** `SUPERMEMORY_API_KEY=sm_…` (already in `.env.local`).

**One stable `containerTag`** — `homi:demo`. Pick once, never deviate (search uses exact array match).

**Tool surface:**
```ts
// lib/tools/supermemory.ts
import { tool } from 'ai';
import { z } from 'zod';
import Supermemory from 'supermemory';

const sm = new Supermemory({ apiKey: process.env.SUPERMEMORY_API_KEY! });
const TAG = 'homi:demo';

export const supermemoryWrite = tool({
  description: 'Persist a deal outcome.',
  inputSchema: z.object({ key: z.string(), value: z.string() }),
  execute: async ({ key, value }) =>
    sm.memories.add({
      containerTag: TAG,
      memories: [{ content: `${key}: ${value}`, metadata: { key } }],
    }),
});

export const supermemorySearch = tool({
  description: 'Semantic search over past deals.',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const r = await sm.search.execute({ q: query, containerTag: TAG, threshold: 0.5 });
    return r.results;
  },
});
```

**Pre-seed script** (`scripts/seed.ts`, run once before each demo via `pnpm tsx scripts/seed.ts`):
```ts
await sm.memories.add({
  containerTag: 'homi:demo',
  memories: [
    { content: "deal.1180-castro.hvac.2026-03-02: vendor=Ricky $720 booked next-day saved $60",
      metadata: { key: 'deal.1180-castro.hvac.2026-03-02' } },
    { content: "deal.1102-castro.leak.2026-01-14: vendor=Ricky $580 booked same-day saved $90",
      metadata: { key: 'deal.1102-castro.leak.2026-01-14' } },
    { content: "deal.0998-mission.drain.2025-11-22: vendor=Ricky $410 booked 2hr saved $40",
      metadata: { key: 'deal.0998-mission.drain.2025-11-22' } },
  ],
});
```

**Landmines:**
- Memory ingestion is async — newly-written entries may take ~2s to become searchable. **Pre-seed ≥ 10s before curtain-up.** Don't rely on read-after-write inside the same agent turn.
- Two search endpoints exist: `/v4/search` (entries, fast) vs `search.documents` (heavier). Use the former.
- `customId` is for chat scoping, not deal keys. Put deal keys in `metadata.key`.

**Sponsor demo angle to mention in narration:** containerTag-based multi-tenancy + automatic memory graph linking entities across writes (so Brooks "recognizes Ricky" across the 3 prior deals).

**Console for sponsor's view:** https://console.supermemory.ai

---

### 1.2 AgentMail — `lib/tools/agentmail.ts` (Okafor)

**Install:**
```bash
pnpm add agentmail agentmail-toolkit
```

**Env:**
- `AGENTMAIL_API_KEY=am_us_…` (already in `.env.local`)
- `AGENTMAIL_INBOX_ID=inbox_…` (must bootstrap — see below)
- `DEMO_TENANT_EMAIL=` (Piotr's Gmail or yours — currently empty)

**One-shot bootstrap** (run once, save output to env):
```bash
npx agentmail inboxes create --username homi --display-name "Homi"
# → homi@agentmail.to, inbox_id: inbox_xxx
```

**Tool surface:**
```ts
// lib/tools/agentmail.ts
import { tool } from 'ai';
import { z } from 'zod';
import { AgentMailClient } from 'agentmail';

const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! });
const INBOX_ID = process.env.AGENTMAIL_INBOX_ID!;

export const agentMailSend = tool({
  description: 'Send an email from Homi to a tenant.',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  execute: async ({ to, subject, body }) => {
    const { message_id, thread_id } = await client.inboxes.messages.send(INBOX_ID, {
      to, subject, text: body,
    });
    return {
      messageId: message_id,
      inboxUrl: `https://console.agentmail.to/inboxes/${INBOX_ID}/threads/${thread_id}`,
    };
  },
});
```

**Landmines:**
- Inbox must exist before first send — never call `inboxes.create()` per send.
- Default `agentmail.to` domain is shared. Cold Gmail addresses risk Promotions/Spam. **Send a warmup email an hour before demo and move it to Primary** so the real demo email lands inbox-direct.
- Console deep-link path (`/inboxes/{id}/threads/{tid}`) is best-effort — send a test email first, copy the actual URL pattern from the console, then hardcode it.
- 3000 sends/mo on free tier — irrelevant for one demo, but `429 + Retry-After` is the failure shape if we hammer.

**Console for demo cmd+tab proof:** https://console.agentmail.to (we want to pin this tab and have the sent email visible at 1:35).

**Optional but cool:** inbound webhook lets tenants reply and re-enter the orchestrator. Out of scope unless we have a free 30 min at the end.

---

### 1.3 AgentPhone — `lib/tools/agentphone.ts` (Park, voice)

**Install:** no first-party Node SDK. Hand-rolled `fetch` against `https://api.agentphone.ai`, or crib from the typed client in [`agentphone-mcp/src/api.ts`](https://github.com/AgentPhone-AI/agentphone-mcp/blob/main/src/api.ts). Add:
```bash
pnpm add ofetch  # tiny fetch wrapper, only if we don't want raw fetch
```

**Env:**
- `AGENTPHONE_API_KEY=sk_live_…` (already in `.env.local`)
- `AGENTPHONE_NUMBER=+1415…` (must provision — see below)
- `PARK_AGENT_ID=agt_…` (must provision)

**One-shot bootstrap** (run once before first call):
1. `POST /v1/agents` with `{ name: "Park", systemPrompt: "<negotiator persona>", voice: "<pick from GET /v1/agents/voices>" }` → save `agt_id` as `PARK_AGENT_ID`.
2. `POST /v1/numbers` with `{ country: "US", areaCode: "415", agentId: PARK_AGENT_ID }` → save `phoneNumber` as `AGENTPHONE_NUMBER`.

This is fastest from the AgentPhone console — **I'll ask for login when ready**.

**Tool surface (interface designed to be option-B-swappable later):**
```ts
// lib/tools/agentphone.ts
export interface OutboundCallResult {
  callId: string;
  transcript: { speaker: 'agent' | 'caller'; text: string; at: string }[];
  status: 'completed' | 'failed' | 'no-answer';
  recordingUrl?: string;  // present only if AgentPhone returns one — don't fabricate
  durationSec: number;
}

export async function outboundCall(args: {
  to: string;         // E.164
  scenario: string;   // becomes systemPrompt for this call
  greeting?: string;
}): Promise<OutboundCallResult> {
  // POST /v1/calls with { agentId: PARK_AGENT_ID, toNumber: args.to,
  //   systemPrompt: args.scenario, initialGreeting: args.greeting,
  //   waitForCompletion: true, maxWaitSeconds: 300 }
  // Flatten transcripts[] into the speaker-turn shape.
}
```

**Test ladder — climb one rung at a time:**
1. **Rung 1 — bare dial** (~20 min): hardcoded greeting only. Call Piotr's phone. Phone rings, plays "Hi, this is Homi, testing." Hangs up. Proves API + auth + number routing.
2. **Rung 2 — full negotiation** (~30 min): pass real systemPrompt. Call Piotr's phone again, have a 30s back-and-forth. Verify transcript looks coherent.
3. **Rung 3 — real plumber** (~15 min): same code, target real SF plumber from Yelp. Verbal consent at call start ("I'm an AI agent on behalf of a property manager, this call may be recorded, is that ok?"). Run the haggle script. **If AgentPhone gives us a `recordingUrl`, download → `public/sounds/park-call.mp3` for the demo.** If not, record via Piotr's phone speakerphone during a follow-up test call.

**Landmines:**
- **Provisioning blocks everything** — without an agent + number, no call fires. Do this *first* the moment we have AgentPhone console access.
- `waitForCompletion: true` blocks the route handler up to 5 minutes. Fine for tests; for the orchestrator path, fire-and-forget then poll `GET /v1/calls/{id}`.
- Don't ship `sk_live_…` to the client. Server-only.
- The `recordingUrl` field is undocumented — may not exist. Plan to fall back to Piotr's phone recording the call on speakerphone.

**Consoles I'll need access to:**
- AgentPhone dashboard (URL TBC — `https://docs.agentphone.ai` may have a console link or it's separate). I'll ask for login when starting.

---

### 1.4 Vercel AI SDK + Gemini — `lib/agents/<name>.ts` skeleton

Confirmed versions: `ai@6.0.184`, `@ai-sdk/google@3.0.75` (both already installed).

**Model:** `google('gemini-2.5-pro')`. Not `google.chat()` — that doesn't exist in v6.

**Tool shape:** `tool({ description, inputSchema, execute })`. **It is `inputSchema`, not `parameters`** (parameters was v4).

**Multi-step loop:** `stopWhen: stepCountIs(N)`, not `maxSteps`.

**Streaming chunk types in `result.fullStream`:**
- `{ type: 'text-delta', id, text }` — property is `.text`, not `.textDelta`
- `{ type: 'tool-call', toolCallId, toolName, input }`
- `{ type: 'tool-result', toolCallId, toolName, input, output }`
- `{ type: 'tool-error', ... }` / `{ type: 'error', ... }` / `{ type: 'finish', ... }`
- `{ type: 'abort', reason? }` — emitted when `AbortSignal` fires. **Does not throw.** Handle as a chunk.

**Stream → AsyncGenerator pattern (keystone — every live homie follows this shape):**
```ts
// lib/agents/brooks.ts
import { streamText, tool, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { DispatchContext, HomieEvent } from '../types';
import { supermemoryWrite, supermemorySearch } from '../tools/supermemory';

export async function* runBrooks(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort('homie-timeout'), 10_000);

  // Buffer for tool-emitted side-events — execute() can't yield directly.
  const sideEvents: HomieEvent[] = [];

  const tools = {
    supermemoryWrite: tool({
      ...supermemoryWrite,
      execute: async (args, opts) => {
        const r = await supermemoryWrite.execute!(args, opts);
        sideEvents.push({ type: 'memory_write', homieId: 'brooks', key: args.key, value: args.value });
        return r;
      },
    }),
    supermemorySearch: tool({
      ...supermemorySearch,
      execute: async (args, opts) => {
        const r = await supermemorySearch.execute!(args, opts);
        sideEvents.push({ type: 'memory_read', homieId: 'brooks', query: args.query, result: JSON.stringify(r).slice(0, 120) });
        return r;
      },
    }),
  };

  yield { type: 'started', homieId: 'brooks', task: 'Reading prior deals from memory', issueId: ctx.issueId };

  const result = streamText({
    model: google('gemini-2.5-pro'),
    tools,
    stopWhen: stepCountIs(5),
    abortSignal: ctrl.signal,
    system: BROOKS_SYSTEM_PROMPT,
    prompt: `Issue ${ctx.issueId} at property ${ctx.propertyId}. Trade: ${ctx.vendorTrade}. Search prior deals, summarize for the negotiator.`,
  });

  try {
    for await (const part of result.fullStream) {
      while (sideEvents.length) yield sideEvents.shift()!;
      switch (part.type) {
        case 'text-delta':
          if (part.text) yield { type: 'transcript_line', homieId: 'brooks', who: 'sys', text: part.text };
          break;
        case 'tool-error':
          yield { type: 'error', homieId: 'brooks', message: String(part.error), recoverable: true };
          break;
        case 'abort':
          yield { type: 'error', homieId: 'brooks', message: 'aborted (timeout)', recoverable: true };
          return;
        case 'error':
          yield { type: 'error', homieId: 'brooks', message: String(part.error), recoverable: true };
          return;
      }
    }
    while (sideEvents.length) yield sideEvents.shift()!;
    yield { type: 'done', homieId: 'brooks', summary: 'Context shared with park' };
    yield { type: 'handoff', fromHomieId: 'brooks', toHomieId: 'park', reason: 'enriched with prior deals' };
  } finally {
    clearTimeout(timeout);
    if (!ctrl.signal.aborted) ctrl.abort('generator-cleanup');
  }
}
```

**Landmines:**
- `execute()` runs *between* stream chunks. Don't yield from inside it. Use the `sideEvents` buffer + drain at top of each loop iteration to preserve causal order.
- Cleanup: if the orchestrator's `for await` aborts early, the Gemini HTTP stream leaks until GC. Always `try/finally` + `ctrl.abort()`.
- `text-delta.text` not `text-delta.textDelta` — easy to miss.
- `inputSchema` not `parameters` — silent failure if wrong.
- Zod peer-dep is `^3.25.76 || ^4.1.8`. Pin in root `package.json` to avoid drift.

---

### 1.5 Browser Use — `lib/tools/browserUse.ts` (Ramirez + Sato)

**🚨 Use the hosted `browser-use-sdk`, NOT `browser-harness`.** browser-harness is a local Chrome DevTools Protocol harness — useful for running against your own laptop's Chrome, useless for a hosted iframe-embed flow. The hosted SDK is the only path that gives Ramirez the live-view URL the demo needs.

**Install:**
```bash
pnpm add browser-use-sdk
```

**Env:** `BROWSER_USE_API_KEY=` (blocked on Piotr). Free tier (no card) = 3 concurrent browsers; key from https://cloud.browser-use.com/new-api-key.

**Ramirez — iframe-embed live session:**
```ts
// lib/tools/browserUse.ts
import { BrowserUse } from 'browser-use-sdk/v3';
const client = new BrowserUse();

export async function startRamirezSession(goal: string) {
  const session = await client.sessions.create({ keepAlive: true });
  const taskPromise = client.run(goal, { sessionId: session.id });
  return { sessionId: session.id, liveUrl: session.liveUrl, taskPromise };
}
```
Render in `components/panels/BrowserEmbed.tsx`:
```tsx
<iframe src={liveUrl} style={{ width: '100%', aspectRatio: '16/9', border: 'none' }} allow="autoplay" />
```
The `liveUrl` is on `live.browser-use.com` and is presigned — safe to ship to the client, no auth header.

**Sato — autonomous form fill + structured confirmation:**
```ts
import { z } from 'zod';
const Confirmation = z.object({ confirmationNumber: z.string(), vendorName: z.string() });

export async function satoBookVendor(formUrl: string, payload: Record<string, string>) {
  const session = await client.sessions.create({ keepAlive: true });
  try {
    const result = await client.run(
      `Go to ${formUrl}. Fill the form with these values: ${JSON.stringify(payload)}. Submit and return the confirmation number shown on the success page.`,
      { sessionId: session.id, schema: Confirmation },
    );
    return { liveUrl: session.liveUrl, ...result.output };
  } finally {
    await client.sessions.stop(session.id);
  }
}
```

**`/vendor/book` stub page:** Tiny Next.js form at `app/vendor/book/page.tsx` — two text inputs (address, unit) + a submit button that POSTs to `app/vendor/book/confirm/route.ts` which returns `BX-44821`. **Must be reachable from the public internet** — Browser Use Cloud can't hit `localhost`. Deploy to a Vercel preview URL before the demo.

**Landmines:**
- **Concurrency cap = 3 on free tier.** Don't run Ramirez + Sato + a retry simultaneously. Serialize, or upgrade key before demo.
- **`keepAlive: true` is mandatory for the iframe flow.** Without it the session dies the instant `client.run` resolves and the iframe goes blank mid-pitch. Call `client.sessions.stop(id)` only when the panel closes / dispatch resets.
- **Always `await client.sessions.stop()` in a `finally`** or we burn through the 3-slot quota with zombie sessions.
- **`liveUrl` is iframe-only** — set `allow="autoplay"` and a fixed aspect ratio or it renders 0×0.
- **Cold-start latency** ~5–10s before `liveUrl` paints. Show a pixel-art loading state.
- **Cost:** Claude Sonnet under the hood, ~$3.60 / $18 per 1M tok. Cents per browse; a stuck agent can loop. Set a client-side task timeout + cancel button.

---

### 1.6 Stripe — `lib/tools/stripe.ts` (Chen)

**Blocked on `STRIPE_SECRET_KEY=sk_test_…`.**

```bash
pnpm add stripe
```

```ts
import { tool } from 'ai';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeChargeVendor = tool({
  description: 'Charge a vendor for a booked job (test mode).',
  inputSchema: z.object({
    amountCents: z.number().int().positive(),
    vendorName: z.string(),
    memo: z.string(),
  }),
  execute: async ({ amountCents, vendorName, memo }) => {
    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      payment_method: 'pm_card_visa',
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: `${vendorName} — ${memo}`,
    });
    return {
      chargeId: pi.id,
      amountCents,
      vendor: vendorName,
      dashboardUrl: `https://dashboard.stripe.com/test/payments/${pi.id}`,
    };
  },
});
```

**Acceptance:** running Chen end-to-end → new charge on the Stripe test dashboard within 2s. Pin the dashboard tab and cmd+tab to it at 1:20 in the demo.

**Console for demo cmd+tab proof:** https://dashboard.stripe.com/test/payments

---

### 1.7 Moss + Sponge — deferred

Both blocked on keys. Tool wrappers will follow the same `tool({...})` pattern. Moss adds semantic vendor search powering Ramirez (replaces our seeded `pickVendorForTrade`); Sponge adds vendor-side invoice settlement on Chen (alongside Stripe). Both are in the cut-first list per SPEC §6.

---

## 2. Execution order

Strictly sequential where there are dependencies; pipelines where independent.

| # | Task | Time | Blocker |
|---|---|---|---|
| 10 | Install all sponsor SDKs (`supermemory`, `@supermemory/tools`, `agentmail`, `agentmail-toolkit`, `browser-use-sdk`, `stripe`, `@google/genai`) | 5 min | — |
| 11 | Bootstrap AgentMail inbox via CLI | 2 min | — |
| 13 | Pre-seed Supermemory with 3 prior deals (`scripts/seed.ts`) | 5 min | — |
| 14 | Wire `lib/tools/supermemory.ts` | 15 min | #10 |
| 17 | **Wire `lib/agents/brooks.ts` live — keystone agent** | 30 min | #14 |
| 15 | Wire `lib/tools/agentmail.ts` | 10 min | #11 |
| 18 | Wire `lib/agents/okafor.ts` live | 20 min | #15, #17 |
| 12 | Bootstrap AgentPhone Park agent + buy number | 15 min | AgentPhone console login |
| 16 | Wire `lib/tools/agentphone.ts`, run test ladder rung 1+2 | 1 hr | #12 |
| — | **Real plumber call → `park-call.mp3`** (rung 3) | 30 min | #16 + Piotr |
| 19 | Wire Stripe + `lib/agents/chen.ts` live | 30 min | Stripe key |
| 20 | Wire Browser Use + Ramirez (iframe) + Sato (form fill + stub page) | 1.5 hr | Browser Use key + deployed preview |
| 21 | Patch SPEC.md + BUILD_PLAN.md for AgentPhone reality | 5 min | — |
| — | Demo scenario loader `/api/scenario/curtain-up` | 20 min | #14 wired |
| — | Keyboard cues (D/R/M/T) + floating money animations | 30 min | — |
| — | Pre-submission checklist | 20 min | All above |

**Total work remaining at the time of writing:** ~7 hours of focused dev once keys land. Pipelinable across waiting periods.

**Cut-first order if behind** (preserves spec's non-negotiables): map ambient → Sponge → Moss → AgentMail. Stripe + Browser Use + Supermemory must stay live.

---

## 3. What I need from you to start each block

| Block | Need from you |
|---|---|
| Brooks live (#17) | Nothing — green light only |
| Okafor live (#18) | **`DEMO_TENANT_EMAIL`** — your Gmail or Piotr's, drop into `.env.local` |
| AgentMail bootstrap (#11) | Run the CLI command yourself (`npx agentmail inboxes create --username homi --display-name "Homi"`), or grant me terminal access — paste the returned `inbox_id` into `AGENTMAIL_INBOX_ID` |
| AgentPhone bootstrap (#12) | **AgentPhone console login** (web URL TBD — I'll ask once I'm ready to provision) + your decision on which voice from their voice list |
| Voice rung 3 | Piotr's phone number for rung 1+2; a real SF plumber number from Yelp for rung 3 |
| Stripe (#19) | `STRIPE_SECRET_KEY=sk_test_…` in `.env.local` |
| Browser Use (#20) | `BROWSER_USE_API_KEY=` in `.env.local`; **a Vercel preview deploy URL** for the `/vendor/book` stub (we'll need to push + deploy at some point so Browser Use Cloud can reach it) |
| Demo prep | Confirm Piotr's phone speakerphone reaches the back of the room during rehearsal |

**Console logins I'll ask for at the right moments:**
- **AgentPhone dashboard** — when starting #12, to create the Park agent + buy the 415 number. URL TBC — likely something like `console.agentphone.ai`.
- **Supermemory** — only if we want to cmd+tab to the memory console during demo (optional, currently not in the script).
- **AgentMail console** — already needed for the demo cmd+tab at 1:35.
- **Stripe dashboard** — already needed for the demo cmd+tab at 1:20.
- **Gmail (`DEMO_TENANT_EMAIL`)** — already needed for the demo cmd+tab at 1:35 (the tenant-side proof).

---

## 4. Demo cmd+tab targets (pin these tabs before curtain-up)

Per spec §2 the demo at 1:20 cmd+tabs to Stripe; at 1:35 cmd+tabs to the tenant inbox. Here's the full pin list:

1. **Homi dashboard** — http://localhost:3001 (curtain-up loaded)
2. **Stripe test dashboard** — https://dashboard.stripe.com/test/payments
3. **Gmail (tenant inbox)** — https://mail.google.com (logged in as `DEMO_TENANT_EMAIL`)
4. **AgentMail sender console** — https://console.agentmail.to/inboxes/{inbox_id} *(optional, for narration about AgentMail itself)*
5. **AgentPhone call log** — *(optional, if we want to show the call record)*

Pin order in the rehearsal: dashboard ← active tab ← Stripe ← Gmail. Cmd+tab cycles through the last 2 quickly.

---

## 5. Closing notes

- All five research reports the agents returned are stored in this conversation thread — re-spawnable if needed.
- The Brooks keystone (`lib/agents/brooks.ts`) defines the *exact* pattern every other live homie will follow. Get it right; stamp the rest.
- Spec drift: when #21 lands, `SPEC.md` §3 Park's sponsor cell changes from `Google DeepMind (Gemini Live) + AgentPhone` to `AgentPhone` only, and §8 voice pipeline section gets rewritten to describe the AgentPhone-native conversation engine.
