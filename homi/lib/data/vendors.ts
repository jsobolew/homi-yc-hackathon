export type VendorTrade =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'pest'
  | 'security'
  | 'cleaning';

export type VendorSpriteKey = 'plumb' | 'elec' | 'hvac' | 'pest';

export interface Vendor {
  id: string;
  name: string;
  trade: VendorTrade;
  spriteKey: VendorSpriteKey;
  baseQuote: number;
  rating: number;
  office: { lon: number; lat: number; x: number; y: number };
  phone: string;
}

// Office coordinates are on the same 100x70 grid as PROPERTIES so trucks can route
// from vendor office → property without coordinate juggling.
export const VENDORS: Vendor[] = [
  { id: 'v1', name: "Ricky's Plumbing", trade: 'plumbing', spriteKey: 'plumb', baseQuote: 480, rating: 4.6, office: { lon: -122.4211, lat: 37.7579, x: 32, y: 50 }, phone: '(415) 555-0184' },
  { id: 'v2', name: 'Bay Area Pipe Co.', trade: 'plumbing', spriteKey: 'plumb', baseQuote: 620, rating: 4.2, office: { lon: -122.3992, lat: 37.7802, x: 64, y: 30 }, phone: '(415) 555-0210' },
  { id: 'v3', name: 'Pelican Plumbing', trade: 'plumbing', spriteKey: 'plumb', baseQuote: 540, rating: 4.8, office: { lon: -122.4492, lat: 37.7708, x: 22, y: 40 }, phone: '(415) 555-0244' },
  { id: 'v4', name: 'Sparkpoint Electric', trade: 'electrical', spriteKey: 'elec', baseQuote: 380, rating: 4.7, office: { lon: -122.4171, lat: 37.7895, x: 50, y: 28 }, phone: '(415) 555-0301' },
  { id: 'v5', name: 'Fog City Wiring', trade: 'electrical', spriteKey: 'elec', baseQuote: 420, rating: 4.4, office: { lon: -122.4728, lat: 37.7911, x: 18, y: 24 }, phone: '(415) 555-0312' },
  { id: 'v6', name: 'Cable Car HVAC', trade: 'hvac', spriteKey: 'hvac', baseQuote: 720, rating: 4.5, office: { lon: -122.4114, lat: 37.7976, x: 56, y: 22 }, phone: '(415) 555-0411' },
  { id: 'v7', name: 'Twin Peaks Heating', trade: 'hvac', spriteKey: 'hvac', baseQuote: 680, rating: 4.3, office: { lon: -122.4327, lat: 37.7648, x: 36, y: 42 }, phone: '(415) 555-0422' },
  { id: 'v8', name: 'BugOut Pest Co.', trade: 'pest', spriteKey: 'pest', baseQuote: 220, rating: 4.6, office: { lon: -122.3978, lat: 37.7766, x: 60, y: 36 }, phone: '(415) 555-0510' },
  { id: 'v9', name: 'Mission Locksmiths', trade: 'security', spriteKey: 'elec', baseQuote: 180, rating: 4.9, office: { lon: -122.4184, lat: 37.7594, x: 38, y: 50 }, phone: '(415) 555-0612' },
  { id: 'v10', name: 'SparklePros Cleaning', trade: 'cleaning', spriteKey: 'pest', baseQuote: 240, rating: 4.5, office: { lon: -122.4212, lat: 37.7795, x: 44, y: 32 }, phone: '(415) 555-0701' },
];

export function getVendor(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}

export function pickVendorForTrade(trade: VendorTrade): Vendor {
  const candidates = VENDORS.filter((v) => v.trade === trade);
  if (candidates.length === 0) return VENDORS[0];
  // Pick highest-rated for determinism in demo.
  return candidates.reduce((a, b) => (b.rating > a.rating ? b : a));
}
