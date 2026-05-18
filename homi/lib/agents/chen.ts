import { streamText, tool, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import type { DispatchContext, HomieEvent } from '../types';
import { stripeChargeVendor } from '../tools/stripe';

const HOMIE_TIMEOUT_MS = 30_000;

const CHEN_SYSTEM = `You are Chen, the payments lead for Homi. Park just negotiated a deal with the vendor. Your job is to pay them now via Stripe.

You MUST:
1. Call stripeChargeVendor exactly once with the EXACT values from the user prompt — do not invent vendor names or amounts.
2. After the charge, say "Paid." and nothing else.

Do not call any other tool. Do not narrate. Just charge and confirm.`;

export async function* runChen(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  yield {
    type: 'started',
    homieId: 'chen',
    task: 'Paying vendor',
    issueId: ctx.issueId,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(
    () => ctrl.abort('homie-timeout'),
    HOMIE_TIMEOUT_MS,
  );
  const sideEvents: HomieEvent[] = [];

  const tools = {
    stripeChargeVendor: tool({
      description: stripeChargeVendor.description,
      inputSchema: stripeChargeVendor.inputSchema,
      execute: async (args, opts) => {
        const r = (await stripeChargeVendor.execute!(args, opts)) as {
          ok: boolean;
          chargeId: string;
          amountCents: number;
          vendor: string;
          dashboardUrl: string;
        };
        sideEvents.push({
          type: 'payment',
          homieId: 'chen',
          amountCents: r.amountCents,
          vendor: r.vendor,
          chargeId: r.chargeId,
          dashboardUrl: r.dashboardUrl,
        });
        return r;
      },
    }),
  };

  const vendorName = ctx.outcome.vendorName ?? 'Unknown Vendor';
  const priceCents = ctx.outcome.priceCents ?? 64_000;
  const dollars = (priceCents / 100).toFixed(2);

  const result = streamText({
    model: google('gemini-2.5-pro'),
    tools,
    stopWhen: stepCountIs(2),
    abortSignal: ctrl.signal,
    system: CHEN_SYSTEM,
    prompt:
      `Pay ${vendorName} $${dollars} now. ` +
      `Call stripeChargeVendor with: ` +
      `amountCents=${priceCents}, vendorName="${vendorName}", ` +
      `memo="${ctx.vendorTrade} job at ${ctx.propertyAddress} (issue ${ctx.issueId})".`,
  });

  try {
    for await (const part of result.fullStream) {
      while (sideEvents.length) yield sideEvents.shift()!;
      switch (part.type) {
        case 'text-delta':
          if (part.text)
            yield {
              type: 'transcript_line',
              homieId: 'chen',
              who: 'sys',
              text: part.text,
            };
          break;
        case 'tool-error':
          yield {
            type: 'error',
            homieId: 'chen',
            message: String((part as { error?: unknown }).error ?? 'tool error'),
            recoverable: true,
          };
          break;
        case 'abort':
          yield {
            type: 'error',
            homieId: 'chen',
            message: 'aborted (timeout)',
            recoverable: true,
          };
          return;
        case 'error':
          yield {
            type: 'error',
            homieId: 'chen',
            message: String((part as { error?: unknown }).error ?? 'stream error'),
            recoverable: true,
          };
          return;
      }
    }
    while (sideEvents.length) yield sideEvents.shift()!;
    yield {
      type: 'done',
      homieId: 'chen',
      summary: 'Vendor paid via Stripe',
    };
    yield {
      type: 'handoff',
      fromHomieId: 'chen',
      toHomieId: 'sato',
      reason: 'schedule vendor',
    };
  } finally {
    clearTimeout(timeout);
    if (!ctrl.signal.aborted) ctrl.abort('generator-cleanup');
  }
}
