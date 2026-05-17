import type { DispatchContext, HomieEvent } from '../types';
import { bookVendor } from '../tools/browserUse';
import { pickVendorForTrade } from '../data/vendors';

const SATO_TIMEOUT_MS = 120_000;

export async function* runSato(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);

  // The vendor stub form must be reachable from Browser Use Cloud. Set
  // VENDOR_FORM_URL to a Vercel preview deployment of /vendor/book.
  const formUrl = process.env.VENDOR_FORM_URL;

  yield {
    type: 'started',
    homieId: 'sato',
    task: `Booking ${vendor.name} on vendor portal`,
    issueId: ctx.issueId,
  };

  if (!formUrl) {
    yield {
      type: 'error',
      homieId: 'sato',
      message: 'VENDOR_FORM_URL not set — set to a public URL pointing at /vendor/book',
      recoverable: false,
    };
    return;
  }

  const payload = {
    address: ctx.propertyId,
    unit: '—',
    trade: ctx.vendorTrade,
    vendor: vendor.name,
    when: 'today 3:40pm',
  };

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('sato-timeout')), SATO_TIMEOUT_MS),
  );

  let result;
  try {
    result = await Promise.race([bookVendor(formUrl, payload), timeout]);
  } catch (e) {
    yield {
      type: 'error',
      homieId: 'sato',
      message: e instanceof Error ? e.message : String(e),
      recoverable: false,
    };
    return;
  }

  yield {
    type: 'browser_frame',
    homieId: 'sato',
    sessionUrl: result.liveUrl,
  };
  yield {
    type: 'transcript_line',
    homieId: 'sato',
    who: 'sys',
    text: `Confirmation: ${result.confirmationNumber} (${result.vendorName})`,
  };

  const routeId = `route-${result.confirmationNumber}`;
  yield {
    type: 'truck_dispatched',
    vendorId: vendor.id,
    propertyId: ctx.propertyId,
    etaMinutes: 12,
    routeId,
  };
  yield {
    type: 'done',
    homieId: 'sato',
    summary: `Booking confirmed ${result.confirmationNumber}`,
  };
  yield {
    type: 'handoff',
    fromHomieId: 'sato',
    toHomieId: 'okafor',
    reason: 'notify tenant',
  };
}
