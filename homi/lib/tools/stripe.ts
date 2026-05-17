import { tool } from 'ai';
import { z } from 'zod';
import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getStripeClient() {
  if (stripe) return stripe;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is required for live Stripe usage');
  }
  stripe = new Stripe(apiKey);
  return stripe;
}

export const stripeChargeVendor = tool({
  description:
    'Charge a vendor for a booked job in Stripe test mode. Returns charge id + dashboard URL.',
  inputSchema: z.object({
    amountCents: z
      .number()
      .int()
      .positive()
      .describe('Amount to charge in cents'),
    vendorName: z.string().describe('Vendor business name'),
    memo: z
      .string()
      .describe('Short memo explaining the job, e.g. "HVAC repair at 1180 Castro"'),
  }),
  execute: async ({ amountCents, vendorName, memo }) => {
    const client = getStripeClient();
    const pi = await client.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      payment_method: 'pm_card_visa',
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: `${vendorName} — ${memo}`,
    });
    return {
      ok: true,
      chargeId: pi.id,
      amountCents,
      vendor: vendorName,
      dashboardUrl: `https://dashboard.stripe.com/test/payments/${pi.id}`,
    };
  },
});
