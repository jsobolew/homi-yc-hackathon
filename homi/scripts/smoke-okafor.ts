// Smoke test: Okafor (tenant comms) live integration.
// Verifies: Gemini composes + sends a tenant email via AgentMail.
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-okafor.ts
//
// Side effect to verify:
//   1. Email arrives at $DEMO_TENANT_EMAIL inbox.
//   2. Thread visible at the printed AgentMail console URL.

import 'dotenv/config';
import type { HomieEvent } from '../lib/types';
import { runOkafor } from '../lib/agents/okafor';
import { createAsserter, header } from './_assert';
import { buildSmokeCtx } from './_ctx';

async function main() {
  const ctx = buildSmokeCtx({ dispatchId: 'smoke-okafor' });
  const a = createAsserter('okafor');

  header('OKAFOR');
  const events: HomieEvent[] = [];
  for await (const e of runOkafor(ctx)) {
    console.log(JSON.stringify(e));
    events.push(e);
  }

  const emailSent = events.find((e) => e.type === 'email_sent') as
    | { to: string; subject: string; inboxUrl?: string }
    | undefined;
  const transcriptLines = events
    .filter((e) => e.type === 'transcript_line')
    .map((e) => (e as { text: string }).text)
    .join(' ');
  const errors = events.filter((e) => e.type === 'error');
  const done = events.find((e) => e.type === 'done');

  a.expect(Boolean(emailSent), 'email_sent event fired (AgentMail send succeeded)');
  a.expect(
    emailSent?.to === process.env.DEMO_TENANT_EMAIL,
    `recipient matches DEMO_TENANT_EMAIL (got: ${emailSent?.to})`,
  );
  a.expect(
    Boolean(emailSent?.subject && emailSent.subject.length > 0),
    `subject line non-empty (got: "${emailSent?.subject ?? ''}")`,
  );
  a.expect(
    Boolean(emailSent?.inboxUrl?.startsWith('https://console.agentmail.to')),
    'AgentMail console URL returned',
  );
  a.expect(transcriptLines.length > 0, 'Gemini produced transcript output');
  a.expect(errors.length === 0, 'no error events');
  a.expect(Boolean(done), 'done event emitted');

  if (emailSent?.inboxUrl) {
    a.note(`Verify thread: ${emailSent.inboxUrl}`);
    a.note(`Verify inbox: ${process.env.DEMO_TENANT_EMAIL}`);
  }

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('smoke crashed:', e);
  process.exit(1);
});
