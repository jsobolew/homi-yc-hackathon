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
