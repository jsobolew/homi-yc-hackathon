import { getBuffer, getDispatch, onFinish, subscribe } from '@/lib/bus';
import type { HomieEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ dispatchId: string }> }) {
  const { dispatchId } = await ctx.params;

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

      // Replay buffered events first so late subscribers catch up.
      for (const e of getBuffer(dispatchId)) send(e);

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

      // If the dispatch already completed before subscribing, close immediately.
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

      // Handle client disconnect.
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
