import { EventEmitter } from 'node:events';
import type { Dispatch, HomieEvent } from './types';

interface BusEntry {
  emitter: EventEmitter;
  buffer: HomieEvent[];
  dispatch: Dispatch;
}

const buses = new Map<string, BusEntry>();

export function createBus(dispatchId: string, issueId: string): BusEntry {
  const entry: BusEntry = {
    emitter: new EventEmitter(),
    buffer: [],
    dispatch: { id: dispatchId, issueId, startedAt: Date.now(), status: 'running' },
  };
  entry.emitter.setMaxListeners(50);
  buses.set(dispatchId, entry);
  return entry;
}

export function getBus(dispatchId: string): BusEntry | undefined {
  return buses.get(dispatchId);
}

export function emit(dispatchId: string, e: HomieEvent): void {
  const b = buses.get(dispatchId);
  if (!b) return;
  b.buffer.push(e);
  b.emitter.emit('e', e);
  // Server-side audit log — keeps a chronological record of every dispatch's
  // events in the dev server log so we can analyze a run after the fact.
  if (process.env.HOMI_LOG_EVENTS !== '0') {
    const elapsed = Date.now() - b.dispatch.startedAt;
    console.log(`[bus ${dispatchId.slice(0, 8)} +${String(elapsed).padStart(6)}ms] ${JSON.stringify(e)}`);
  }
}

export function subscribe(
  dispatchId: string,
  fn: (e: HomieEvent) => void,
): () => void {
  const b = buses.get(dispatchId);
  if (!b) return () => {};
  b.emitter.on('e', fn);
  return () => b.emitter.off('e', fn);
}

export function finish(dispatchId: string, status: 'done' | 'error'): void {
  const b = buses.get(dispatchId);
  if (!b) return;
  b.dispatch.status = status;
  b.emitter.emit('finish');
}

export function onFinish(dispatchId: string, fn: () => void): () => void {
  const b = buses.get(dispatchId);
  if (!b) return () => {};
  b.emitter.on('finish', fn);
  return () => b.emitter.off('finish', fn);
}

export function getBuffer(dispatchId: string): HomieEvent[] {
  return buses.get(dispatchId)?.buffer ?? [];
}

export function getDispatch(dispatchId: string): Dispatch | undefined {
  return buses.get(dispatchId)?.dispatch;
}
