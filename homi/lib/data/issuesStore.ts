import { INITIAL_ISSUES, type Issue } from './issues';

type Listener = (issue: Issue) => void;

const issues: Issue[] = [...INITIAL_ISSUES];
const listeners = new Set<Listener>();

export function getIssues(): Issue[] {
  return issues;
}

export function getIssue(id: string): Issue | undefined {
  return issues.find((i) => i.id === id);
}

export function addIssue(issue: Issue): Issue {
  issues.push(issue);
  for (const listener of listeners) {
    try {
      listener(issue);
    } catch {
      // listener errors should not break the store
    }
  }
  return issue;
}

export function subscribeIssues(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function nextIssueId(): string {
  return `i${issues.length + 1}-${Date.now().toString(36)}`;
}
