// Rung 1 — bare dial. Places a call with a hardcoded greeting, hangs up.
// Run: npx tsx --env-file=.env.local scripts/voice-rung1.ts
import 'dotenv/config';
import { placeOutboundCall, waitForCall } from '../lib/tools/agentphone';

async function main() {
  const to = process.env.PIOTR_PHONE;
  if (!to) throw new Error('PIOTR_PHONE not set in .env.local');

  console.log(`Placing call to ${to}...`);
  const { callId } = await placeOutboundCall({
    toNumber: to,
    greeting:
      "Hi, this is Park calling on behalf of Homi Property Management. This is a test call — I'll hang up now.",
    scenario:
      'You are running a 5-second test call. After the opening greeting, say "Goodbye." and end the call. Do not engage further.',
  });
  console.log(`Call placed: ${callId}`);
  console.log('Waiting for completion (polling every 2s)...');

  const r = await waitForCall(callId, { timeoutMs: 60_000 });
  console.log(`\nResult: status=${r.status} duration=${r.durationSec ?? '?'}s`);
  console.log(`Transcript (${r.transcript.length} turns):`);
  for (const t of r.transcript) {
    console.log(`  ${t.speaker}: ${t.text}`);
  }
  if (r.recordingUrl) console.log(`\nRecording: ${r.recordingUrl}`);
}

main().catch((e) => {
  console.error('rung 1 failed:', e);
  process.exit(1);
});
