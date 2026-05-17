import { createBus } from '@/lib/bus';
import { run } from '@/lib/orchestrator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { issueId?: string };
  const issueId = body.issueId;
  if (!issueId) {
    return Response.json({ error: 'issueId is required' }, { status: 400 });
  }

  const dispatchId = crypto.randomUUID();
  createBus(dispatchId, issueId);

  // Fire and forget — the SSE stream will pick up events.
  void run(dispatchId, issueId);

  return Response.json({ dispatchId });
}
