import type { DispatchContext, HomieEvent, DispatchOutcome } from '../types';
import { placeOutboundCall, getCall } from '../tools/agentphone';
import { streamCallTranscript } from '../tools/agentphoneStream';
import { VENDORS, pickVendorForTrade } from '../data/vendors';
import { extractParkOutcome, type ParkTurn } from './parkExtractor';

const DEFAULT_SAVINGS_CENTS = 8_000;
const DEFAULT_ETA = 'today 3:40pm';
const PRICE_MIN_CENTS = 5_000; // $50
const PRICE_MAX_CENTS = 200_000; // $2,000

function buildScenario(ctx: DispatchContext, vendorName: string): string {
  return [
    `You are Park from Homi property management calling ${vendorName} about a ${ctx.issueLabel.toLowerCase()} at ${ctx.propertyAddress}.`,
    `Ask EXACTLY two questions and nothing else:`,
    `1. "What's your price?"`,
    `2. "When can you get here?"`,
    `Once you hear both answers, say "Great, booking it. Thanks." and end the call.`,
    `Do NOT introduce yourself at length. Do NOT ask for consent. Do NOT ask follow-up questions. Do NOT explain who Homi is. Keep total call under 20 seconds.`,
  ].join(' ');
}

// Park is voice-only — no Gemini in the loop. AgentPhone's own conversation
// engine drives the call (negotiator system prompt already lives on the agent).
// We place the call, then stream transcript turns LIVE via SSE, emitting
// transcript_line events as the conversation happens (not at the end).
//
// To call a real number, set PARK_TARGET_NUMBER in .env.local (E.164). If unset,
// Park falls back to the mock vendor's seeded number; if THAT's a fake +1-555,
// we emit a polite error and bail.

const CALL_TIMEOUT_MS = 5 * 60_000;

