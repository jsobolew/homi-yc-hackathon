import { getIssues } from '@/lib/data/issuesStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const POLL_MS = 1500;

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          closed = true;
        }
      };

      let knownIds: Set<string>;
      try {
        const initial = await getIssues();
        knownIds = new Set(initial.map((i) => i.id));
        safeEnqueue(
          encoder.encode(`event: snapshot\ndata: ${JSON.stringify({ issues: initial })}\n\n`),
        );
      } catch (e) {
        safeEnqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: String(e) })}\n\n`,
          ),
        );
        knownIds = new Set();
      }

      const poll = async () => {
        if (closed) return;
        try {
          const all = await getIssues();
          for (const issue of all) {
            if (knownIds.has(issue.id)) continue;
            knownIds.add(issue.id);
            safeEnqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'new_issue', issue })}\n\n`),
            );
          }
        } catch {
          // keep polling on transient errors
        }
      };

      const pollInterval = setInterval(poll, POLL_MS);
      const keepalive = setInterval(() => {
        safeEnqueue(encoder.encode(`: keepalive\n\n`));
      }, 25_000);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(pollInterval);
        clearInterval(keepalive);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
