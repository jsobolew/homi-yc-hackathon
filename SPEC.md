# Homi — Spec

> AI agents running property management.

YC AgentPhone Hackathon · Sunday, May 17 2026 · Team: Jakub (tech) + Piotr (ops/keys/business)

---

## 1. The pitch

A pixel-art operating center for AI agents that actually run property management — sourcing vendors, negotiating prices on the phone, booking jobs, paying invoices, and updating tenants. The pixel art is the wrapper. Every agent action is real and touches a real sponsor service.

**One-liner:** *"Homi — AI agents running property management."*

---

## 2. Demo script — 2 minutes, on Jakub's laptop, projected

Pre-loaded state at curtain-up: map view, 8 properties, 3 issues blinking, 6 homies seated in the office, vendor offices scattered across SF. Stripe dashboard pre-open in another tab. Piotr's phone on the demo table, speakerphone armed, ringer on full.

| Time | What the audience sees | What's actually happening |
|---|---|---|
| 0:00 | Title slide → map of SF. Pixel-art, alive: trucks idling, water shimmering, issues blinking. | — |
| 0:10 | "This is Homi. AI agents that run property management." | — |
| 0:20 | Click 1247 Castro (the leak). Camera zooms into the building dollhouse. Floor 2 has a bobbing water-drop cloud. | — |
| 0:30 | Tap the leak. View snaps to the office. Six homies at desks, Ramirez's desk pulses. | Dispatch event fires. Ramirez agent starts. |
| 0:35 | Ramirez side panel opens. **Inside the pixel frame, a real Browser Use video stream**: a cursor visibly navigates Yelp, then Ricky's Plumbing's contact page. Transcript lines stream beneath. | Real Browser Use session + real Moss semantic vendor search. |
| 0:50 | Ramirez finishes. A "memory write" badge flashes. Park's desk pulses. | Supermemory `addMemory()` call. Park agent starts. |
| 0:55 | Park "dials." **Piotr's phone rings audibly on the table.** Piotr puts it on speaker. | The real call recorded this morning plays through Piotr's phone over the room speakers. |
| 1:00–1:15 | Audible negotiation: agent voice haggling with a real SF plumber. Quote drops from $720 → $640. | Pre-recorded real call from this morning. Backend voice pipeline is built but not live. |
| 1:15 | Call ends. "Saved $80." Brooks writes the deal to memory. | Supermemory write. |
| 1:20 | **`cmd+tab` → Stripe dashboard.** A new $640 charge appears, timestamped seconds ago. | Real Stripe test-mode payment via Chen agent. |
| 1:30 | `cmd+tab` back. Map view. **A truck spawns at Ricky's office sprite** and starts animating toward 1247 Castro. ETA badge: "12 min." | Truck routing system. |
| 1:35 | Inbox tab briefly shown — real email to tenant from Okafor ("plumber arriving 3:40pm"). | Real AgentMail send. |
| 1:45 | Sato confirms the booking slot on the vendor's site (Browser Use again, brief). | Real form fill. |
| 1:50 | Time-skip: truck arrives. Property gets a green check. Issue cloud vanishes. | Animation. |
| 1:55 | "Real call. Real payment. Real email. Real vendor booking. Built in ten hours." | — |
| 2:00 | End. | — |

Every sponsor gets a visible 10–15 second moment.

---

## 3. Sponsor → homie mapping

| Homie | Role | Sponsor | What's real |
|---|---|---|---|
| Ramirez | Vendor Sourcer | **Browser Use** + **Moss** | Real headless browser session navigating Yelp / vendor sites; Moss does semantic search across our seeded vendor index |
| Park | Negotiator | **Google DeepMind** (Gemini Live) + **AgentPhone** (telephony) | Pipeline real and tested through AgentPhone's number; demo plays a pre-recorded real call captured this morning |
| Okafor | Tenant Comms | **AgentMail** | Real email sent to a real tenant inbox we control |
| Sato | Scheduler | **Browser Use** | Real form fill on a vendor booking page (Bugout Pest / SparklePros stub we host on Vercel) |
| Chen | Payments | **Stripe** + **Sponge** | Real Stripe test-mode charge; Sponge handles vendor-side invoicing/settlement |
| Brooks | Memory & Coordinator | **Supermemory** | Cross-agent memory layer — every homie reads context in / writes outcomes out via Supermemory |

