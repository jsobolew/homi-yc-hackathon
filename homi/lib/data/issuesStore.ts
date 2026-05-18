import { Redis } from '@upstash/redis';
import { INITIAL_ISSUES, type Issue } from './issues';

// KV holds *only* issues added via intake. INITIAL_ISSUES is the static
// baseline. Reading merges them. This way clearing intake state ("reset
// demo") doesn't wipe the seeded scenario.
const KEY = 'homi:intake:issues';

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// Local-dev fallback: process-local memory. On Vercel, redis is always set
// because the project is wired to Upstash KV via env vars.
const memory: Issue[] = [];

type Listener = (issue: Issue) => void;
const listeners = new Set<Listener>();

async function readIntakeIssues(): Promise<Issue[]> {
  if (!redis) return memory.slice();
  const raw = await redis.get<Issue[]>(KEY);
  return Array.isArray(raw) ? raw : [];
}

async function writeIntakeIssues(issues: Issue[]): Promise<void> {
  if (!redis) {
    memory.length = 0;
    memory.push(...issues);
    return;
  }
  await redis.set(KEY, issues);
}

export async function getIssues(): Promise<Issue[]> {
  const intake = await readIntakeIssues();
  return [...INITIAL_ISSUES, ...intake];
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  if (id.startsWith('i') && !id.includes('-')) {
    // Initial-seed ids are stable; skip the KV roundtrip.
    const seeded = INITIAL_ISSUES.find((i) => i.id === id);
    if (seeded) return seeded;
  }
  const all = await getIssues();
  return all.find((i) => i.id === id);
}

export async function addIssue(issue: Issue): Promise<Issue> {
  const current = await readIntakeIssues();
  current.push(issue);
  await writeIntakeIssues(current);
  for (const listener of listeners) {
    try {
      listener(issue);
    } catch {
      // listener errors should not break the store
    }
  }
  return issue;
}

export async function resetIntakeIssues(): Promise<void> {
  await writeIntakeIssues([]);
}

// Local in-process subscribe: useful only when intake POST + SSE GET happen
// to land on the same instance. Cross-instance notification is handled by
// the SSE route polling KV.
export function subscribeIssues(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function nextIssueId(): string {
  return `i-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
