import { streamText, tool, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import type { DispatchContext, HomieEvent } from '../types';
import {
  supermemoryWrite,
  supermemorySearch,
} from '../tools/supermemory';

const HOMIE_TIMEOUT_MS = 30_000;

const BROOKS_READ_SYSTEM = `You are Brooks, the long-term memory keeper for Homi — a property management agent crew. Your job RIGHT NOW is to search the deal archive for relevant precedents and brief the negotiator (Park).

You MUST:
1. Call supermemorySearch with a query about the current issue's trade and any prior dealings with relevant vendors.
2. Read the results. If there are useful precedents (prices paid, response times, savings achieved), summarize them in ONE short sentence — Park is about to make a phone call and needs the gist, not a wall of text.
3. If memory is empty, say so in one line.

Be terse. Be useful. The negotiator's call is waiting on you.`;

const BROOKS_WRITE_SYSTEM = `You are Brooks, the long-term memory keeper for Homi. The dispatch is complete. Your job RIGHT NOW is to persist the outcome to memory so future agents can recall it.

You MUST call supermemoryWrite exactly once. The user prompt gives you the EXACT key to use — pass it verbatim, do not modify it, do not invent a new one based on prior memories you've seen.

For the value: a one-line summary including vendor name, final price, how fast they responded, and savings vs prior market. Concise. Do not call any other tool.`;

export async function* runBrooksRead(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  yield {
    type: 'started',
    homieId: 'brooks',
    task: 'Reading prior deals from memory',
    issueId: ctx.issueId,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(
    () => ctrl.abort('homie-timeout'),
    HOMIE_TIMEOUT_MS,
  );
  const sideEvents: HomieEvent[] = [];

  const tools = {
    supermemorySearch: tool({
      description: supermemorySearch.description,
      inputSchema: supermemorySearch.inputSchema,
      execute: async (args, opts) => {
        const r = (await supermemorySearch.execute!(args, opts)) as {
          total: number;
          results: { memory: string; key?: string; similarity: number }[];
        };
        sideEvents.push({
          type: 'memory_read',
          homieId: 'brooks',
          query: args.query,
          result: JSON.stringify(r.results.slice(0, 3)).slice(0, 200),
        });
        return r;
      },
    }),
  };

  const result = streamText({
    model: google('gemini-2.5-pro'),
    tools,
    stopWhen: stepCountIs(3),
    abortSignal: ctrl.signal,
    system: BROOKS_READ_SYSTEM,
    prompt:
      `Issue ${ctx.issueId} (${ctx.issueLabel}) at ${ctx.propertyAddress}. ` +
      `Trade needed: ${ctx.vendorTrade}. ` +
      `Search memory for any prior deals in this trade and brief Park before the negotiation call.`,
  });

  try {
    for await (const part of result.fullStream) {
      while (sideEvents.length) yield sideEvents.shift()!;
      switch (part.type) {
        case 'text-delta':
          if (part.text)
            yield {
              type: 'transcript_line',
              homieId: 'brooks',
              who: 'sys',
              text: part.text,
            };
          break;
        case 'tool-error':
          yield {
            type: 'error',
            homieId: 'brooks',
            message: String((part as { error?: unknown }).error ?? 'tool error'),
            recoverable: true,
          };
          break;
        case 'abort':
          yield {
            type: 'error',
            homieId: 'brooks',
            message: 'aborted (timeout)',
            recoverable: true,
          };
          return;
        case 'error':
          yield {
            type: 'error',
            homieId: 'brooks',
            message: String((part as { error?: unknown }).error ?? 'stream error'),
            recoverable: true,
          };
          return;
      }
    }
    while (sideEvents.length) yield sideEvents.shift()!;
    yield {
      type: 'done',
      homieId: 'brooks',
      summary: 'Context shared with park',
    };
    yield {
      type: 'handoff',
      fromHomieId: 'brooks',
      toHomieId: 'park',
      reason: 'enriched with prior deals',
    };
  } finally {
    clearTimeout(timeout);
    if (!ctrl.signal.aborted) ctrl.abort('generator-cleanup');
  }
}

export async function* runBrooksWrite(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  yield {
    type: 'started',
    homieId: 'brooks',
    task: 'Persisting deal outcome',
    issueId: ctx.issueId,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(
    () => ctrl.abort('homie-timeout'),
    HOMIE_TIMEOUT_MS,
  );
  const sideEvents: HomieEvent[] = [];

  const tools = {
    supermemoryWrite: tool({
      description: supermemoryWrite.description,
      inputSchema: supermemoryWrite.inputSchema,
      execute: async (args, opts) => {
        const r = await supermemoryWrite.execute!(args, opts);
        sideEvents.push({
          type: 'memory_write',
          homieId: 'brooks',
          key: args.key,
          value: args.value,
        });
        return r;
      },
    }),
  };

  const vendorName = ctx.outcome.vendorName ?? 'Unknown Vendor';
  const priceDollars = ((ctx.outcome.priceCents ?? 0) / 100).toFixed(0);
  const savingsDollars = ((ctx.outcome.savingsCents ?? 0) / 100).toFixed(0);
  const eta = ctx.outcome.etaText ?? 'same-day';

  // Build the archive key in code so the LLM can't pollute it with addresses
  // from prior memory_read results. Pass it as a literal Brooks must copy.
  const dateIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dealKey = `deal.${ctx.propertyId}.${ctx.vendorTrade}.${dateIso}`;

  const result = streamText({
    model: google('gemini-2.5-pro'),
    tools,
    stopWhen: stepCountIs(2),
    abortSignal: ctrl.signal,
    system: BROOKS_WRITE_SYSTEM,
    prompt:
      `Use this EXACT key (copy verbatim, do not change): ${dealKey}\n\n` +
      `Compose the value summary from these facts:\n` +
      `- Issue: ${ctx.issueId} (${ctx.issueLabel}) at ${ctx.propertyAddress}\n` +
      `- Trade: ${ctx.vendorTrade}\n` +
      `- Vendor: ${vendorName}\n` +
      `- Price: $${priceDollars}\n` +
      `- ETA: ${eta}\n` +
      `- Savings vs market: $${savingsDollars}\n\n` +
      `Call supermemoryWrite with key="${dealKey}" and a one-line value.`,
  });

  try {
    for await (const part of result.fullStream) {
      while (sideEvents.length) yield sideEvents.shift()!;
      switch (part.type) {
        case 'text-delta':
          if (part.text)
            yield {
              type: 'transcript_line',
              homieId: 'brooks',
              who: 'sys',
              text: part.text,
            };
          break;
        case 'tool-error':
          yield {
            type: 'error',
            homieId: 'brooks',
            message: String((part as { error?: unknown }).error ?? 'tool error'),
            recoverable: true,
          };
          break;
        case 'abort':
          yield {
            type: 'error',
            homieId: 'brooks',
            message: 'aborted (timeout)',
            recoverable: true,
          };
          return;
        case 'error':
          yield {
            type: 'error',
            homieId: 'brooks',
            message: String((part as { error?: unknown }).error ?? 'stream error'),
            recoverable: true,
          };
          return;
      }
    }
    while (sideEvents.length) yield sideEvents.shift()!;
    yield {
      type: 'done',
      homieId: 'brooks',
      summary: 'Deal archived to memory',
    };
  } finally {
    clearTimeout(timeout);
    if (!ctrl.signal.aborted) ctrl.abort('generator-cleanup');
  }
}
