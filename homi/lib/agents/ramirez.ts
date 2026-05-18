import type { DispatchContext, HomieEvent } from '../types';
import { startBrowseSession, stopSession } from '../tools/browserUse';
import { pickVendorForTrade } from '../data/vendors';

const RAMIREZ_TIMEOUT_MS = 90_000;

export async function* runRamirez(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);
  const goal = `Search Yelp for the best-rated ${ctx.vendorTrade} contractor in San Francisco that can do same-day service. Pull up the top result's profile page, read the rating, recent reviews, and phone number, then return a short JSON summary including: name, rating, reviewCount, phone.`;

  yield {
    type: 'started',
    homieId: 'ramirez',
    task: `Sourcing ${ctx.vendorTrade} vendors`,
    issueId: ctx.issueId,
  };

  let session: { sessionId: string; liveUrl: string; done: Promise<{ output: string }> };
  try {
    session = await startBrowseSession(goal);
  } catch (e) {
    yield {
      type: 'error',
      homieId: 'ramirez',
      message: `Browser Use session failed: ${
        e instanceof Error ? e.message : String(e)
      }`,
      recoverable: false,
    };
    return;
  }

  yield {
    type: 'browser_frame',
    homieId: 'ramirez',
    sessionUrl: session.liveUrl,
  };
  yield {
    type: 'transcript_line',
    homieId: 'ramirez',
    who: 'sys',
    text: `Live browse session ready — agent searching Yelp for ${ctx.vendorTrade} contractors`,
  };

  const timeout = new Promise<{ output: string }>((_, reject) =>
    setTimeout(() => reject(new Error('ramirez-timeout')), RAMIREZ_TIMEOUT_MS),
  );

  let output = '';
  try {
    const r = await Promise.race([session.done, timeout]);
    output = r.output;
  } catch (e) {
    yield {
      type: 'error',
      homieId: 'ramirez',
      message: e instanceof Error ? e.message : String(e),
      recoverable: true,
    };
  } finally {
    await stopSession(session.sessionId);
  }

  if (output) {
    yield {
      type: 'transcript_line',
      homieId: 'ramirez',
      who: 'sys',
      text: output.slice(0, 600),
    };
  }

  // Record the chosen vendor for downstream agents. (Even when Browser Use
  // returns something useful, we currently fall back to the seeded vendor
  // list — the live search is demo flavor; the seeded vendor is the source
  // of truth for the rest of the chain.)
  ctx.outcome.vendorId = vendor.id;
  ctx.outcome.vendorName = vendor.name;
  ctx.outcome.vendorPhone = vendor.phone;

  yield {
    type: 'memory_write',
    homieId: 'ramirez',
    key: `shortlist.${ctx.issueId}`,
    value: `top vendor: ${vendor.name} (rating ${vendor.rating})`,
  };
  yield {
    type: 'done',
    homieId: 'ramirez',
    summary: `Shortlisted ${vendor.name}`,
  };
  yield {
    type: 'handoff',
    fromHomieId: 'ramirez',
    toHomieId: 'brooks',
    reason: 'store shortlist',
  };
}
