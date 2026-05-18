// Post-call structured extraction from Park's phone transcript.
// Runs after the SSE stream's `ended` event using the full set of turns.
//
// Returns null if the extractor itself throws (network, model error etc.) —
// caller falls back to deterministic outcome.

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface ParkTurn {
  role: 'agent' | 'user';
  content: string;
}

const ParkOutcomeSchema = z.object({
  priceDollars: z
    .number()
    .nullable()
    .describe(
      'Quoted price in US dollars (no cents). Use the vendor-stated price only. Null if the vendor hedged, refused to quote, or gave no number.',
    ),
  etaText: z
    .string()
    .nullable()
    .describe(
      'When the vendor said they can come, in short natural language (e.g. "today at 3pm", "tomorrow morning", "in 2 hours", "ASAP"). Null if no time was given.',
    ),
  vendorConfirmed: z
    .boolean()
    .describe('True if the vendor agreed to take the job. False if they declined, were too busy, or never confirmed.'),
  confidence: z
    .enum(['high', 'low'])
    .describe(
      "high only if BOTH price AND ETA were clearly stated and unambiguous, AND the vendor agreed. 'low' for any guess.",
    ),
});

export type ParkParsedOutcome = z.infer<typeof ParkOutcomeSchema>;

const SYSTEM = `You are extracting structured facts from a short phone call between an AI dispatcher (Park) and a maintenance vendor.

Use only what the vendor said (role = "user"). The dispatcher's questions provide context but their statements are not facts about price/time.

Be conservative:
- If the vendor said "a couple hundred" → priceDollars = null (not a clear number).
- If the vendor said "this afternoon" → etaText = "this afternoon" (vague is OK as a string, but don't invent a clock time).
- If the vendor only acknowledged ("uh huh", "yeah okay") without committing to a price/time → vendorConfirmed = false.
- confidence = 'high' ONLY if priceDollars is a clean number AND etaText is non-null AND vendorConfirmed is true.`;

export async function extractParkOutcome(
  turns: ParkTurn[],
): Promise<ParkParsedOutcome | null> {
  if (turns.length === 0) return null;

  const transcript = turns
    .map((t) => `${t.role === 'agent' ? 'Park (AI)' : 'Vendor'}: ${t.content}`)
    .join('\n');

  try {
    const r = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: ParkOutcomeSchema,
      system: SYSTEM,
      prompt: `Call transcript:\n\n${transcript}\n\nExtract the structured outcome.`,
    });
    return r.object;
  } catch (e) {
    console.warn('[parkExtractor] extraction failed:', e instanceof Error ? e.message : e);
    return null;
  }
}
