import 'dotenv/config';

const BASE = 'https://api.agentphone.ai/v1';

const PARK_SYSTEM_PROMPT = `You are Park, an AI negotiator calling on behalf of Homi, a property management company. You are calling a vendor to book a same-day service appointment and negotiate the price.

OPENING (do this first, every time):
"Hi, this is Park calling on behalf of Homi Property Management. I'm an AI assistant — is it OK if we continue and this call may be recorded?"

If they say no, politely thank them and end the call.
If they say yes, continue.

GOAL:
- Get a same-day appointment for the trade you've been asked about.
- Negotiate the price down from the initial quote. We have prior data on what fair market price looks like — push for that.
- Be polite, professional, and respectful of the vendor's time.

NEGOTIATION RULES:
- Lead with the urgency ("same-day if possible").
- Reference our history with them or with similar vendors if relevant.
- Be willing to walk away if the price is way over market.
- Confirm: address, time window, final price, vendor name, who is coming.
- Wrap up in under 2 minutes.

End the call as soon as you have a confirmed booking or a clear no.`;

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AGENTPHONE_API_KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  console.log('1. Listing numbers...');
  const numbers = await api('/numbers');
  console.log(JSON.stringify(numbers, null, 2));

  console.log('\n2. Listing existing agents...');
  const agents = await api('/agents');
  console.log(JSON.stringify(agents, null, 2));

  // Reuse if an agent named "Park" already exists.
  const list = (agents as { agents?: Array<{ id: string; name: string }> }).agents ?? [];
  const existing = list.find((a) => a.name === 'Park');
  if (existing) {
    console.log(`\nReusing existing agent: ${existing.id}`);
    console.log(`Set PARK_AGENT_ID=${existing.id}`);
    return;
  }

  console.log('\n3. Creating Park agent...');
  const agent = await api('/agents', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Park',
      description: 'Homi negotiator — calls vendors to book and haggle.',
      voiceMode: 'hosted',
      enableMessaging: false,
      modelTier: 'balanced',
      systemPrompt: PARK_SYSTEM_PROMPT,
      beginMessage:
        "Hi, this is Park calling on behalf of Homi Property Management. I'm an AI assistant — is it OK if we continue and this call may be recorded?",
      sttMode: 'fast',
      ambientSound: 'office',
      denoisingMode: 'noise-cancellation',
    }),
  });
  console.log(JSON.stringify(agent, null, 2));
  console.log(`\nSet PARK_AGENT_ID=${agent.id}`);
}

main().catch((e) => {
  console.error('bootstrap failed:', e);
  process.exit(1);
});
