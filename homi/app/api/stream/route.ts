import { createBus, getDispatch, onFinish, subscribe } from '@/lib/bus';
import { run } from '@/lib/orchestrator';
import type { HomieEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issueId = url.searchParams.get('issueId');
  if (!issueId) {
    return Response.json({ error: 'issueId is required' }, { status: 400 });
  }

  const dispatchId = crypto.randomUUID();
  createBus(dispatchId, issueId);

  const encoder = new TextEncoder();
  let closed = false;
  let unsubEvents: () => void = () => {};
  let unsubFinish: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          closed = true;
          unsubEvents();
          unsubFinish();
        }
      };

      const send = (e: HomieEvent) => {
        safeEnqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      };

      // Tell the client which dispatch this is, in case it wants to display it.
      safeEnqueue(encoder.encode(`event: dispatch\ndata: ${JSON.stringify({ dispatchId })}\n\n`));

      unsubEvents = subscribe(dispatchId, send);
      unsubFinish = onFinish(dispatchId, () => {
        safeEnqueue(encoder.encode(`event: finish\ndata: {}\n\n`));
        closed = true;
        unsubEvents();
        unsubFinish();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });

      // Start the orchestrator inside the same invocation. Fluid Compute keeps
      // the function alive while the response stream is open.
      void run(dispatchId, issueId).catch(() => {
        // orchestrator already emits its own error events; nothing to do here.
      });

      // If the dispatch somehow completed before subscribing, close immediately.
      const d = getDispatch(dispatchId);
      if (d && d.status !== 'running') {
        safeEnqueue(encoder.encode(`event: finish\ndata: {}\n\n`));
        closed = true;
        unsubEvents();
        unsubFinish();
        try {
          controller.close();
        } catch {
          // already closed
        }
      }

      req.signal.addEventListener('abort', () => {
        closed = true;
        unsubEvents();
        unsubFinish();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      closed = true;
      unsubEvents();
      unsubFinish();
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
