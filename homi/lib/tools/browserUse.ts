import { BrowserUse } from 'browser-use-sdk/v3';
import { z } from 'zod';

let _client: BrowserUse | null = null;
function client() {
  if (!_client) {
    if (!process.env.BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY not set');
    }
    _client = new BrowserUse({ apiKey: process.env.BROWSER_USE_API_KEY });
  }
  return _client;
}

export interface StartedSession {
  sessionId: string;
  liveUrl: string;
  done: Promise<{ output: string }>;
}

/**
 * Ramirez — kick off a long-running browse with a public live URL.
 * Caller is responsible for awaiting `done` and stopping the session.
 */
export async function startBrowseSession(goal: string): Promise<StartedSession> {
  const c = client();
  const session = await c.sessions.create({ keepAlive: true });
  const live = (session as { liveUrl?: string }).liveUrl;
  if (!session.id || !live) {
    throw new Error('No session id / liveUrl returned');
  }
  const runResult = c.run(goal, { sessionId: session.id });
  const done = (async () => {
    const r = await runResult;
    return { output: String(r.output ?? '') };
  })();
  return { sessionId: session.id, liveUrl: live, done };
}

export async function stopSession(sessionId: string): Promise<void> {
  try {
    await client().sessions.stop(sessionId);
  } catch {
    // best effort
  }
}

const BookingConfirmation = z.object({
  confirmationNumber: z
    .string()
    .describe('The confirmation / reference number displayed on the success page'),
  vendorName: z.string().describe('Vendor business name'),
});

export interface BookingResult {
  confirmationNumber: string;
  vendorName: string;
  liveUrl: string;
  sessionId: string;
}

/**
 * Sato — autonomous form fill at a vendor portal. Returns structured confirmation.
 */
export async function bookVendor(
  formUrl: string,
  payload: Record<string, string>,
): Promise<BookingResult> {
  const c = client();
  const session = await c.sessions.create({ keepAlive: true });
  const live = (session as { liveUrl?: string }).liveUrl;
  if (!session.id || !live) {
    throw new Error('No session id / liveUrl returned');
  }
  try {
    const r = await c.run(
      `Go to ${formUrl}. Fill the form with these values: ${JSON.stringify(
        payload,
      )}. Submit the form and read the confirmation number from the success page.`,
      { sessionId: session.id, schema: BookingConfirmation },
    );
    return {
      ...r.output,
      liveUrl: live,
      sessionId: session.id,
    };
  } finally {
    await stopSession(session.id);
  }
}
