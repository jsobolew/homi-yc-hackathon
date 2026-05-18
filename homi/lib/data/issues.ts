import type { IssueTypeKey } from './issueTypes';

export type IssueStatus = 'open' | 'dispatched' | 'resolved';

export interface IssueIntake {
  source: 'agentmail';
  from?: string;
  subject?: string;
  text?: string;
  threadId?: string;
  messageId?: string;
  receivedAt: number;
}

export interface Issue {
  id: string;
  propertyId: string;
  floor: number;
  room: string;
  type: IssueTypeKey;
  status: IssueStatus;
  ageMin: number;
  assignedHomie?: string;
  intake?: IssueIntake;
}

export const INITIAL_ISSUES: Issue[] = [
  { id: 'i1', propertyId: 'p1', floor: 2, room: 'A', type: 'plumbing',   status: 'open', ageMin: 12 },
  { id: 'i2', propertyId: 'p1', floor: 3, room: 'B', type: 'electrical', status: 'open', ageMin: 31 },
  { id: 'i3', propertyId: 'p3', floor: 2, room: 'B', type: 'cleaning',   status: 'open', ageMin: 142 },
  { id: 'i4', propertyId: 'p8', floor: 1, room: 'C', type: 'appliance',  status: 'open', ageMin: 60 },
];

export function getIssue(issues: Issue[], id: string): Issue | undefined {
  return issues.find((i) => i.id === id);
}
