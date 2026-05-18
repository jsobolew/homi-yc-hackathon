// Smoke test: Brooks (memory) live integration.
// Verifies: Gemini reads prior deals from Supermemory, then writes a new outcome.
//
// Run:  npx tsx --env-file=.env.local scripts/smoke-brooks.ts
// Pre:  scripts/seed-supermemory.ts must have been run ≥30s prior so the
//       3 seeded deals are searchable. Re-seed before each demo.
//
// Side effect to verify in Supermemory console:
//   https://console.supermemory.ai — new `deal.*.2026-05-17` entry under
//   containerTag `homi:demo`.

import 'dotenv/config';
import type { HomieEvent } from '../lib/types';
import { runBrooksRead, runBrooksWrite } from '../lib/agents/brooks';
import { createAsserter, header } from './_assert';
import { buildSmokeCtx } from './_ctx';

async function collect(
  gen: AsyncGenerator<HomieEvent>,
): Promise<HomieEvent[]> {
  const events: HomieEvent[] = [];
  for await (const e of gen) {
    console.log(JSON.stringify(e));
    events.push(e);
  }
  return events;
}

async function main() {
  const ctx = buildSmokeCtx({ dispatchId: 'smoke-brooks' });
  const a = createAsserter('brooks');

  header('BROOKS READ');
  const readEvents = await collect(runBrooksRead(ctx));

  const memoryReads = readEvents.filter((e) => e.type === 'memory_read');
  const transcriptLines = readEvents
    .filter((e) => e.type === 'transcript_line')
    .map((e) => (e as { text: string }).text)
    .join(' ');
  const readErrors = readEvents.filter((e) => e.type === 'error');
  const readDone = readEvents.find((e) => e.type === 'done');

  a.expect(memoryReads.length >= 1, 'memory_read event fired (Supermemory hit)');
  a.expect(
    transcriptLines.length > 0,
    'Gemini produced transcript output',
  );
  a.expect(
    /ricky/i.test(transcriptLines) || /past|prior|previous/i.test(transcriptLines),
    'transcript references prior deal context (Ricky / prior)',
  );
  a.expect(readErrors.length === 0, 'no error events during read');
  a.expect(Boolean(readDone), 'done event emitted at end of read');

  header('BROOKS WRITE');
  const writeEvents = await collect(runBrooksWrite(ctx));

  const memoryWrites = writeEvents.filter((e) => e.type === 'memory_write') as {
    key: string;
    value: string;
  }[];
  const writeErrors = writeEvents.filter((e) => e.type === 'error');
  const writeDone = writeEvents.find((e) => e.type === 'done');

  a.expect(memoryWrites.length === 1, 'exactly one memory_write event fired');
  a.expect(
    memoryWrites[0]?.key?.startsWith('deal.'),
    `memory_write key starts with "deal." (got: ${memoryWrites[0]?.key ?? 'none'})`,
  );
  a.expect(
    memoryWrites[0]?.value?.toLowerCase().includes('ricky'),
    'memory_write value mentions vendor (Ricky)',
  );
  a.expect(writeErrors.length === 0, 'no error events during write');
  a.expect(Boolean(writeDone), 'done event emitted at end of write');

  a.note('Verify in console: https://console.supermemory.ai (containerTag homi:demo)');

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('smoke crashed:', e);
  process.exit(1);
});
