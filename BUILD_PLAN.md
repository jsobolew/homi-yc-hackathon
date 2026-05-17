# Homi — Build Plan

Companion to `SPEC.md`. Order is rough — anything below "Foundations" can shift based on which API keys land first. File paths assume `homi/` is the Next.js root inside `YC_hackathon/`.

---

## 0. Setup

```bash
# from YC_hackathon/
pnpm create next-app@latest homi --typescript --tailwind --app --no-src-dir --turbopack
cd homi

# core
pnpm add ai @ai-sdk/google zod
pnpm add eventsource-parser  # for SSE on the client

# sponsor SDKs — install as keys arrive, exact package names TBD when Piotr brings them
# pnpm add @supermemory/sdk stripe @agentmail/sdk browser-use @moss-ai/sdk @sponge/sdk @agentphone/sdk

# dev
pnpm add -D @types/node tsx
```

Vercel link:
```bash
pnpm dlx vercel link
pnpm dlx vercel env pull .env.local
```

`.env.local` keys (add empty placeholders for all from minute one — easier than chasing later):
```
GOOGLE_GENERATIVE_AI_API_KEY=
SUPERMEMORY_API_KEY=
STRIPE_SECRET_KEY=
AGENTMAIL_API_KEY=
BROWSER_USE_API_KEY=
MOSS_API_KEY=
SPONGE_API_KEY=
AGENTPHONE_API_KEY=
AGENTPHONE_NUMBER=
DEMO_TENANT_EMAIL=

# per-homie live flags. default 0 = use mock.
HOMIE_RAMIREZ_LIVE=0
HOMIE_PARK_LIVE=0
HOMIE_OKAFOR_LIVE=0
HOMIE_SATO_LIVE=0
HOMIE_CHEN_LIVE=0
HOMIE_BROOKS_LIVE=0
```

Flip each flag to `1` only after that homie is verified end-to-end. Demo defaults: leave the flaky ones at `0`.

---

## 1. Repo layout (target)

```
homi/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      — three tabs: map / building / office
│   ├── globals.css                   — port from styles.css
│   └── api/
│       ├── dispatch/route.ts         — POST { issueId } → { dispatchId }
│       ├── stream/[dispatchId]/route.ts  — GET SSE
│       ├── scenario/[name]/route.ts  — POST: preload demo state
│       └── webhooks/
│           ├── stripe/route.ts
│           └── agentmail/route.ts
├── components/
│   ├── Pixel.tsx                     — SVG sprite renderer (port pixel.jsx)
│   ├── sprites.ts                    — port sprites.jsx
│   ├── views/
│   │   ├── MapView.tsx               — port mapview.jsx + truck routing
│   │   ├── BuildingView.tsx          — port buildingview.jsx
│   │   └── OfficeView.tsx            — port officeview.jsx
│   ├── panels/
│   │   ├── AgentPanel.tsx            — port agentpanel.jsx
│   │   └── BrowserEmbed.tsx          — Browser Use iframe / screenshot pane
│   └── TweaksPanel.tsx               — keep for dev only, hide in demo
├── lib/
│   ├── types.ts                      — HomieEvent union, dispatch types
│   ├── bus.ts                        — in-memory EventEmitter keyed by dispatchId
│   ├── orchestrator.ts               — dispatch fan-out, fallback logic
│   ├── data/
│   │   ├── properties.ts             — port from data.jsx
│   │   ├── vendors.ts                — vendors with SF coords for offices
│   │   ├── issues.ts
│   │   ├── homies.ts
│   │   └── transcripts.ts            — POC's pre-baked transcripts (mock data)
│   ├── agents/
│   │   ├── ramirez.ts
│   │   ├── park.ts
│   │   ├── okafor.ts
│   │   ├── sato.ts
│   │   ├── chen.ts
│   │   └── brooks.ts
│   ├── tools/
│   │   ├── browserUse.ts
│   │   ├── supermemory.ts
│   │   ├── stripe.ts
│   │   ├── agentmail.ts
│   │   ├── moss.ts
│   │   ├── sponge.ts
│   │   └── agentphone.ts
│   ├── adapters/
│   │   └── mock.ts                   — replays transcripts as HomieEvent stream
│   ├── workflows/
│   │   └── settlement.ts             — WDK: call→pay→email→memory
│   └── scenarios/
│       └── curtainUp.ts              — preloaded demo state
├── public/
│   ├── sounds/park-call.mp3
│   └── sprites/
└── ... (SPEC.md, BUILD_PLAN.md at YC_hackathon root, one level up)
```

