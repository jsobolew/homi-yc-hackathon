import { tool } from 'ai';
import { z } from 'zod';
import { AgentMailClient } from 'agentmail';

const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! });
const INBOX_ID = process.env.AGENTMAIL_INBOX_ID!;

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
    const r = await client.inboxes.messages.send(INBOX_ID, {
      to: [to],
      subject,
      text: body,
    });
    return {
      ok: true,
      messageId: r.messageId,
      threadId: r.threadId,
      inboxUrl: `https://console.agentmail.to/inboxes/${INBOX_ID}/threads/${r.threadId}`,
    };
  },
});