All seven sponsors covered.

---

## 4. Architecture

```
Next.js 16 app · Vercel · single repo
├── app/
│   ├── page.tsx                       — main dashboard (map / building / office tabs)
│   ├── api/
│   │   ├── dispatch/route.ts          — POST: kick off a homie for an issue
│   │   ├── stream/[dispatchId]/route.ts  — SSE: streams homie events to UI
│   │   ├── voice/call/route.ts        — Gemini Live + AgentPhone (built, unused in demo)
│   │   └── webhooks/{stripe,agentmail}/route.ts
├── lib/
│   ├── agents/
│   │   ├── ramirez.ts                 — vendor sourcing (Browser Use + Moss tools)
│   │   ├── park.ts                    — negotiator (voice pipeline)
│   │   ├── okafor.ts                  — tenant comms (AgentMail tool)
│   │   ├── sato.ts                    — scheduler (Browser Use tool)
│   │   ├── chen.ts                    — payments (Stripe + Sponge tools)
│   │   └── brooks.ts                  — memory coordinator (Supermemory tool)
│   ├── tools/                         — sponsor APIs wrapped as AI SDK tools
│   ├── adapters/mock.ts               — replays the existing POC TRANSCRIPTS as events
│   ├── orchestrator.ts                — dispatch fan-out, event bus, fallback logic
│   └── workflows/settlement.ts        — Vercel WDK durable workflow: call→pay→email→memory
├── components/                        — pixel UI (ported from POC .jsx → .tsx)
├── public/
│   ├── sounds/park-call.mp3           — recorded plumber call for demo
│   └── sprites/                       — exported pixel assets
└── SPEC.md (this file)
```

**Agent runtime:** Vercel AI SDK (`ai` + `@ai-sdk/google`) with Gemini 2.5 Pro. Each homie is a `streamText` loop with a tight set of typed tools. Stream → SSE → UI.

**Durable chain:** Vercel Workflow (WDK) wraps the post-call settlement (call done → Stripe charge → AgentMail confirm → Supermemory write). Everything else is single-shot.

**Persistence:** Supermemory only. No Postgres, no Supabase. Cross-agent state lives in memory writes. This naturally showcases the sponsor.

**Live vs mock:** per-homie env flag (`HOMIE_RAMIREZ_LIVE=1`). Default: live with 5s timeout per tool call → mock fallback. Mock replays the existing POC's pre-baked transcripts as the same event stream. If any sponsor API stalls, the demo never breaks.

---

## 5. Map upgrade — scope-locked