---

## 2. Core types (`lib/types.ts`)

This is the single most important file — everything streams these events. Get it right first; nothing else compiles without it.

```ts
export type HomieId = 'ramirez' | 'park' | 'okafor' | 'sato' | 'chen' | 'brooks';

export type HomieEvent =
  | { type: 'started';          homieId: HomieId; task: string }
  | { type: 'transcript_line';  homieId: HomieId; who: 'sys'|'you'|'them'; text: string }
  | { type: 'browser_navigate'; homieId: HomieId; url: string }
  | { type: 'browser_frame';    homieId: HomieId; sessionUrl: string }  // for iframe embed
  | { type: 'browser_action';   homieId: HomieId; action: string }      // narrated action
  | { type: 'memory_write';     homieId: HomieId; key: string; value: string }
  | { type: 'memory_read';      homieId: HomieId; query: string; result: string }
  | { type: 'payment';          homieId: HomieId; amountCents: number; vendor: string; chargeId: string; dashboardUrl: string }
  | { type: 'email_sent';       homieId: HomieId; to: string; subject: string; inboxUrl?: string }
  | { type: 'truck_dispatched'; vendorId: string; propertyId: string; etaMinutes: number; routeId: string }
  | { type: 'truck_arrived';    vendorId: string; propertyId: string; routeId: string }
  | { type: 'issue_resolved';   issueId: string }
  | { type: 'handoff';          fromHomieId: HomieId; toHomieId: HomieId; reason: string }
  | { type: 'done';             homieId: HomieId; summary: string }
  | { type: 'error';            homieId: HomieId; message: string; recoverable: boolean };

export type DispatchId = string;
export interface Dispatch {
  id: DispatchId;
  issueId: string;
  startedAt: number;
  status: 'running' | 'done' | 'error';
}
```

---

## 3. Event bus + dispatch + SSE (`lib/bus.ts`, `app/api/dispatch/route.ts`, `app/api/stream/[dispatchId]/route.ts`)

Architecture: in-process `EventEmitter` keyed by `dispatchId`. Demo runs on `next dev` on Jakub's laptop, so module state survives.

```ts
// lib/bus.ts
import { EventEmitter } from 'node:events';
import type { HomieEvent } from './types';

const buses = new Map<string, EventEmitter>();
export function getBus(id: string) {
  let b = buses.get(id);
  if (!b) { b = new EventEmitter(); b.setMaxListeners(50); buses.set(id, b); }
  return b;
}
export function emit(id: string, e: HomieEvent) { getBus(id).emit('e', e); }
export function subscribe(id: string, fn: (e: HomieEvent) => void) {
  const b = getBus(id); b.on('e', fn); return () => b.off('e', fn);
}
```

```ts
// app/api/dispatch/route.ts
export async function POST(req: Request) {
  const { issueId } = await req.json();
  const dispatchId = crypto.randomUUID();
  // do not await — let it run in the background, client subscribes via SSE
  orchestrator.run(dispatchId, issueId);
  return Response.json({ dispatchId });
}
```

