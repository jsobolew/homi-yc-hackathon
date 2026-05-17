import type { VendorTrade } from './vendors';

export type IssueTypeKey =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'pest'
  | 'security'
  | 'cleaning'
  | 'tenant'
  | 'appliance';

export interface IssueType {
  label: string;
  glyph: string;
  color: string;
  vendorTrade: VendorTrade;
}

export const ISSUE_TYPES: Record<IssueTypeKey, IssueType> = {
  plumbing:   { label: 'Broken pipe',       glyph: 'drop',   color: '#4a6fa5', vendorTrade: 'plumbing' },
  electrical: { label: 'Lights flickering', glyph: 'bolt',   color: '#ffd966', vendorTrade: 'electrical' },
  hvac:       { label: 'Heating out',       glyph: 'thermo', color: '#ff5555', vendorTrade: 'hvac' },
  pest:       { label: 'Pest sighting',     glyph: 'bug',    color: '#6cc24a', vendorTrade: 'pest' },
  security:   { label: 'Lock jammed',       glyph: 'lock',   color: '#c14a4a', vendorTrade: 'security' },
  cleaning:   { label: 'Cleaning request',  glyph: 'broom',  color: '#8b5cb8', vendorTrade: 'cleaning' },
  tenant:     { label: 'Tenant complaint',  glyph: 'speech', color: '#ff8fb1', vendorTrade: 'cleaning' },
  appliance:  { label: 'Fridge broken',     glyph: 'wrench', color: '#de7a3a', vendorTrade: 'plumbing' },
};
