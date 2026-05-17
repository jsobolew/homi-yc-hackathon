import { tool } from 'ai';
import { z } from 'zod';
import { AgentMailClient } from 'agentmail';

let client: AgentMailClient | null = null;

function getAgentMailClient() {
  if (client) return client;
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    throw new Error('AGENTMAIL_API_KEY is required for live AgentMail usage');
  }
  client = new AgentMailClient({ apiKey });
  return client;
}

function getInboxId() {
  const inboxId = process.env.AGENTMAIL_INBOX_ID;
  if (!inboxId) {
    throw new Error('AGENTMAIL_INBOX_ID is required for live AgentMail usage');
  }
  return inboxId;
}

export const agentMailSend = tool({
  description:
    'Send an email from Homi to a tenant. Use for scheduling confirmations, updates, and notifications.',
  inputSchema: z.object({
    to: z.string().email().describe('Tenant email address'),
    subject: z.string().describe('Subject line — short, action-oriented'),
    body: z
      .string()
      .describe('Plain text email body. Tenant-friendly, 2-4 sentences.'),
  }),
  execute: async ({ to, subject, body }) => {
    const inboxId = getInboxId();
    const r = await getAgentMailClient().inboxes.messages.send(inboxId, {
      to: [to],
      subject,
      text: body,
    });
    return {
      ok: true,
      messageId: r.messageId,
      threadId: r.threadId,
      inboxUrl: `https://console.agentmail.to/inboxes/${inboxId}/threads/${r.threadId}`,
    };
  },
});
