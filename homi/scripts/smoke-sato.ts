// Smoke test: Sato (vendor scheduling via Browser Use form-fill).
// Verifies: Browser Use opens a session, fills a public form, submits, and
// returns a structured confirmation.
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-sato.ts
//
// Test target: https://httpbin.org/forms/post — public form with named
// fields. Browser Use should fill them by name from the payload JSON, click
// submit, then read the JSON response page that httpbin renders.
//
// This calls `bookVendor` directly (not `runSato`) because Sato's hardcoded
// payload shape (address/unit/trade/...) doesn't match httpbin's fields.
// Once we deploy /vendor/book to a Vercel preview, swap VENDOR_FORM_URL and
// run the full `runSato` smoke through the orchestrator instead.
//
// Side effect to verify:
//   1. liveUrl printed below — open in a browser, watch the agent fill
//   2. Session shows in https://cloud.browser-use.com dashboard, then stops

import 'dotenv/config';
import { bookVendor } from '../lib/tools/browserUse';
import { createAsserter, header } from './_assert';

const FORM_URL = process.env.SATO_SMOKE_FORM_URL ?? 'https://httpbin.org/forms/post';

const PAYLOAD: Record<string, string> = {
  custname: 'Homi Property Mgmt',
  custtel: '555-0100',
  custemail: 'sato-smoke@homi.test',
  size: 'medium',
  topping: 'bacon',
  delivery: '19:00',
  comments:
    'Smoke test booking — confirmation number is the request URL or any unique id httpbin returns.',
};

async function main() {
  const a = createAsserter('sato');

  if (!process.env.BROWSER_USE_API_KEY) {
    console.error('BROWSER_USE_API_KEY not set');
    process.exit(1);
  }

  header('SATO');
  console.log(`form URL:    ${FORM_URL}`);
  console.log(`payload:     ${JSON.stringify(PAYLOAD)}`);
  console.log('');

  const startedAt = Date.now();
  let result: Awaited<ReturnType<typeof bookVendor>> | null = null;
  let caught: unknown = null;
  try {
    result = await bookVendor(FORM_URL, PAYLOAD);
  } catch (e) {
    caught = e;
  }
  const elapsedMs = Date.now() - startedAt;

  if (caught) {
    console.log(`ERROR: ${caught instanceof Error ? caught.message : String(caught)}`);
  } else if (result) {
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log(`  ▶ OPEN THIS URL TO WATCH (if still live): ${result.liveUrl}`);
    console.log('');
  }

  a.expect(!caught, `bookVendor completed without throwing (elapsed: ${elapsedMs}ms)`);
  a.expect(
    result?.liveUrl?.startsWith('https://'),
    'liveUrl returned (Browser Use session opened)',
  );
  a.expect(Boolean(result?.sessionId), 'sessionId returned');
  a.expect(
    Boolean(result?.confirmationNumber && result.confirmationNumber.length > 0),
    `confirmationNumber non-empty (got: "${result?.confirmationNumber ?? ''}")`,
  );
  a.expect(
    Boolean(result?.vendorName && result.vendorName.length > 0),
    `vendorName non-empty (got: "${result?.vendorName ?? ''}")`,
  );

  a.note('Verify in dashboard: https://cloud.browser-use.com');
  a.note('Once /vendor/book is deployed, swap form URL and rerun via runSato');

  process.exit(a.summarize());
}

main().catch((e) => {
  console.error('smoke crashed:', e);
  process.exit(1);
});
