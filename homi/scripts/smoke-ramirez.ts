// Smoke test: Ramirez (vendor sourcing) live integration.
// Verifies: Browser Use session opens, returns a liveUrl, runs the goal,
// emits structured output, and stops cleanly.
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-ramirez.ts
//
// Side effect to verify:
//   1. liveUrl printed below — open in a browser, watch the agent click
//   2. Session shows in https://cloud.browser-use.com dashboard, then stops

import 'dotenv/config';
import type { HomieEvent } from '../lib/types';
import { runRamirez } from '../lib/agents/ramirez';
import { createAsserter, header } from './_assert';
import { buildSmokeCtx } from './_ctx';

async function main() {
  const ctx = buildSmokeCtx({ dispatchId: 'smoke-ramirez', outcome: {} });
  const a = createAsserter('ramirez');

  if (!process.env.BROWSER_USE_API_KEY) {
    console.error('BROWSER_USE_API_KEY not set');
    process.exit(1);
  }

  header('RAMIREZ');
  const startedAt = Date.now();
  const events: HomieEvent[] = [];
  let liveUrlSeenAtMs: number | null = null;

  for await (const e of runRamirez(ctx)) {
    console.log(JSON.stringify(e));
    events.push(e);
    if (e.type === 'browser_frame' && liveUrlSeenAtMs === null) {
      liveUrlSeenAtMs = Date.now() - startedAt;
      console.log(`\n  ▶ OPEN THIS URL TO WATCH: ${(e as { sessionUrl: string }).sessionUrl}\n`);
    }
  }

  const browserFrame = events.find((e) => e.type === 'browser_frame') as
    | { sessionUrl: string }
    | undefined;
  const transcriptLines = events.filter((e) => e.type === 'transcript_line');
  const memoryWrite = events.find((e) => e.type === 'memory_write');
  const errors = events.filter((e) => e.type === 'error');
  const done = events.find((e) => e.type === 'done');

  a.expect(
    Boolean(browserFrame?.sessionUrl),
    'browser_frame event with liveUrl fired',
  );
  a.expect(
    liveUrlSeenAtMs !== null && liveUrlSeenAtMs < 30_000,
    `liveUrl appeared within 30s (got: ${liveUrlSeenAtMs}ms)`,
  );
  a.expect(
    browserFrame?.sessionUrl?.includes('browser-use.com') ||
      browserFrame?.sessionUrl?.startsWith('https://'),
    'liveUrl is a Browser Use https URL',
  );
  a.expect(transcriptLines.length >= 1, 'at least one transcript_line emitted');
  a.expect(Boolean(memoryWrite), 'memory_write (shortlist) emitted');
  a.expect(errors.length === 0, 'no error events');
  a.expect(Boolean(done), 'done event emitted');

  if (browserFrame?.sessionUrl) {
    a.note(`Live session URL (still presigned, paste into browser): ${browserFrame.sessionUrl}`);
  }
  a.note('Verify in dashboard: https://cloud.browser-use.com');

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('smoke crashed:', e);
  process.exit(1);
});
