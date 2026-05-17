import type { DispatchContext, HomieEvent, HomieId } from '../types';
import { TRANSCRIPTS } from '../data/transcripts';
import { pickVendorForTrade } from '../data/vendors';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Adapter = (ctx: DispatchContext) => AsyncGenerator<HomieEvent, void, void>;

async function* mockRamirez(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);
  yield { type: 'started', homieId: 'ramirez', task: `Sourcing ${ctx.vendorTrade} vendors`, issueId: ctx.issueId };
  await sleep(400);

  const t = TRANSCRIPTS.ramirez!;
  if (t.kind === 'browser') {
    for (const page of t.pages) {
      yield { type: 'browser_navigate', homieId: 'ramirez', url: page.url };
      yield { type: 'browser_page', homieId: 'ramirez', url: page.url, body: page.body };
      await sleep(900);
    }
  }
  for (const line of t.lines) {
    yield { type: 'transcript_line', homieId: 'ramirez', who: line.who, text: line.t };
    await sleep(450);
  }

  yield {
    type: 'memory_write',
    homieId: 'ramirez',
    key: `shortlist.${ctx.issueId}`,
    value: `top vendor: ${vendor.name} (rating ${vendor.rating})`,
  };
  await sleep(300);
  yield { type: 'done', homieId: 'ramirez', summary: `Shortlisted ${vendor.name}` };
  yield { type: 'handoff', fromHomieId: 'ramirez', toHomieId: 'brooks', reason: 'store shortlist' };
}

async function* mockBrooksRead(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  yield { type: 'started', homieId: 'brooks', task: 'Reading prior deals from memory', issueId: ctx.issueId };
  await sleep(300);
  yield {
    type: 'memory_read',
    homieId: 'brooks',
    query: `prior deals for ${ctx.vendorTrade}`,
    result: 'avg $550, last quote 30% over avg',
  };
  await sleep(400);
  yield {
    type: 'transcript_line',
    homieId: 'brooks',
    who: 'sys',
    text: 'prior deal avg $550 — flagged for park before call',
  };
  await sleep(300);
  yield { type: 'done', homieId: 'brooks', summary: 'Context shared with park' };
  yield { type: 'handoff', fromHomieId: 'brooks', toHomieId: 'park', reason: 'enriched with prior deals' };
}

async function* mockPark(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);
  yield { type: 'started', homieId: 'park', task: `Calling ${vendor.name}`, issueId: ctx.issueId };
  await sleep(500);

  const t = TRANSCRIPTS.park!;
  if (t.kind === 'phone') {
    for (const line of t.lines) {
      yield { type: 'transcript_line', homieId: 'park', who: line.who, text: line.t };
      await sleep(900);
    }
  }
  yield { type: 'done', homieId: 'park', summary: 'Booked $640, saved $80' };
  yield { type: 'handoff', fromHomieId: 'park', toHomieId: 'chen', reason: 'pay vendor' };
}

async function* mockChen(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);
  yield { type: 'started', homieId: 'chen', task: `Paying ${vendor.name}`, issueId: ctx.issueId };
  await sleep(300);

  const t = TRANSCRIPTS.chen!;
  if (t.kind === 'browser') {
    for (const page of t.pages) {
      yield { type: 'browser_navigate', homieId: 'chen', url: page.url };
      yield { type: 'browser_page', homieId: 'chen', url: page.url, body: page.body };
      await sleep(900);
    }
  }
  for (const line of t.lines) {
    yield { type: 'transcript_line', homieId: 'chen', who: line.who, text: line.t };
    await sleep(450);
  }

  const chargeId = `pi_${Math.random().toString(36).slice(2, 14)}`;
  yield {
    type: 'payment',
    homieId: 'chen',
    amountCents: 64000,
    vendor: vendor.name,
    chargeId,
    dashboardUrl: `https://dashboard.stripe.com/test/payments/${chargeId}`,
  };
  await sleep(300);
  yield { type: 'done', homieId: 'chen', summary: `Paid $640 to ${vendor.name}` };
  yield { type: 'handoff', fromHomieId: 'chen', toHomieId: 'sato', reason: 'schedule vendor' };
}

async function* mockSato(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  const vendor = pickVendorForTrade(ctx.vendorTrade as never);
  yield { type: 'started', homieId: 'sato', task: `Booking ${vendor.name} on vendor portal`, issueId: ctx.issueId };
  await sleep(400);

  const t = TRANSCRIPTS.sato!;
  if (t.kind === 'browser') {
    for (const page of t.pages) {
      yield { type: 'browser_navigate', homieId: 'sato', url: page.url };
      yield { type: 'browser_page', homieId: 'sato', url: page.url, body: page.body };
      await sleep(900);
    }
  }
  for (const line of t.lines) {
    yield { type: 'transcript_line', homieId: 'sato', who: line.who, text: line.t };
    await sleep(450);
  }

  const routeId = `route-${Math.random().toString(36).slice(2, 8)}`;
  yield {
    type: 'truck_dispatched',
    vendorId: vendor.id,
    propertyId: ctx.propertyId,
    etaMinutes: 12,
    routeId,
  };
  await sleep(300);
  yield { type: 'done', homieId: 'sato', summary: 'Booking confirmed BX-44821' };
  yield { type: 'handoff', fromHomieId: 'sato', toHomieId: 'okafor', reason: 'notify tenant' };
}

async function* mockOkafor(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  yield { type: 'started', homieId: 'okafor', task: 'Notifying tenant', issueId: ctx.issueId };
  await sleep(300);

  const t = TRANSCRIPTS.okafor!;
  for (const line of t.lines) {
    yield { type: 'transcript_line', homieId: 'okafor', who: line.who, text: line.t };
    await sleep(450);
  }
  yield {
    type: 'email_sent',
    homieId: 'okafor',
    to: process.env.DEMO_TENANT_EMAIL || 'tenant@example.com',
    subject: 'Maintenance scheduled — today 3:40pm',
  };
  await sleep(300);
  yield { type: 'done', homieId: 'okafor', summary: 'Tenant notified by email' };
}

async function* mockBrooksWrite(ctx: DispatchContext): AsyncGenerator<HomieEvent> {
  yield { type: 'started', homieId: 'brooks', task: 'Persisting deal outcome', issueId: ctx.issueId };
  await sleep(300);
  yield {
    type: 'memory_write',
    homieId: 'brooks',
    key: `deal.${ctx.propertyId}.${ctx.issueId}`,
    value: 'Ricky $640 · saved $80 · 3:40pm',
  };
  await sleep(300);
  yield { type: 'done', homieId: 'brooks', summary: 'Deal archived to memory' };
}

export const mockAdapters: Record<HomieId, Adapter> = {
  ramirez: mockRamirez,
  park: mockPark,
  okafor: mockOkafor,
  sato: mockSato,
  chen: mockChen,
  // brooks is invoked twice — once before park (read), once after settlement (write)
  brooks: mockBrooksRead,
};

export const mockBrooksReadAdapter: Adapter = mockBrooksRead;
export const mockBrooksWriteAdapter: Adapter = mockBrooksWrite;
