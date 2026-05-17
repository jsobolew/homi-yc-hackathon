import type { HomieId, Who } from '../types';

export interface BrowserPage {
  url: string;
  body: string[];
}

export interface PhoneTranscript {
  kind: 'phone';
  callee: string;
  lines: { who: Who; t: string }[];
}

export interface BrowserTranscript {
  kind: 'browser';
  url: string;
  pages: BrowserPage[];
  lines: { who: Who; t: string }[];
}

export type Transcript = PhoneTranscript | BrowserTranscript;

// Pre-baked transcripts. Mock adapter replays these as a HomieEvent stream.
export const TRANSCRIPTS: Partial<Record<HomieId, Transcript>> = {
  ramirez: {
    kind: 'browser',
    url: 'yelp.com/search?find_desc=plumber&find_loc=Castro+SF',
    pages: [
      {
        url: 'yelp.com/search?find_desc=plumber&find_loc=Castro+SF',
        body: [
          'TOP RESULTS — PLUMBERS NEAR CASTRO',
          "1. Ricky's Plumbing      ★4.6  $$  (218 reviews)",
          '2. Bay Area Pipe Co.     ★4.2  $$$ (94 reviews)',
          '3. Pelican Plumbing      ★4.8  $$  (412 reviews)',
          '4. Mission Pipefitters   ★4.1  $   (32 reviews)',
          '> homie: shortlisting top 3 by rating + availability',
        ],
      },
      {
        url: 'rickysplumbing.com/contact',
        body: [
          "RICKY'S PLUMBING — EMERGENCY DISPATCH",
          'phone: (415) 555-0184',
          'hours: 24/7 same-day available',
          '> homie: pulled phone, queueing call',
        ],
      },
    ],
    lines: [
      { who: 'sys', t: 'browsing yelp.com…' },
      { who: 'sys', t: 'filtering for: rating > 4.5, distance < 2mi' },
      { who: 'sys', t: '3 candidates found' },
      { who: 'sys', t: 'pulling contact info from rickysplumbing.com' },
      { who: 'sys', t: 'queued for negotiator (homie park)' },
    ],
  },
  park: {
    kind: 'phone',
    callee: "Ricky's Plumbing — Tom",
    lines: [
      { who: 'them', t: "Ricky's Plumbing, this is Tom." },
      { who: 'you',  t: 'Hi Tom, this is Homi calling for a quick plumbing quote — Castro, 4-story walkup, unit 2A, leak since this morning.' },
      { who: 'them', t: 'Can do same-day, looking at around $720 plus parts.' },
      { who: 'you',  t: 'Got a quote from Pelican at $640 even, also same-day. Can you match?' },
      { who: 'them', t: 'Hmm. $680 is the lowest I can do today.' },
      { who: 'you',  t: "If you can do $640 we'll book three more buildings with you this quarter." },
      { who: 'them', t: '…okay, $640. Send the address.' },
      { who: 'you',  t: 'Booked. Confirmation coming by SMS. Thanks Tom.' },
      { who: 'sys',  t: '— call ended —  saved: $80  eta: 3:40pm' },
    ],
  },
  okafor: {
    kind: 'phone',
    callee: 'Tenant — Marisol (Unit 2A)',
    lines: [
      { who: 'sys',  t: 'composing email to tenant…' },
      { who: 'sys',  t: 'subject: Maintenance scheduled — today 3:40pm' },
      { who: 'sys',  t: 'body: Plumber arriving 3:40pm for the leak in 2A. We will be in touch when done.' },
      { who: 'sys',  t: 'sent via AgentMail. delivery confirmed.' },
    ],
  },
  sato: {
    kind: 'browser',
    url: 'rickysplumbing.com/book',
    pages: [
      {
        url: 'rickysplumbing.com/book',
        body: [
          "RICKY'S PLUMBING — BOOK A VISIT",
          'service: EMERGENCY LEAK REPAIR',
          'address: 1247 Castro St, Unit 2A',
          'window:  [Today 1–3] [Today 3–5] [Tomorrow 9–11]',
          '> homie: picking Today 3–5 (tenant pref + nearest slot)',
        ],
      },
      {
        url: 'rickysplumbing.com/confirm',
        body: [
          'BOOKING CONFIRMED — #BX-44821',
          'tech: Diego R.',
          'eta: Today 3:40pm',
          'cost: $640',
          '> homie: posting to tenant + calendar',
        ],
      },
    ],
    lines: [
      { who: 'sys', t: 'opening rickysplumbing.com/book…' },
      { who: 'sys', t: 'filled service form (emergency leak repair)' },
      { who: 'sys', t: 'cross-checking tenant availability calendar' },
      { who: 'sys', t: 'selected slot: Today 3–5pm' },
      { who: 'sys', t: 'booking confirmed #BX-44821' },
    ],
  },
  chen: {
    kind: 'browser',
    url: 'dashboard.stripe.com/payments',
    pages: [
      {
        url: 'dashboard.stripe.com/payments/new',
        body: [
          'STRIPE — NEW PAYMENT',
          "vendor: Ricky's Plumbing",
          'amount: $640.00',
          'memo:   1247 Castro · leak repair · BX-44821',
          '> homie: creating payment intent in test mode',
        ],
      },
      {
        url: 'dashboard.stripe.com/payments/pi_3MtwBwLk',
        body: [
          'PAYMENT SUCCEEDED — $640.00',
          'id: pi_3MtwBwLk2ZdK',
          'mode: test',
          'sponge: invoice synced',
          '> homie: writing settlement to memory',
        ],
      },
    ],
    lines: [
      { who: 'sys', t: 'creating Stripe payment intent…' },
      { who: 'sys', t: 'test-mode charge: $640.00' },
      { who: 'sys', t: 'sponge: invoice synced to vendor side' },
      { who: 'sys', t: 'payment succeeded — pi_3MtwBwLk2ZdK' },
    ],
  },
  brooks: {
    kind: 'browser',
    url: 'supermemory.ai/spaces/homi',
    pages: [
      {
        url: 'supermemory.ai/spaces/homi/search',
        body: [
          'SUPERMEMORY — QUERY',
          'q: "Ricky\'s Plumbing past deals"',
          '> 2 results:',
          '  · 2026-04-12 · 1247 Castro · drain · $480',
          '  · 2026-03-02 · 88 Mission Bay · pipe · $620',
          '> avg: $550. last quote $720 is 30% above average.',
        ],
      },
      {
        url: 'supermemory.ai/spaces/homi/write',
        body: [
          'SUPERMEMORY — WRITE',
          'key: deal.1247-castro.leak.2026-05-17',
          'value: vendor=ricky $640 booked 3:40pm saved $80',
          '> committed.',
        ],
      },
    ],
    lines: [
      { who: 'sys', t: 'reading prior deals from Supermemory…' },
      { who: 'sys', t: '2 matches: avg $550, last quote 30% over' },
      { who: 'sys', t: 'sharing context with park before call' },
      { who: 'sys', t: 'writing deal outcome back to memory' },
    ],
  },
};
