import { emit, finish } from './bus';
import type { DispatchContext, HomieEvent, HomieId } from './types';
import { mockAdapters, mockBrooksReadAdapter, mockBrooksWriteAdapter } from './adapters/mock';
import { runBrooksRead, runBrooksWrite } from './agents/brooks';
import { runChen } from './agents/chen';
import { runOkafor } from './agents/okafor';
import { runPark } from './agents/park';
import { runRamirez } from './agents/ramirez';
import { runSato } from './agents/sato';
import { INITIAL_ISSUES } from './data/issues';
import { ISSUE_TYPES } from './data/issueTypes';

type Adapter = (ctx: DispatchContext) => AsyncGenerator<HomieEvent, void, void>;

const isLive = (id: HomieId) =>
  process.env[`HOMIE_${id.toUpperCase()}_LIVE`] === '1';

function pickAdapter(id: HomieId, phase: 'read' | 'write' | 'run' = 'run'): Adapter {
  if (id === 'brooks') {
    if (isLive('brooks')) {
      return phase === 'write' ? runBrooksWrite : runBrooksRead;
    }
    return phase === 'write' ? mockBrooksWriteAdapter : mockBrooksReadAdapter;
  }
  if (id === 'okafor' && isLive('okafor')) {
    return runOkafor;
  }
  if (id === 'chen' && isLive('chen')) {
    return runChen;
  }
  if (id === 'park' && isLive('park')) {
    return runPark;
  }
  if (id === 'ramirez' && isLive('ramirez')) {
    return runRamirez;
  }
  if (id === 'sato' && isLive('sato')) {
    return runSato;
  }
  return mockAdapters[id];
}

async function runHomie(
  dispatchId: string,
  id: HomieId,
  ctx: DispatchContext,
  phase: 'read' | 'write' | 'run' = 'run',
): Promise<void> {
  const adapter = pickAdapter(id, phase);
  try {
    for await (const event of adapter(ctx)) {
      emit(dispatchId, event);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    emit(dispatchId, { type: 'error', homieId: id, message, recoverable: true });
  }
}

function buildContext(dispatchId: string, issueId: string): DispatchContext | null {
  const issue = INITIAL_ISSUES.find((i) => i.id === issueId);
  if (!issue) return null;
  const issueType = ISSUE_TYPES[issue.type];
  return {
    dispatchId,
    issueId,
    propertyId: issue.propertyId,
    vendorTrade: issueType.vendorTrade,
  };
}

export async function run(dispatchId: string, issueId: string): Promise<void> {
  const ctx = buildContext(dispatchId, issueId);
  if (!ctx) {
    emit(dispatchId, {
      type: 'error',
      homieId: 'brooks',
      message: `Unknown issue ${issueId}`,
      recoverable: false,
    });
    finish(dispatchId, 'error');
    return;
  }

  try {
    // brooks reads prior context first so park has it
    await runHomie(dispatchId, 'brooks', ctx, 'read');
    await runHomie(dispatchId, 'ramirez', ctx);
    await runHomie(dispatchId, 'park', ctx);
    await runHomie(dispatchId, 'chen', ctx);
    await runHomie(dispatchId, 'sato', ctx);
    await runHomie(dispatchId, 'okafor', ctx);
    // brooks writes the deal outcome at the end
    await runHomie(dispatchId, 'brooks', ctx, 'write');

    emit(dispatchId, { type: 'issue_resolved', issueId });
    finish(dispatchId, 'done');
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    emit(dispatchId, { type: 'error', homieId: 'brooks', message, recoverable: false });
    finish(dispatchId, 'error');
  }
}
