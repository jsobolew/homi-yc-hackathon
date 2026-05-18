// Smoke test: Chen (payments) live integration.
// Verifies: Gemini calls Stripe paymentIntents.create for $640.
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-chen.ts
//
// Side effect to verify:
//   Payment visible at the printed dashboard URL
//   (https://dashboard.stripe.com/test/payments/pi_...).

import 'dotenv/config';
import type { HomieEvent } from '../lib/types';
import { runChen } from '../lib/agents/chen';
import { createAsserter, header } from './_assert';
import { buildSmokeCtx } from './_ctx';

async function main() {
  const ctx = buildSmokeCtx({ dispatchId: 'smoke-chen' });
  const a = createAsserter('chen');

  header('CHEN');
  const events: HomieEvent[] = [];
  for await (const e of runChen(ctx)) {
    console.log(JSON.stringify(e));
    events.push(e);
  }

  const payment = events.find((e) => e.type === 'payment') as
    | {
        amountCents: number;
        vendor: string;
        chargeId: string;
        dashboardUrl: string;
      }
    | undefined;
  const errors = events.filter((e) => e.type === 'error');
  const done = events.find((e) => e.type === 'done');

  a.expect(Boolean(payment), 'payment event fired (Stripe charge succeeded)');
  a.expect(
    payment?.chargeId?.startsWith('pi_'),
    `chargeId is a Stripe PaymentIntent id (got: ${payment?.chargeId ?? 'none'})`,
  );
  a.expect(
    payment?.amountCents === 64000,
    `amount is $640 / 64000 cents (got: ${payment?.amountCents})`,
  );
  a.expect(
    payment?.vendor?.toLowerCase().includes('ricky'),
    `vendor name mentions Ricky (got: ${payment?.vendor})`,
  );
  a.expect(
    payment?.dashboardUrl?.startsWith('https://dashboard.stripe.com/test/payments/'),
    'dashboard URL is well-formed',
  );
  a.expect(errors.length === 0, 'no error events');
  a.expect(Boolean(done), 'done event emitted');

  if (payment?.dashboardUrl) a.note(`Verify charge: ${payment.dashboardUrl}`);

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('smoke crashed:', e);
  process.exit(1);
});