```ts
// app/api/stream/[dispatchId]/route.ts
export async function GET(_req: Request, { params }: { params: Promise<{ dispatchId: string }> }) {
  const { dispatchId } = await params;
  const stream = new ReadableStream({
    start(ctrl) {
      const send = (e: HomieEvent) =>
        ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(e)}\n\n`));
      const unsub = subscribe(dispatchId, send);
      // close on disconnect — handled by signal in real impl
    }
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive' }
  });
}
```

**Gotcha:** Vercel serverless functions cap at 60s on hobby, 300s on pro. `next dev` is unlimited. For the laptop demo, irrelevant. If we ever deploy: switch to fluid compute or Vercel KV pub/sub.

---

## 4. Orchestrator (`lib/orchestrator.ts`)

The chain is fixed per issue type. For the leak demo:

```
ramirez (source vendor) → park (call & negotiate) → chen (pay) → sato (book) → okafor (notify tenant)
                                                  ↘ brooks reads/writes throughout
```

```ts
export async function run(dispatchId: string, issueId: string) {
  try {
    const ctx = await loadContext(issueId);
    await runHomie(dispatchId, 'ramirez', ctx);
    await runHomie(dispatchId, 'park',    ctx);
    await runHomie(dispatchId, 'chen',    ctx);
    await runHomie(dispatchId, 'sato',    ctx);
    await runHomie(dispatchId, 'okafor',  ctx);
    emit(dispatchId, { type: 'issue_resolved', issueId });
  } catch (e) { /* emit error, do not crash */ }
}

async function runHomie(dispatchId: string, id: HomieId, ctx: Ctx) {
  const live = process.env[`HOMIE_${id.toUpperCase()}_LIVE`] === '1';
  const impl = live ? liveAgents[id] : mockAdapter(id);
  const timeout = setTimeout(() => fallbackToMock(dispatchId, id), 10_000);  // 10s budget
  for await (const event of impl(ctx)) emit(dispatchId, event);
  clearTimeout(timeout);
}
```

**Fallback rule:** if a live agent stalls > 10s without emitting, swap to mock mid-stream and finish out the script. Demo never blocks.

---

## 5. Mock adapter (`lib/adapters/mock.ts`)

Ships first. This is what makes the entire UI demoable from minute 30, before any sponsor key arrives.

Re-uses POC's `TRANSCRIPTS` data — turns each entry into an `AsyncGenerator<HomieEvent>` paced with `setTimeout` so lines stream in over ~3 seconds per homie. Adds synthetic `browser_navigate`, `memory_write`, `payment`, `email_sent`, `truck_dispatched`, `handoff`, `done`.

Example for Park (mock):
```ts
async function* mockPark(ctx: Ctx): AsyncGenerator<HomieEvent> {
  yield { type: 'started', homieId: 'park', task: 'Calling Cable Car HVAC' };
  for (const line of TRANSCRIPTS.h2.lines) {
    await sleep(700);
    yield { type: 'transcript_line', homieId: 'park', who: line.who, text: line.t };
  }
  yield { type: 'done', homieId: 'park', summary: 'Booked $640, save $80' };
  yield { type: 'handoff', fromHomieId: 'park', toHomieId: 'chen', reason: 'pay vendor' };
}
```

Acceptance: mock chain runs end-to-end, UI shows the full 2-min demo, no sponsor APIs touched.

---

## 6. UI port (`components/`)

Port order:

1. `Pixel.tsx` (port `pixel.jsx`) — SVG sprite renderer + palette. Pure component, no state. Easy.
2. `sprites.ts` (port `sprites.jsx`) — sprite data arrays. Pure module.
3. `globals.css` (port `styles.css`) — keep classnames identical, port to `@layer` if Tailwind v4 fights.
4. `OfficeView.tsx` — port first; smallest, lets us validate the pixel pipeline.
5. `BuildingView.tsx` — second.
6. `MapView.tsx` — last (because truck routing is new).

State: single `useEvents(dispatchId)` hook consumes SSE, returns `{ events, byHomie, trucks, resolvedIssues }`. Views are pure functions of state.

```ts
// components/useEvents.ts
export function useEvents(dispatchId: string | null) {
  const [state, set] = useState<DemoState>(initialState);
  useEffect(() => {
    if (!dispatchId) return;
    const es = new EventSource(`/api/stream/${dispatchId}`);
    es.onmessage = (m) => set(s => reduce(s, JSON.parse(m.data) as HomieEvent));
    return () => es.close();
  }, [dispatchId]);
  return state;
}
```

The reducer is the single source of UI truth — it folds `HomieEvent`s into `DemoState`. Test it in isolation.

---

## 7. Agents — one section per homie

Each agent uses Vercel AI SDK `streamText` with Gemini 2.5 Pro and a tight tool set. Prompt is prescriptive — we don't want creative LLM decisions. If the LLM doesn't call the expected tool within 10s, orchestrator falls through to mock.

### 7.1 Ramirez — Vendor Sourcer  (`lib/agents/ramirez.ts`)

**Tools:** `mossSearchVendors(query)`, `browserUseStart(url)`, `browserUseExtract(selector)`, `supermemoryWrite(key, value)`.

**System prompt seed:**
> You are Ramirez, a vendor sourcing agent. Given an issue at a property, you (1) search the internal vendor index via `mossSearchVendors`, (2) open the top result's listing page via `browserUseStart`, (3) write the shortlist to memory via `supermemoryWrite`, (4) hand off to Park. Do these in order. Do not improvise. Emit one transcript line per step.

**Expected event sequence:**
1. `started`
2. `browser_navigate` (yelp)
3. `browser_frame` (the embed URL — repeat every ~500ms while navigating)
4. `transcript_line` × 3
5. `memory_write`
6. `handoff` → park
7. `done`

**Browser Use surface:** wrap `browserUse.createSession()` → returns `sessionUrl`. We `iframe` that URL inside `BrowserEmbed.tsx`. If Browser Use doesn't return an iframe-able URL, fall back to polling screenshots.

### 7.2 Park — Negotiator  (`lib/agents/park.ts`)

**Demo path: mock-only.** Real voice pipeline built but not used live.

**Mock events:** scripted transcript of the negotiation + a `started` event that the UI uses to fire `Piotr's phone rings on the table` (audio file plays through phone).

