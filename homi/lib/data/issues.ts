import type { IssueTypeKey } from './issueTypes';

export type IssueStatus = 'open' | 'dispatched' | 'resolved';

export interface Issue {
  id: string;
  propertyId: string;
  floor: number;
  room: string;
  type: IssueTypeKey;
  status: IssueStatus;
  ageMin: number;
  assignedHomie?: string;
}

export const INITIAL_ISSUES: Issue[] = [
  { id: 'i1', propertyId: 'p1', floor: 2, room: 'A', type: 'plumbing',   status: 'open',       ageMin: 12 },
  { id: 'i2', propertyId: 'p1', floor: 3, room: 'B', type: 'electrical', status: 'open',       ageMin: 31 },
  { id: 'i3', propertyId: 'p4', floor: 1, room: 'C', type: 'hvac',       status: 'dispatched', ageMin: 4, assignedHomie: 'park' },
  { id: 'i4', propertyId: 'p7', floor: 4, room: 'A', type: 'pest',       status: 'open',       ageMin: 88 },
  { id: 'i5', propertyId: 'p2', floor: 2, room: 'D', type: 'security',   status: 'open',       ageMin: 6 },
  { id: 'i6', propertyId: 'p3', floor: 2, room: 'B', type: 'cleaning',   status: 'open',       ageMin: 142 },
  { id: 'i7', propertyId: 'p6', floor: 3, room: 'A', type: 'tenant',     status: 'open',       ageMin: 22 },
  { id: 'i8', propertyId: 'p8', floor: 1, room: 'C', type: 'appliance',  status: 'open',       ageMin: 60 },
];

export function getIssue(issues: Issue[], id: string): Issue | undefined {
  return issues.find((i) => i.id === id);
}
