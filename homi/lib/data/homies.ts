import type { HomieId } from '../types';

export type HomieMode = 'idle' | 'calling' | 'browsing' | 'phone' | 'laptop' | 'done';

export interface Homie {
  id: HomieId;
  name: string;
  role: string;
  spriteIdx: number;
  desk: number;
  mode: HomieMode;
  task: string;
  issueId?: string;
}

export const INITIAL_HOMIES: Homie[] = [
  { id: 'ramirez', name: 'Homie Ramirez', role: 'Vendor Sourcer',     spriteIdx: 0, desk: 0, mode: 'browsing', task: 'Sourcing plumbers in Castro',     issueId: 'i1' },
  { id: 'park',    name: 'Homie Park',    role: 'Negotiator',         spriteIdx: 1, desk: 1, mode: 'phone',    task: 'Negotiating HVAC quote, Nob Hill', issueId: 'i3' },
  { id: 'okafor',  name: 'Homie Okafor',  role: 'Tenant Comms',       spriteIdx: 2, desk: 2, mode: 'phone',    task: 'Calling tenant at 230 Marina',     issueId: 'i7' },
  { id: 'sato',    name: 'Homie Sato',    role: 'Scheduler',          spriteIdx: 3, desk: 3, mode: 'laptop',   task: 'Booking pest visit window',        issueId: 'i4' },
  { id: 'chen',    name: 'Homie Chen',    role: 'Payments',           spriteIdx: 4, desk: 4, mode: 'laptop',   task: 'Settling locksmith invoice',       issueId: 'i5' },
  { id: 'brooks',  name: 'Homie Brooks',  role: 'Memory & Coordinator', spriteIdx: 5, desk: 5, mode: 'browsing', task: 'Indexing vendor history',         issueId: 'i6' },
];

export function getHomie(homies: Homie[], id: HomieId): Homie | undefined {
  return homies.find((h) => h.id === id);
}