**Live pipeline (AgentPhone-only — Gemini Live bridge is impossible):**
- AgentPhone runs on Retell; no raw audio access. Park uses AgentPhone's *own* hosted conversation engine.
- One-shot bootstrap: `POST /v1/agents` with the negotiator system prompt + verbal-consent opening line → `PARK_AGENT_ID`. (Done — see `scripts/bootstrap-agentphone.ts`.)
- Per call: `POST /v1/calls { agentId, toNumber, fromNumberId }` → `callId`. Poll `GET /v1/calls/{id}` until status terminal; flatten transcript turns into `transcript_line` events.
- Park homie generator (`lib/agents/park.ts`) wraps this. Demo narration: *"AgentPhone's voice agent haggling on behalf of Homi."* Plays better than admitting we couldn't bridge into a different model — especially at AgentPhone's own hackathon.

### 7.3 Okafor — Tenant Comms  (`lib/agents/okafor.ts`)

**Tools:** `agentMailSend({to, subject, body})`, `supermemoryRead(key)`.

**System prompt:**
> You are Okafor, tenant comms. Read the issue context from memory, send one short email to the tenant at `DEMO_TENANT_EMAIL` confirming the appointment. Subject line: "Maintenance scheduled — {date}". Body: 2 sentences, friendly.

**Expected events:** `memory_read` → `email_sent` (with `inboxUrl` pointing to the tenant inbox we control) → `done`.

### 7.4 Sato — Scheduler  (`lib/agents/sato.ts`)

**Tools:** `browserUseStart(url)`, `browserUseFill(field, value)`, `browserUseSubmit()`.

