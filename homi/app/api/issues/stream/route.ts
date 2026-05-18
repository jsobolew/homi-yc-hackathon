import { getIssues, subscribeIssues } from '@/lib/data/issuesStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  let unsubscribe: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          closed = true;
          unsubscribe();
        }
      };

      // Initial snapshot so the client can hydrate (covers any issues that
      // arrived before this client connected — including before this page
      // load).
      safeEnqueue(
        encoder.encode(`event: snapshot\ndata: ${JSON.stringify({ issues: getIssues() })}\n\n`),
      );

      unsubscribe = subscribeIssues((issue) => {
        safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: 'new_issue', issue })}\n\n`));
      });

      // Keepalive comment every 25s so proxies don't kill the connection.
      const keepalive = setInterval(() => {
        safeEnqueue(encoder.encode(`: keepalive\n\n`));
      }, 25_000);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(keepalive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      closed = true;
      unsubscribe();
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