export async function* runPark(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  // Prefer the vendor Ramirez already chose (sits on ctx.outcome). Fall back
  // to the deterministic seeded pick if Ramirez was skipped or errored.
  const fallbackVendor = pickVendorForTrade(ctx.vendorTrade as never);
  const vendorName = ctx.outcome.vendorName ?? fallbackVendor.name;
  const vendorBaseQuote =
    VENDORS.find((v) => v.name === vendorName)?.baseQuote ?? fallbackVendor.baseQuote;
  const fallbackPhone = ctx.outcome.vendorPhone ?? fallbackVendor.phone;
  const target = process.env.PARK_TARGET_NUMBER ?? fallbackPhone;

  yield {
    type: 'started',
    homieId: 'park',
    task: `Calling ${vendorName}`,
    issueId: ctx.issueId,
  };

  if (!process.env.PARK_AGENT_ID || !process.env.AGENTPHONE_FROM_NUMBER_ID) {
    yield {
      type: 'error',
      homieId: 'park',
      message: 'PARK_AGENT_ID or AGENTPHONE_FROM_NUMBER_ID missing',
      recoverable: false,
    };
    return;
  }
  if (!target || target.startsWith('+1-555') || target.startsWith('555')) {
    yield {
      type: 'error',
      homieId: 'park',
      message: `No real target number to dial (set PARK_TARGET_NUMBER). Got: ${target}`,
      recoverable: false,
    };
    return;
  }

  yield {
    type: 'transcript_line',
    homieId: 'park',
    who: 'sys',
    text: `Dialing ${target}…`,
  };

  let callId: string;
  try {
    const r = await placeOutboundCall({
      toNumber: target,
      scenario: buildScenario(ctx, vendorName),
      greeting: `Hi, Park from Homi — quick question, what's your price and when can you get to a ${ctx.issueLabel.toLowerCase()} at ${ctx.propertyAddress}?`,
      variables: {
        vendor: vendorName,
        trade: ctx.vendorTrade,
        property: ctx.propertyAddress,
        issue: ctx.issueLabel,
      },
    });
    callId = r.callId;
  } catch (e) {
    yield {
      type: 'error',
      homieId: 'park',
      message: `Place call failed: ${e instanceof Error ? e.message : String(e)}`,
      recoverable: false,
    };
    return;
  }

  yield {
    type: 'transcript_line',
    homieId: 'park',
    who: 'sys',
    text: `Call placed (${callId.slice(0, 10)}…), streaming transcript…`,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort('park-timeout'), CALL_TIMEOUT_MS);

  let endedStatus = 'unknown';
  let durationSec: number | undefined;
  const turns: ParkTurn[] = [];
  try {
    for await (const ev of streamCallTranscript(callId, { signal: ctrl.signal })) {
      switch (ev.type) {
        case 'turn':
          turns.push({ role: ev.role, content: ev.content });
          yield {
            type: 'transcript_line',
            homieId: 'park',
            who: ev.role === 'user' ? 'them' : 'you',
            text: ev.content,
          };
          break;
        case 'ended':
          endedStatus = ev.status;
          durationSec = ev.durationSeconds;
          break;
        // 'connected' is metadata-only; nothing useful to surface in UI
      }
    }
  } catch (e) {
    yield {
      type: 'error',
      homieId: 'park',
      message: `Stream failed: ${e instanceof Error ? e.message : String(e)}`,
      recoverable: false,
    };
    return;
  } finally {
    clearTimeout(timeout);
  }

  // Fetch final call detail to pick up recordingUrl (not in SSE stream).
  try {
    const d = await getCall(callId);
    if (d.recordingUrl || d.recording_url) {
      yield {
        type: 'transcript_line',
        homieId: 'park',
        who: 'sys',
        text: `Recording: ${d.recordingUrl ?? d.recording_url}`,
      };
    }
  } catch {
    // best effort — don't fail the whole run if detail fetch fails
  }

  // Extract structured price + ETA from the call transcript. If anything's
  // off (low confidence, vendor didn't confirm, price out of sanity range),
  // fall back to deterministic values so the downstream chain stays clean.
  const fallbackPriceCents = vendorBaseQuote * 100 - DEFAULT_SAVINGS_CENTS;
  const fallback: Pick<DispatchOutcome, 'priceCents' | 'etaText'> = {
    priceCents: fallbackPriceCents,
    etaText: DEFAULT_ETA,
  };

  const parsed = await extractParkOutcome(turns);
  const priceUsable =
    parsed?.confidence === 'high' &&
    parsed.vendorConfirmed === true &&
    parsed.priceDollars != null &&
    parsed.priceDollars * 100 >= PRICE_MIN_CENTS &&
    parsed.priceDollars * 100 <= PRICE_MAX_CENTS;
  const etaUsable =
    parsed?.confidence === 'high' &&
    parsed.vendorConfirmed === true &&
    typeof parsed.etaText === 'string' &&
    parsed.etaText.length > 0;

  const priceCents = priceUsable ? Math.round(parsed!.priceDollars! * 100) : fallback.priceCents!;
  const etaText = etaUsable ? parsed!.etaText! : fallback.etaText!;
  const outcomeSource: DispatchOutcome['outcomeSource'] =
    priceUsable && etaUsable ? 'parsed' : priceUsable || etaUsable ? 'mixed' : 'fallback';

  ctx.outcome.priceCents = priceCents;
  ctx.outcome.etaText = etaText;
  ctx.outcome.savingsCents = vendorBaseQuote * 100 - priceCents;
  ctx.outcome.vendorConfirmed = parsed?.vendorConfirmed ?? true;
  ctx.outcome.outcomeSource = outcomeSource;
  if (!ctx.outcome.vendorName) ctx.outcome.vendorName = vendorName;

  // Surface the extraction result so the UI / log shows what we heard.
  const dollars = (priceCents / 100).toFixed(0);
  if (parsed && outcomeSource === 'parsed') {
    yield {
      type: 'transcript_line',
      homieId: 'park',
      who: 'sys',
      text: `Heard: $${dollars}, ETA ${etaText} (parsed)`,
    };
  } else if (parsed && outcomeSource === 'mixed') {
    yield {
      type: 'transcript_line',
      homieId: 'park',
      who: 'sys',
      text: `Partial parse: price=${priceUsable ? `$${dollars}` : 'fallback'}, eta=${etaUsable ? etaText : 'fallback'}`,
    };
  } else {
    const reason = !parsed
      ? 'no transcript'
      : parsed.confidence !== 'high'
        ? 'low confidence'
        : !parsed.vendorConfirmed
          ? 'vendor did not confirm'
          : 'price out of range';
    yield {
      type: 'transcript_line',
      homieId: 'park',
      who: 'sys',
      text: `Using fallback ($${dollars}, ${etaText}) — ${reason}`,
    };
  }

  yield {
    type: 'done',
    homieId: 'park',
    summary: `Call ${endedStatus} (${durationSec ?? '?'}s)`,
  };
  yield {
    type: 'handoff',
    fromHomieId: 'park',
    toHomieId: 'chen',
    reason: 'pay vendor',
  };
}

export { VENDORS };
