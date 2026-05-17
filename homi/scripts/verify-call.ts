import 'dotenv/config';
import { waitForCall } from '../lib/tools/agentphone';

async function main() {
  const callId = process.argv[2];
  if (!callId) throw new Error('usage: verify-call.ts <callId>');
  const r = await waitForCall(callId, { timeoutMs: 5000 });
  console.log(`status: ${r.status}  duration: ${r.durationSec}s`);
  console.log(`transcript (${r.transcript.length} turns):`);
  for (const t of r.transcript) console.log(`  ${t.speaker}: ${t.text}`);
  if (r.recordingUrl) console.log(`recording: ${r.recordingUrl}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
