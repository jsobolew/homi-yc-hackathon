import 'dotenv/config';
import { AgentMailClient } from 'agentmail';

async function main() {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) throw new Error('AGENTMAIL_API_KEY not set');

  const client = new AgentMailClient({ apiKey });

  // First check whether we already have an inbox.
  const existing = await client.inboxes.list();
  const items = (existing as { inboxes?: unknown[] }).inboxes ?? [];
  if (Array.isArray(items) && items.length > 0) {
    console.log('Existing inboxes found:');
    for (const inbox of items) {
      console.log(JSON.stringify(inbox, null, 2));
    }
    const first = items[0] as { inboxId?: string; inbox_id?: string };
    const id = first.inboxId ?? first.inbox_id;
    if (id) {
      console.log('\nReuse this — set AGENTMAIL_INBOX_ID=' + id);
      return;
    }
  }

  const inbox = await client.inboxes.create({
    username: 'homi',
    displayName: 'Homi',
  });
  console.log('Created inbox:');
  console.log(JSON.stringify(inbox, null, 2));
  const id = (inbox as { inboxId?: string; inbox_id?: string }).inboxId ?? (inbox as { inbox_id?: string }).inbox_id;
  console.log('\nSet AGENTMAIL_INBOX_ID=' + id);
}

main().catch((e) => {
  console.error('Bootstrap failed:', e);
  process.exit(1);
});