**Target:** a stub vendor booking page we host at `/vendor/bugout/book` — tiny Next.js form, two text inputs and a submit button, returns `BX-44821`. Browser Use fills + submits it; we get the confirmation back. Easy to make this work; impossible to break.

### 7.5 Chen — Payments  (`lib/agents/chen.ts`)

**Tools:** `stripeChargeVendor({amountCents, vendorName})`, `spongeIssueInvoice(...)`, `supermemoryRead`, `supermemoryWrite`.

**Stripe call:** `stripe.paymentIntents.create` in test mode → returns chargeId + dashboard URL. Emit `payment` event with the Stripe dashboard URL so UI can deep-link the proof.

**Acceptance:** running Chen end-to-end results in a visible new charge on the Stripe dashboard within 2s.

### 7.6 Brooks — Memory Coordinator  (`lib/agents/brooks.ts`)

Brooks is the cross-cutting agent. Doesn't run in the linear chain — instead, **every other homie writes to and reads from Supermemory via Brooks's tools**. In the office view, Brooks's desk pulses each time any homie does a memory op. UI badge "+memory" floats over Brooks's sprite.

This is the cleanest way to give Supermemory a visible role: it's the shared brain. Brooks's panel shows a live memory log.

---

## 8. Voice pipeline (built, not demoed live)  (`lib/tools/agentphone.ts`, `lib/agents/park.ts`)

**Reality check:** AgentPhone is built on Retell. No raw audio, no WebRTC media stream, no PCM webhooks. The original Gemini Live audio bridge is not possible. **AgentPhone-only.**

```ts
// One-shot bootstrap (scripts/bootstrap-agentphone.ts) — already run:
POST /v1/agents { name: 'Park', systemPrompt: '<negotiator>', voiceMode: 'hosted' }
→ PARK_AGENT_ID
GET /v1/numbers
→ AGENTPHONE_FROM_NUMBER_ID (for +12603344967)

// Per call (lib/tools/agentphone.ts):
POST /v1/calls { agentId: PARK_AGENT_ID, toNumber, fromNumberId: AGENTPHONE_FROM_NUMBER_ID }
→ { callId }
GET /v1/calls/{callId}  (poll every 2-3s)
→ { status, transcript, recordingUrl?, duration? }
```

**Acceptance:** one successful real call to a real plumber via `scripts/voice-rung1.ts` → `voice-rung2.ts` → real plumber. Transcript captured. The recording IS the demo (if AgentPhone returns a `recordingUrl`; otherwise speakerphone record).

---

## 9. Map upgrade (`components/views/MapView.tsx`)

Three pieces:

**(a) Vendor offices.** Extend `vendors.ts` with `office: {x, y}` for each vendor at real-ish SF coords on the 200×140 grid. Render the office sprite (small building variant) at each location. Idle truck sprite parked next to it.

**(b) Truck routing.**
- `truck_dispatched` event → spawn truck at `vendor.office`.
- Compute waypoints between office and property. Straight line is fine; if it crosses water, route via one bend at a fixed bridge point.
- Animate via `requestAnimationFrame`. Position = lerp(office, property, progress). `progress` advances based on ETA.
- ETA badge floats above truck, computed from `etaMinutes` event field, decremented every wall-second (sped-up time: 1 real second = 1 simulated minute, so 12-min ETA arrives in 12s).
- `truck_arrived` event → property gets green check sprite, issue cloud fades out.

**(c) Subtle ambient.** Two-color water shimmer using CSS keyframes on a path overlay. 4 keyframes, 3s loop. Done.

Cut order if behind: subtle ambient → vendor office sprites → truck animation. The truck animation is the only required piece for the demo.

---

## 10. Demo scenario loader  (`lib/scenarios/curtainUp.ts`, `app/api/scenario/[name]/route.ts`)

Curtain-up state: 3 issues blinking, 6 homies idle at desks, Stripe dashboard URL pre-loaded into a state slot for the cmd+tab.

