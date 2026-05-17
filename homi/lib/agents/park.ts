import type { DispatchContext, HomieEvent } from '../types';
import { placeOutboundCall, waitForCall } from '../tools/agentphone';
import { VENDORS, pickVendorForTrade } from '../data/vendors';

// Park is voice-only — no Gemini in the loop. AgentPhone's own conversation
// engine drives the call (negotiator system prompt already lives on the agent).
// We just place the call, stream the result transcript back as HomieEvents.
//
// To call a real number, set PARK_TARGET_NUMBER in .env.local (E.164). If unset,
// Park falls back to the mock vendor's seeded number; if THAT's a fake +1-555,
// we emit a polite error and bail. Real demo calls need a real target.

export async function* runPark(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);
  const target = process.env.PARK_TARGET_NUMBER ?? vendor.phone;

  yield {
    type: 'started',
    homieId: 'park',
    task: `Calling ${vendor.name}`,
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
      variables: {
        vendor: vendor.name,
        trade: ctx.vendorTrade,
        property: ctx.propertyId,
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
    text: `Call placed (${callId.slice(0, 10)}…), waiting for completion…`,
  };

  let result;
  try {
    result = await waitForCall(callId, { pollMs: 3000, timeoutMs: 5 * 60_000 });
  } catch (e) {
    yield {
      type: 'error',
      homieId: 'park',
      message: `Wait failed: ${e instanceof Error ? e.message : String(e)}`,
      recoverable: false,
    };
    return;
  }

  for (const turn of result.transcript) {
    yield {
      type: 'transcript_line',
      homieId: 'park',
      who: turn.speaker === 'caller' ? 'them' : 'you',
      text: turn.text,
    };
  }

  yield {
    type: 'done',
    homieId: 'park',
    summary: `Call ${result.status} (${result.durationSec ?? '?'}s)`,
  };
  yield {
    type: 'handoff',
    fromHomieId: 'park',
    toHomieId: 'chen',
    reason: 'pay vendor',
  };
}

// Re-export VENDORS list so callers can find a real target.
export { VENDORS };
