// Smoke test: Park (voice negotiator) live integration.
// Verifies: real outbound call placed via AgentPhone, SSE stream delivers
// transcript turns LIVE (not all at the end), call completes cleanly.
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-park.ts
//
// PLACES A REAL CALL to PARK_TARGET_NUMBER (or PIOTR_PHONE as fallback).
//
// Side effect to verify:
//   1. Phone rings on the target number, conversation happens
//   2. transcript lines stream into terminal in real time
//   3. Call shows in AgentPhone console with a recording URL
//
// For the parsed-outcome path to trigger, the human picking up should:
//   - Say a clear price like "two-fifty" or "$300"
//   - Say a time like "today around three" or "tomorrow morning"
//   - Confirm: "yeah I can come"
// Otherwise the script will fall back to deterministic values — still passes.

import 'dotenv/config';
import type { HomieEvent } from '../lib/types';
import { runPark } from '../lib/agents/park';
import { createAsserter, header } from './_assert';
import { buildSmokeCtx } from './_ctx';

async function main() {
  // Park uses PARK_TARGET_NUMBER → PIOTR_PHONE fallback. For the smoke, force
  // it to PIOTR_PHONE if not explicitly set, so we don't accidentally call a
  // real plumber during testing.
  if (!process.env.PARK_TARGET_NUMBER && process.env.PIOTR_PHONE) {
    process.env.PARK_TARGET_NUMBER = process.env.PIOTR_PHONE;
  }

  const ctx = buildSmokeCtx({ dispatchId: 'smoke-park' });
  const a = createAsserter('park');

  if (!process.env.AGENTPHONE_API_KEY || !process.env.PARK_AGENT_ID) {
    console.error('AGENTPHONE_API_KEY or PARK_AGENT_ID not set');
    process.exit(1);
  }
  if (!process.env.PARK_TARGET_NUMBER) {
    console.error('PARK_TARGET_NUMBER (or PIOTR_PHONE) not set');
    process.exit(1);
  }

  header('PARK');
  console.log(`target: ${process.env.PARK_TARGET_NUMBER}`);
  console.log('placing call — answer the phone to verify live streaming…\n');

  const startedAt = Date.now();
  const events: HomieEvent[] = [];
  const turnArrivals: number[] = []; // ms elapsed when each transcript turn arrived

  for await (const e of runPark(ctx)) {
    const elapsed = Date.now() - startedAt;
    console.log(`[+${String(elapsed).padStart(6)}ms] ${JSON.stringify(e)}`);
    events.push(e);
    if (e.type === 'transcript_line' && (e as { who: string }).who !== 'sys') {
      turnArrivals.push(elapsed);
    }
  }
  const totalElapsed = Date.now() - startedAt;

  const errors = events.filter((e) => e.type === 'error');
  const done = events.find((e) => e.type === 'done') as
    | { summary: string }
    | undefined;
  const transcriptTurns = events.filter(
    (e) => e.type === 'transcript_line' && (e as { who: string }).who !== 'sys',
  );

  a.expect(errors.length === 0, 'no error events');
  a.expect(transcriptTurns.length >= 1, 'at least one transcript turn captured');
  a.expect(Boolean(done), 'done event emitted');
  a.expect(
    /completed/i.test(done?.summary ?? ''),
    `call completed (summary: ${done?.summary})`,
  );

  // LIVE-streaming check: the gap between the first turn and the `done` event
  // should be > 3s. If all turns arrived in the last <500ms, that's polling-
  // style batching, not live SSE.
  if (turnArrivals.length >= 1) {
    const firstTurnMs = turnArrivals[0]!;
    const gapToEndMs = totalElapsed - firstTurnMs;
    a.expect(
      gapToEndMs > 3_000,
      `first turn arrived live, not batched at end (first turn at +${firstTurnMs}ms, ended at +${totalElapsed}ms, gap=${gapToEndMs}ms)`,
    );
  }

  a.note(`Total elapsed: ${totalElapsed}ms`);
  a.note(`Turn arrival times (ms): ${turnArrivals.join(', ') || '(none)'}`);
  a.note(
    `Outcome: priceCents=${ctx.outcome.priceCents}, eta="${ctx.outcome.etaText}", source=${ctx.outcome.outcomeSource}, vendorConfirmed=${ctx.outcome.vendorConfirmed}`,
  );

  // Soft assertion — only enforced when extraction succeeded. Not a hard fail
  // since we can't guarantee Piotr/test caller speaks a clean price+ETA.
  if (ctx.outcome.outcomeSource === 'parsed') {
    a.expect(
      (ctx.outcome.priceCents ?? 0) >= 5_000 && (ctx.outcome.priceCents ?? 0) <= 200_000,
      'parsed price within $50–$2000 sanity range',
    );
    a.expect(
      Boolean(ctx.outcome.etaText && ctx.outcome.etaText.length > 0),
      'parsed ETA non-empty',
    );
  }

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('smoke crashed:', e);
  process.exit(1);
});