```ts
POST /api/scenario/curtain-up
→ resets in-memory state to fixture
→ pre-writes "previous deal" entries to Supermemory so Brooks's first read returns context
```

The "previous deal" pre-load is non-trivial but important: it's how the demo shows that the agent *remembers* past interactions. Without pre-loaded memory, Brooks looks empty.

---

## 11. Rehearsal cue sheet — 2-minute demo

Print this; tape to the laptop bezel.

| Cue | Time | Action |
|---|---|---|
| C1 | 0:00 | Title slide. Hit space → fade to dashboard, map view auto-loaded with curtain-up scenario. Three issues blinking. |
| C2 | 0:10 | Narrate one-liner. |
| C3 | 0:20 | Click 1247 Castro on the map. View zooms to building dollhouse. Pause 2s. |
| C4 | 0:30 | Tap the leak cloud on floor 2. View snaps to office. Ramirez desk pulses. Hit `D` (debug shortcut) if needed to manually trigger if dispatch lags. |
| C5 | 0:35 | Ramirez panel opens; Browser Use embed shows real browsing. Narrate: "Ramirez is sourcing vendors live on Yelp." |
| C6 | 0:50 | Brooks badge flashes. Narrate: "Writing the shortlist to Supermemory — shared brain across all agents." |
| C7 | 0:55 | **Piotr puts phone on speaker, hits play on `park-call.mp3`.** Park desk pulses. Narrate: "Park calls Ricky's." |
| C8 | 1:00–1:15 | Audio plays. Stay silent. Let the call sell itself. |
| C9 | 1:15 | Narrate: "We saved $80. That deal is now in memory for next time." |
| C10 | 1:20 | `cmd+tab` to pre-pinned Stripe dashboard. New charge visible. Narrate one word: "Paid." 2 seconds. |
| C11 | 1:25 | `cmd+tab` back. Map view. Truck just spawned at Ricky's. Narrate: "Truck en route, 12 minutes." |
| C12 | 1:35 | `cmd+tab` to pre-pinned tenant inbox. New email visible. Narrate: "Tenant notified." 2 seconds. |
| C13 | 1:40 | `cmd+tab` back. Sato panel briefly visible, booking form submitting. |
| C14 | 1:50 | Truck arrives. Property green-checks. Cloud vanishes. |
| C15 | 1:55 | "Real call. Real payment. Real email. Real vendor booking. Built in ten hours." |
| C16 | 2:00 | End. |

Keyboard fallbacks (in case live state is wrong): `D` force-dispatch, `R` reset to curtain-up, `M` toggle mock-only mode, `T` skip truck animation to arrived.

---

## 12. Pre-submission checklist (do at ~7:30 PM)

- [ ] `pnpm build` passes. Commit + push so submission can link to repo.
- [ ] `pnpm dev` runs clean — no console errors.
- [ ] Stripe dashboard tab pinned, logged in, on test mode, ready to show.
- [ ] Tenant inbox tab pinned, logged in, ready to show.
- [ ] `park-call.mp3` plays from Piotr's phone at audible volume (test in the actual demo room if possible).
- [ ] Hotspot tethered to laptop, tested.
- [ ] Curtain-up scenario loader fires correctly — three issues blinking, no stale state.
- [ ] Run the full 2-min demo three times back-to-back. Time it. Must be ≤ 1:55 to leave breathing room.
- [ ] Submit: link to deployed Vercel URL + GitHub repo + 30s screen recording of the demo as the submission artifact.

---

## 13. Things explicitly NOT planned for

- Tests. We're checking with our eyes.
- Error boundaries beyond top-level. If the UI dies mid-demo, hit `R`.
- Mobile, responsive design, dark mode toggle, accessibility audit.
- Auth, multi-tenant, real database.
- Deploying anything to production beyond preview URLs. Demo is on `next dev` against Jakub's laptop.
- Anything in the original POC's `TweaksPanel` beyond what we already use for state reset.
