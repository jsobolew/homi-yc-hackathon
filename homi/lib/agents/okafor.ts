import { streamText, tool, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import type { DispatchContext, HomieEvent } from '../types';
import { agentMailSend } from '../tools/agentmail';

const HOMIE_TIMEOUT_MS = 30_000;

const OKAFOR_SYSTEM = `You are Okafor, the tenant communications lead for Homi. The crew just booked a vendor to fix the tenant's issue. Your job is to send the tenant a short, friendly email confirming the appointment.

You MUST:
1. Call agentMailSend exactly once.
2. Subject line: short, action-oriented, no marketing fluff. Example: "Maintenance scheduled — today 3:40pm"
3. Body: 2-3 short sentences. Include the trade, the vendor's name (Ricky's Heating & Air), the ETA window (today 3:40pm), and a friendly close. Don't reveal pricing or internal details.

Be warm but brief. Tenants want certainty, not paragraphs.`;

export async function* runOkafor(
  ctx: DispatchContext,
): AsyncGenerator<HomieEvent> {
  const tenantEmail = process.env.DEMO_TENANT_EMAIL;
  if (!tenantEmail) {
    yield {
      type: 'error',
      homieId: 'okafor',
      message: 'DEMO_TENANT_EMAIL not set',
      recoverable: false,
    };
    return;
  }

  yield {
    type: 'started',
    homieId: 'okafor',
    task: 'Notifying tenant',
    issueId: ctx.issueId,
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(
    () => ctrl.abort('homie-timeout'),
    HOMIE_TIMEOUT_MS,
  );
  const sideEvents: HomieEvent[] = [];

  const tools = {
    agentMailSend: tool({
      description: agentMailSend.description,
      inputSchema: agentMailSend.inputSchema,
      execute: async (args, opts) => {
        const r = (await agentMailSend.execute!(args, opts)) as {
          ok: boolean;
          messageId: string;
          threadId: string;
          inboxUrl: string;
        };
        sideEvents.push({
          type: 'email_sent',
          homieId: 'okafor',
          to: args.to,
          subject: args.subject,
          inboxUrl: r.inboxUrl,
        });
        return r;
      },
    }),
  };

  const result = streamText({
    model: google('gemini-2.5-pro'),
    tools,
    stopWhen: stepCountIs(2),
    abortSignal: ctrl.signal,
    system: OKAFOR_SYSTEM,
    prompt: `Issue ${ctx.issueId} at property ${ctx.propertyId}. Trade booked: ${ctx.vendorTrade}. Vendor: Ricky's Heating & Air. ETA: today 3:40pm. Tenant email: ${tenantEmail}. Send the confirmation now.`,
  });

  try {
    for await (const part of result.fullStream) {
      while (sideEvents.length) yield sideEvents.shift()!;
      switch (part.type) {
        case 'text-delta':
          if (part.text)
            yield {
              type: 'transcript_line',
              homieId: 'okafor',
              who: 'you',
              text: part.text,
            };
          break;
        case 'tool-error':
          yield {
            type: 'error',
            homieId: 'okafor',
            message: String((part as { error?: unknown }).error ?? 'tool error'),
            recoverable: true,
          };
          break;
        case 'abort':
          yield {
            type: 'error',
            homieId: 'okafor',
            message: 'aborted (timeout)',
            recoverable: true,
          };
          return;
        case 'error':
          yield {
            type: 'error',
            homieId: 'okafor',
            message: String((part as { error?: unknown }).error ?? 'stream error'),
            recoverable: true,
          };
          return;
      }
    }
    while (sideEvents.length) yield sideEvents.shift()!;
    yield {
      type: 'done',
      homieId: 'okafor',
      summary: 'Tenant notified by email',
    };
  } finally {
    clearTimeout(timeout);
    if (!ctrl.signal.aborted) ctrl.abort('generator-cleanup');
  }
}