**In scope:**
- Bigger pixel grid (200 × 140) — more breathing room, more SF landmarks legible.
- Vendor offices placed at small icons at real SF coordinates (Ricky's in Mission, Cable Car HVAC near Powell, etc.).
- **Truck routing system.** When a homie dispatches a vendor, a truck sprite spawns at the vendor's office and animates along a route to the property. ETA badge floats above the truck and counts down ("12 min → 8 min → ARRIVED"). On arrival, the property gets a green checkmark and the issue cloud disappears.
- Subtle ambient: water-color shimmer in the bay, idle trucks parked at vendor offices.

**Out of scope (do not build):**
- Day / night cycle.
- Fog drift.
- Planes, cable cars, ferries.
- Isometric / 3D view.
- Zoom transition cinematic.

The truck-with-ETA system **is** the "alive" element because it doubles as the demo throughline.

---

## 6. Build checklist — rough order, no clock

Move fast, do them in this order unless something blocks. Anything below the line is "cut first if behind."

**Foundations**
- [ ] Scaffold Next.js 16 repo, deploy first commit to Vercel.
- [ ] Port `pixel.jsx`, `sprites.jsx`, `styles.css` to TSX. Static views (map / building / office) render.
- [ ] Dispatch API + SSE event stream + mock adapter. Full POC flow works end-to-end on mocks.

**Real plumber call (Piotr-led, asap — call quality drops as the day goes on)**
- [ ] Get AgentPhone number provisioned.
- [ ] Make 3–4 outbound calls to real SF plumbers with the agent's voice (Gemini Live). Verbal consent at the start of each.
- [ ] Capture one usable 15-second clip → `public/sounds/park-call.mp3`.

**Agents (one at a time, end-to-end before moving to the next)**
- [ ] **Browser Use** wired with embedded browser window inside Ramirez's panel — judge must see the live browser inside the pixel UI.
- [ ] **Supermemory** wired (Brooks coordinator; cross-agent reads/writes).
- [ ] **Stripe** wired — real test-mode charge, verified visible on dashboard.
- [ ] **AgentMail** wired — real send to demo tenant inbox.
- [ ] **Moss** wired — semantic vendor search powering Ramirez.
- [ ] **Sponge** wired — vendor-side invoicing/settlement on Chen.
- [ ] **Browser Use** (Sato variant) — booking form fill on stub vendor page we host.

**Voice pipeline (built but not demoed live)**
- [ ] Gemini Live ↔ AgentPhone end-to-end. One successful real call proves it works. Recording stays the demo path.

**Map upgrade**
- [ ] Bigger grid (200 × 140), vendor offices placed at real SF coords.
- [ ] Truck routing + ETA badge system. Truck spawns at vendor, animates to property, counts down to ARRIVED, property green-checks.

**Demo prep**
- [ ] Pre-load demo state (8 properties, 3 blinking issues, 6 homies seated).
- [ ] Pin Stripe dashboard in browser tab. Pin tenant inbox in browser tab. Verify pinned.
- [ ] Hotspot tested as wifi fallback.
- [ ] Rehearse 2-min demo 3× end-to-end. Switch any flaky agent to mock-only.

**Cut first if behind:** map upgrade → Sponge → Moss → AgentMail. Stripe + Browser Use + Supermemory are non-negotiable.

---

## 7. Fallback / risk matrix

| Risk | Mitigation |
|---|---|
| Sponsor API key not delivered in time | That homie ships mock-only. Demo still works; we narrate honestly. Stripe + Browser Use + Supermemory cannot fall to mock. |
| Venue wifi flakes mid-demo | Jakub's phone hotspot tethered as backup; pre-loaded test calls cached. |
| Browser Use stream slow / can't embed live in UI | Show in a side popout window (`cmd+tab` to a browser tab Browser Use is driving). Less elegant but still real. |
| Stripe dashboard tab logged out / wrong | Logged-in tab pinned and verified at final rehearsal. |
| Recorded plumber call audio quiet on stage | Test speakerphone volume during rehearsal. Backup: route audio through laptop instead of phone. |
| Voice pipeline doesn't work in time | Acceptable — backend exists, we narrate it as "built, not demoed live for time." |
| Map upgrade not done | Ship POC's existing map. The trucks-with-ETAs is the only nice-to-have. |
| Browser Use embed can't render inside pixel panel | Fall back to a popout window driven by the same Browser Use session. Less elegant; still real. |
| Agent loop infinite-loops on stage | 30-second hard timeout per homie. Auto-fallback to mock event stream on timeout. |

---

## 8. Out of scope (explicit)

- User auth / multi-tenant. One demo property manager.
- Real tenant database. We have 8 fake properties.
- Mobile app.
- Onboarding flow.
- Settings / admin UI.
- Any view we don't show in the 2-minute demo.

---

## 9. Locked decisions

- **Tenant inbox:** Piotr provides the Gmail address — drop it into `DEMO_TENANT_EMAIL` env var when ready.
- **Voice carrier:** AgentPhone (the host) provides the number. No Twilio.
- **Gemini model:** `gemini-2.5-pro` everywhere. Downgrade only if rate-limited mid-build.
- **Browser Use surface:** embedded browser window rendered *inside* the homie's pixel panel. The judge sees a real browser working inside the pixel frame — that's the visual proof. No `cmd+tab` fallback unless the embed API outright fails.
