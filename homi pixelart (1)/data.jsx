// === Data layer ===
// Properties on the SF map. Coordinates are in map-pixel space (100x70 grid).

const PROPERTIES = [
  { id: 'p1', name: '1247 Castro St',   x: 28, y: 44, variant: 0, floors: 4, units: 12, neighborhood: 'Castro'      },
  { id: 'p2', name: '88 Mission Bay',   x: 70, y: 40, variant: 2, floors: 6, units: 36, neighborhood: 'Mission Bay' },
  { id: 'p3', name: '402 Hayes',        x: 44, y: 36, variant: 1, floors: 3, units: 6,  neighborhood: 'Hayes Valley'},
  { id: 'p4', name: '17 Nob Hill',      x: 52, y: 24, variant: 3, floors: 5, units: 18, neighborhood: 'Nob Hill'    },
  { id: 'p5', name: '901 Sunset',       x: 14, y: 36, variant: 0, floors: 3, units: 8,  neighborhood: 'Sunset'      },
  { id: 'p6', name: '230 Marina',       x: 38, y: 14, variant: 1, floors: 4, units: 14, neighborhood: 'Marina'      },
  { id: 'p7', name: '55 SoMa Lofts',    x: 60, y: 32, variant: 2, floors: 5, units: 22, neighborhood: 'SoMa'        },
  { id: 'p8', name: '714 Mission',      x: 36, y: 50, variant: 3, floors: 3, units: 9,  neighborhood: 'Mission'     },
];

// Vendor companies — random pool that pops up on the map during negotiations.
const VENDORS = [
  { id: 'v1', name: "Ricky's Plumbing",       trade: 'plumbing',    spriteKey: 'plumb', baseQuote: 480, rating: 4.6 },
  { id: 'v2', name: "Bay Area Pipe Co.",       trade: 'plumbing',    spriteKey: 'plumb', baseQuote: 620, rating: 4.2 },
  { id: 'v3', name: "Pelican Plumbing",        trade: 'plumbing',    spriteKey: 'plumb', baseQuote: 540, rating: 4.8 },
  { id: 'v4', name: "Sparkpoint Electric",     trade: 'electrical',  spriteKey: 'elec',  baseQuote: 380, rating: 4.7 },
  { id: 'v5', name: "Fog City Wiring",         trade: 'electrical',  spriteKey: 'elec',  baseQuote: 420, rating: 4.4 },
  { id: 'v6', name: "Cable Car HVAC",          trade: 'hvac',        spriteKey: 'hvac',  baseQuote: 720, rating: 4.5 },
  { id: 'v7', name: "Twin Peaks Heating",      trade: 'hvac',        spriteKey: 'hvac',  baseQuote: 680, rating: 4.3 },
  { id: 'v8', name: "BugOut Pest Co.",         trade: 'pest',        spriteKey: 'pest',  baseQuote: 220, rating: 4.6 },
  { id: 'v9', name: "Mission Locksmiths",      trade: 'security',    spriteKey: 'elec',  baseQuote: 180, rating: 4.9 },
  { id: 'v10', name: "SparklePros Cleaning",   trade: 'cleaning',    spriteKey: 'pest',  baseQuote: 240, rating: 4.5 },
];

// Issue types
const ISSUE_TYPES = {
  plumbing:   { label: 'Broken pipe',       glyph: 'drop',   color: '#4a6fa5', vendorTrade: 'plumbing' },
  electrical: { label: 'Lights flickering', glyph: 'bolt',   color: '#ffd966', vendorTrade: 'electrical' },
  hvac:       { label: 'Heating out',       glyph: 'thermo', color: '#ff5555', vendorTrade: 'hvac' },
  pest:       { label: 'Pest sighting',     glyph: 'bug',    color: '#6cc24a', vendorTrade: 'pest' },
  security:   { label: 'Lock jammed',       glyph: 'lock',   color: '#c14a4a', vendorTrade: 'security' },
  cleaning:   { label: 'Cleaning request',  glyph: 'broom',  color: '#8b5cb8', vendorTrade: 'cleaning' },
  tenant:     { label: 'Tenant complaint',  glyph: 'speech', color: '#ff8fb1', vendorTrade: 'cleaning' },
  appliance:  { label: 'Fridge broken',     glyph: 'wrench', color: '#de7a3a', vendorTrade: 'plumbing' },
};

