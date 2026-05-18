// End-to-end smoke: full orchestrator chain with all live flags = 1.
//
// Runs: brooks-read → ramirez → park → chen → sato → okafor → brooks-write
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-orchestrator.ts
//
// Side effects (real):
//   - Supermemory: read + write under containerTag homi:demo
//   - Browser Use: 2 sessions (ramirez + sato)
//   - AgentPhone: 1 outbound call to PARK_TARGET_NUMBER (Piotr)
//   - Stripe: 1 test payment intent
//   - AgentMail: 1 email to DEMO_TENANT_EMAIL
//
// Cost: ~$0.20 per run.

import 'dotenv/config';
import type { HomieEvent } from '../lib/types';
import { createBus, subscribe, onFinish, getDispatch } from '../lib/bus';
import { run } from '../lib/orchestrator';
import { createAsserter, header } from './_assert';

const DISPATCH_ID = `e2e-${Date.now()}`;
const ISSUE_ID = process.env.SMOKE_ISSUE_ID ?? 'i1'; // i1 = open plumbing at p1

function liveFlag(id: string): string {
  return process.env[`HOMIE_${id.toUpperCase()}_LIVE`] ?? '0';
}

async function main() {
  header('ORCHESTRATOR END-TO-END');
  console.log(`dispatchId: ${DISPATCH_ID}`);
  console.log(`issueId:    ${ISSUE_ID}`);
  console.log(`flags:      brooks=${liveFlag('brooks')} ramirez=${liveFlag('ramirez')} park=${liveFlag('park')} chen=${liveFlag('chen')} sato=${liveFlag('sato')} okafor=${liveFlag('okafor')}`);
  console.log(`park dial:  ${process.env.PARK_TARGET_NUMBER ?? '(unset)'}`);
  console.log(`sato form:  ${process.env.VENDOR_FORM_URL ?? '(unset)'}`);
  console.log('');

  const a = createAsserter('orchestrator');
  createBus(DISPATCH_ID, ISSUE_ID);

  const startedAt = Date.now();
  const events: HomieEvent[] = [];
  const homieFirstSeen = new Map<string, number>();

  const unsub = subscribe(DISPATCH_ID, (e) => {
    const elapsed = Date.now() - startedAt;
    console.log(`[+${String(elapsed).padStart(6)}ms] ${JSON.stringify(e)}`);
    events.push(e);
    const homieId = (e as { homieId?: string }).homieId;
    if (homieId && !homieFirstSeen.has(homieId)) {
      homieFirstSeen.set(homieId, elapsed);
    }
  });

  const finishPromise = new Promise<void>((resolve) => {
    onFinish(DISPATCH_ID, () => resolve());
  });

  await run(DISPATCH_ID, ISSUE_ID);
  await finishPromise;
  unsub();

  const totalElapsed = Date.now() - startedAt;
  const dispatch = getDispatch(DISPATCH_ID);

  console.log('');
  header('SUMMARY');

  // Per-homie outcomes
  const errors = events.filter((e) => e.type === 'error') as {
    homieId: string;
    message: string;
    recoverable: boolean;
  }[];
  const doneHomies = new Set(
    events.filter((e) => e.type === 'done').map((e) => (e as { homieId: string }).homieId),
  );
  const expectedHomies = ['brooks', 'ramirez', 'park', 'chen', 'sato', 'okafor'];

  for (const h of expectedHomies) {
    const seen = homieFirstSeen.get(h);
    const done = doneHomies.has(h);
    const err = errors.find((e) => e.homieId === h);
    const status = err ? `error: ${err.message.slice(0, 80)}` : done ? 'done' : 'no-done';
    a.expect(
      done && !err,
      `${h.padEnd(8)} reached done (first event +${seen ?? '—'}ms) [${status}]`,
    );
  }

  // Resolution
  const resolved = events.find((e) => e.type === 'issue_resolved');
  a.expect(Boolean(resolved), 'issue_resolved emitted');
  a.expect(dispatch?.status === 'done', `dispatch finished with status=done (got: ${dispatch?.status})`);

  // Side-effect proofs surfaced in events
  const payment = events.find((e) => e.type === 'payment') as
    | { chargeId: string; dashboardUrl: string }
    | undefined;
  const emailSent = events.find((e) => e.type === 'email_sent') as
    | { inboxUrl?: string }
    | undefined;
  const browserFrames = events.filter((e) => e.type === 'browser_frame') as {
    homieId: string;
    sessionUrl: string;
  }[];
  const parkRecording = events.find(
    (e) => e.type === 'transcript_line' && /Recording:/.test((e as { text?: string }).text ?? ''),
  ) as { text: string } | undefined;

  a.expect(Boolean(payment?.chargeId?.startsWith('pi_')), 'stripe charge created');
  a.expect(
    Boolean(emailSent?.inboxUrl?.startsWith('https://console.agentmail.to')),
    'tenant email sent',
  );
  a.expect(
    browserFrames.some((b) => b.homieId === 'ramirez'),
    'ramirez opened a Browser Use session',
  );
  a.expect(
    browserFrames.some((b) => b.homieId === 'sato'),
    'sato opened a Browser Use session',
  );

  console.log('');
  console.log(`Total elapsed: ${(totalElapsed / 1000).toFixed(1)}s`);
  if (payment?.dashboardUrl) console.log(`Stripe charge: ${payment.dashboardUrl}`);
  if (emailSent?.inboxUrl) console.log(`Tenant thread: ${emailSent.inboxUrl}`);
  for (const b of browserFrames) console.log(`Browser session (${b.homieId}): ${b.sessionUrl}`);
  if (parkRecording) console.log(parkRecording.text);

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('orchestrator smoke crashed:', e);
  process.exit(1);
});
