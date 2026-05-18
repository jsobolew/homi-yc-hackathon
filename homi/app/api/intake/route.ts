import { addIssue, nextIssueId } from '@/lib/data/issuesStore';
import { PROPERTIES } from '@/lib/data/properties';
import type { IssueTypeKey } from '@/lib/data/issueTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AgentMailWebhook {
  event_type?: string;
  message?: {
    message_id?: string;
    thread_id?: string;
    inbox_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    text?: string;
    html?: string;
    extracted_text?: string;
  };
}

// Map keywords found in the email to our issue types. First match wins.
const TYPE_KEYWORDS: { type: IssueTypeKey; words: RegExp }[] = [
  { type: 'plumbing',   words: /\b(leak|leaking|water|pipe|plumb|toilet|sink|drain|flood)\b/i },
  { type: 'electrical', words: /\b(power|outlet|electric|spark|breaker|flicker|wiring|lights?)\b/i },
  { type: 'hvac',       words: /\b(heat|heating|cold|ac|a\/c|hvac|furnace|thermostat|cooling)\b/i },
  { type: 'pest',       words: /\b(roach|mouse|mice|rat|bug|pest|ant|cockroach|infestation)\b/i },
  { type: 'security',   words: /\b(lock|door|key|locked|jammed|break-?in|burglar)\b/i },
  { type: 'cleaning',   words: /\b(dirty|trash|garbage|clean|cleaning|mold|smell)\b/i },
  { type: 'appliance',  words: /\b(fridge|refrigerator|stove|oven|washer|dryer|appliance|dishwasher)\b/i },
];

function classifyType(text: string): IssueTypeKey {
  for (const { type, words } of TYPE_KEYWORDS) {
    if (words.test(text)) return type;
  }
  return 'tenant';
}

function classifyProperty(text: string): string {
  const t = text.toLowerCase();
  for (const property of PROPERTIES) {
    const tokens = [
      property.name.toLowerCase(),
      property.neighborhood.toLowerCase(),
      ...property.name.toLowerCase().split(/\s+/),
    ];
    if (tokens.some((token) => token.length > 3 && t.includes(token))) {
      return property.id;
    }
  }
  return PROPERTIES[0].id;
}

function classifyRoom(text: string): { floor: number; room: string } {
  // Try to find "unit 3B", "apt 2A", "floor 4", etc.
  const unitMatch = text.match(/\b(?:unit|apt|apartment|#)\s*(\d+)\s*([A-D])\b/i);
  if (unitMatch) {
    return { floor: Math.max(1, parseInt(unitMatch[1], 10) % 6 || 1), room: unitMatch[2].toUpperCase() };
  }
  const floorMatch = text.match(/\bfloor\s*(\d+)\b/i);
  const floor = floorMatch ? Math.max(1, Math.min(6, parseInt(floorMatch[1], 10))) : 1 + Math.floor(Math.random() * 3);
  const rooms = ['A', 'B', 'C', 'D'];
  return { floor, room: rooms[Math.floor(Math.random() * rooms.length)] };
}

export async function POST(req: Request) {
  let body: AgentMailWebhook;
  try {
    body = (await req.json()) as AgentMailWebhook;
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  if (body.event_type && body.event_type !== 'message.received') {
    return Response.json({ ok: true, ignored: body.event_type });
  }

  const msg = body.message;
  if (!msg) {
    return Response.json({ error: 'missing message' }, { status: 400 });
  }

  const text = [msg.subject ?? '', msg.extracted_text ?? msg.text ?? ''].join(' ');
  const propertyId = classifyProperty(text);
  const type = classifyType(text);
  const { floor, room } = classifyRoom(text);

  const issue = await addIssue({
    id: nextIssueId(),
    propertyId,
    floor,
    room,
    type,
    status: 'open',
    ageMin: 0,
    intake: {
      source: 'agentmail',
      from: msg.from,
      subject: msg.subject,
      text: msg.extracted_text ?? msg.text,
      threadId: msg.thread_id,
      messageId: msg.message_id,
      receivedAt: Date.now(),
    },
  });

  return Response.json({ ok: true, issueId: issue.id, propertyId, type });
}

// For demo/testing convenience: GET fires a fake inbound email.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const subject = url.searchParams.get('subject') ?? 'Water leaking in unit 3B';
  const text = url.searchParams.get('text') ?? 'Hi — there is water leaking from the ceiling in my apartment at 1247 Castro. Please send someone soon.';
  const from = url.searchParams.get('from') ?? 'tenant@example.com';

  const fakePayload: AgentMailWebhook = {
    event_type: 'message.received',
    message: {
      message_id: `msg_${Date.now()}`,
      thread_id: `thread_${Date.now()}`,
      inbox_id: process.env.AGENTMAIL_INBOX_ID ?? 'demo',
      from,
      to: ['homi@agentmail.to'],
      subject,
      text,
      extracted_text: text,
    },
  };

  return POST(
    new Request(req.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fakePayload),
    }),
  );
}