// Initial active issues — placed on specific floors/rooms
const INITIAL_ISSUES = [
  { id: 'i1', propertyId: 'p1', floor: 2, room: 'A', type: 'plumbing',   status: 'open',     ageMin: 12 },
  { id: 'i2', propertyId: 'p1', floor: 3, room: 'B', type: 'electrical', status: 'open',     ageMin: 31 },
  { id: 'i3', propertyId: 'p4', floor: 1, room: 'C', type: 'hvac',       status: 'dispatched', ageMin: 4, assignedHomie: 'h2' },
  { id: 'i4', propertyId: 'p7', floor: 4, room: 'A', type: 'pest',       status: 'open',     ageMin: 88 },
  { id: 'i5', propertyId: 'p2', floor: 2, room: 'D', type: 'security',   status: 'open',     ageMin: 6 },
  { id: 'i6', propertyId: 'p3', floor: 2, room: 'B', type: 'cleaning',   status: 'open',     ageMin: 142 },
  { id: 'i7', propertyId: 'p6', floor: 3, room: 'A', type: 'tenant',     status: 'open',     ageMin: 22 },
  { id: 'i8', propertyId: 'p8', floor: 1, room: 'C', type: 'appliance',  status: 'open',     ageMin: 60 },
];

// Homies (AI agents). status: idle | calling | browsing | dispatching | done
const INITIAL_HOMIES = [
  { id: 'h1', name: 'Homie Ramirez',  role: 'Vendor Sourcer',     spriteIdx: 0, desk: 0, mode: 'browsing', task: 'Sourcing plumbers in Castro', issueId: 'i1' },
  { id: 'h2', name: 'Homie Park',     role: 'Negotiator',         spriteIdx: 1, desk: 1, mode: 'phone',    task: 'Negotiating HVAC quote, Nob Hill', issueId: 'i3' },
  { id: 'h3', name: 'Homie Okafor',   role: 'Tenant Comms',       spriteIdx: 2, desk: 2, mode: 'phone',    task: 'Calling tenant at 230 Marina',   issueId: 'i7' },
  { id: 'h4', name: 'Homie Sato',     role: 'Scheduler',          spriteIdx: 3, desk: 3, mode: 'laptop',   task: 'Booking pest visit window',      issueId: 'i4' },
  { id: 'h5', name: 'Homie Chen',     role: 'Compliance',         spriteIdx: 4, desk: 4, mode: 'laptop',   task: 'Filing locksmith insurance',     issueId: 'i5' },
  { id: 'h6', name: 'Homie Brooks',   role: 'Cleaner Coordinator',spriteIdx: 5, desk: 5, mode: 'browsing', task: 'Comparing SparklePros vs.\u00a0Diamond', issueId: 'i6' },
];

// Pre-baked transcripts for each homie's current task. These play out line-by-line.
const TRANSCRIPTS = {
  h1: {
    kind: 'browser',
    url: 'yelp.com/search?find_desc=plumber&find_loc=Castro+SF',
    pages: [
      { url: 'yelp.com/search?find_desc=plumber&find_loc=Castro+SF', body: [
        'TOP RESULTS — PLUMBERS NEAR CASTRO',
        '1. Ricky\'s Plumbing      ★4.6  $$  (218 reviews)',
        '2. Bay Area Pipe Co.     ★4.2  $$$ (94 reviews)',
        '3. Pelican Plumbing      ★4.8  $$  (412 reviews)',
        '4. Mission Pipefitters   ★4.1  $   (32 reviews)',
        '> homie: shortlisting top 3 by rating + availability',
      ]},
      { url: 'rickysplumbing.com/contact', body: [
        'RICKY\'S PLUMBING — EMERGENCY DISPATCH',
        'phone: (415) 555-0184',
        'hours: 24/7 same-day available',
        '> homie: pulled phone, queueing call',
      ]},
    ],
    lines: [
      { who: 'sys',  t: 'browsing yelp.com…' },
      { who: 'sys',  t: 'filtering for: rating > 4.5, distance < 2mi' },
      { who: 'sys',  t: '3 candidates found' },
      { who: 'sys',  t: 'pulling contact info from rickysplumbing.com' },
      { who: 'sys',  t: 'queued for negotiator (homie park)' },
    ],
  },
  h2: {
    kind: 'phone',
    callee: 'Cable Car HVAC — Tom',
    lines: [
      { who: 'them', t: 'Cable Car HVAC, this is Tom.' },
      { who: 'you',  t: 'Hi Tom, this is Homi calling for a quick HVAC quote — Nob Hill, 5-story walkup, unit 3C, heat out since this morning.' },
      { who: 'them', t: 'Can do same-day, looking at around $720 plus parts.' },
      { who: 'you',  t: 'Got a quote from Twin Peaks Heating at $640 even, also same-day. Can you match?' },
      { who: 'them', t: 'Hmm. $680 is the lowest I can do today.' },
      { who: 'you',  t: 'If you can do $640 we\'ll book three more buildings with you this quarter.' },
      { who: 'them', t: '…okay, $640. Send the address.' },
      { who: 'you',  t: 'Booked. Confirmation coming by SMS. Thanks Tom.' },
      { who: 'sys',  t: '— call ended —  saved: $80  eta: 3:40pm' },
    ],
  },
  h3: {
    kind: 'phone',
    callee: 'Tenant — Marisol (Unit 3A)',
    lines: [
      { who: 'them', t: 'Hello?' },
      { who: 'you',  t: 'Hi Marisol, this is Homi on behalf of building management.' },
      { who: 'you',  t: 'I saw your note about noise on the floor above — wanted to check in.' },
      { who: 'them', t: 'Yeah, it\'s been late at night, like 2am.' },
      { who: 'you',  t: 'Got it. I\'ll send a courtesy note to Unit 4A and post quiet hours in the lobby.' },
      { who: 'you',  t: 'Want me to follow up Friday to see if it improved?' },
      { who: 'them', t: 'That\'d be great, thanks.' },
      { who: 'sys',  t: '— call ended —  followup queued: Fri 10am' },
    ],
  },
  h4: {
    kind: 'browser',
    url: 'bugoutpest.com/book',
    pages: [
      { url: 'bugoutpest.com/book', body: [
        'BUGOUT PEST CO. — BOOK A VISIT',
        'service: GENERAL EXTERMINATION',
        'address: 55 SoMa Lofts, Unit 4A',
        'window:  [Wed 10–12] [Wed 1–3] [Thu 9–11]',
        '> homie: picking Thu 9–11 (tenant pref)',
      ]},
      { url: 'bugoutpest.com/confirm', body: [
        'BOOKING CONFIRMED — #BX-44821',
        'tech: Diego R.',
        'eta: Thu 9:00–11:00am',
        'cost: $220',
        '> homie: posting to tenant + calendar',
      ]},
    ],
    lines: [
      { who: 'sys', t: 'opening bugoutpest.com/book…' },
      { who: 'sys', t: 'filled service form (general extermination)' },
      { who: 'sys', t: 'cross-checking tenant availability calendar' },
      { who: 'sys', t: 'selected slot: Thu 9–11am' },
      { who: 'sys', t: 'booking confirmed #BX-44821' },
    ],
  },
  h5: {
    kind: 'browser',
    url: 'compliance.homi/insurance/upload',
    pages: [
      { url: 'compliance.homi/vendor/mission-locksmiths', body: [
        'VENDOR: Mission Locksmiths',
        'COI on file: EXPIRED (2025-12-04)',
        'requesting fresh certificate of insurance…',
      ]},
      { url: 'compliance.homi/vendor/mission-locksmiths', body: [
        'NEW COI RECEIVED — valid through 2027-04-15',
        'liability: $2M',
        'workers comp: yes',
        '> homie: uploading to vault, releasing dispatch',
      ]},
    ],
    lines: [
      { who: 'sys', t: 'checking compliance vault…' },
      { who: 'sys', t: 'Mission Locksmiths COI: EXPIRED' },
      { who: 'sys', t: 'emailed vendor for fresh COI' },
      { who: 'sys', t: 'received & validated, $2M coverage ok' },
      { who: 'sys', t: 'dispatch unblocked' },
    ],
  },
  h6: {
    kind: 'browser',
    url: 'sparklepros.co/quote',
    pages: [
      { url: 'sparklepros.co/quote', body: [
        'SPARKLEPROS — INSTANT QUOTE',
        'job:    deep clean, 1bd',
        'price:  $240',
        'avail:  tomorrow 11am',
      ]},
      { url: 'diamondcleansf.com/quote', body: [
        'DIAMOND CLEAN SF — QUOTE',
        'job:   deep clean, 1bd',
        'price: $215',
        'avail: today 4pm',
        '> homie: cheaper AND earlier, going with diamond',
      ]},
    ],
    lines: [
      { who: 'sys', t: 'fetching quote from sparklepros.co…' },
      { who: 'sys', t: 'sparklepros: $240, tomorrow 11am' },
      { who: 'sys', t: 'fetching quote from diamondcleansf.com…' },
      { who: 'sys', t: 'diamond: $215, today 4pm' },
      { who: 'sys', t: 'diamond wins. dispatching.' },
    ],
  },
};

// Vendor truck routes — for the map background activity.
// Each truck moves along a path of points. We pick a random vendor & path.
function makeTruckRoutes() {
  return [
    { from: { x: 6, y: 18 },  to: { x: 28, y: 44 }, vendor: VENDORS[0], property: 'p1' },
    { from: { x: 92, y: 28 }, to: { x: 70, y: 40 }, vendor: VENDORS[3], property: 'p2' },
    { from: { x: 80, y: 56 }, to: { x: 60, y: 32 }, vendor: VENDORS[7], property: 'p7' },
    { from: { x: 4, y: 48 },  to: { x: 36, y: 50 }, vendor: VENDORS[5], property: 'p8' },
  ];
}

Object.assign(window, {
  PROPERTIES, VENDORS, ISSUE_TYPES, INITIAL_ISSUES, INITIAL_HOMIES, TRANSCRIPTS, makeTruckRoutes,
});
