import { ConfigCache } from './ConfigCache';
import { logger } from '../lib/logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');

let stripeInstance: any = null;
let lastKey = '';

export async function getStripe(): Promise<any | null> {
  const config = await ConfigCache.getInstance().get('STRIPE_SECRET_KEY');
  const key = config || process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;

  if (!stripeInstance || lastKey !== key) {
    stripeInstance = new Stripe(key);
    lastKey = key;
  }
  return stripeInstance;
}

export interface CheckoutParams {
  userId: string;
  email: string;
  plan: 'yearly' | 'monthly';
  orderBump: boolean;
  successUrl: string;
  cancelUrl: string;
}

// Default prices (in cents BRL) — overridable via SystemConfig
const DEFAULT_PRICES: Record<string, { amount: number; label: string }> = {
  yearly: { amount: 29700, label: 'Quantum Premium — Anual' },
  monthly: { amount: 4700, label: 'Quantum Premium — Mensal' },
  orderbump: { amount: 2700, label: 'Modo Focus + Integração' },
};

async function loadPrices(): Promise<Record<string, { amount: number; label: string }>> {
  try {
    const cached = await ConfigCache.getInstance().get('PRICING_CONFIG');
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...DEFAULT_PRICES, ...parsed };
    }
  } catch { /* use defaults */ }
  return DEFAULT_PRICES;
}

export async function createCheckoutSession(params: CheckoutParams): Promise<{ url: string; sessionId: string } | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  const lineItems: any[] = [
    {
      price_data: {
        currency: 'brl',
        product_data: { name: (await loadPrices())[params.plan].label },
        unit_amount: (await loadPrices())[params.plan].amount,
      },
      quantity: 1,
    },
  ];

  if (params.orderBump) {
    lineItems.push({
      price_data: {
        currency: 'brl',
        product_data: { name: (await loadPrices()).orderbump.label },
        unit_amount: (await loadPrices()).orderbump.amount,
      },
      quantity: 1,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: params.email,
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        plan: params.plan,
        orderBump: String(params.orderBump),
      },
    });

    return { url: session.url!, sessionId: session.id };
  } catch (err) {
    logger.error({ err }, 'Stripe checkout session creation failed');
    return null;
  }
}

export async function verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<any | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  const webhookSecret = (await ConfigCache.getInstance().get('STRIPE_WEBHOOK_SECRET')) || process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) return null;

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    logger.warn({ err }, 'Stripe webhook signature verification failed');
    return null;
  }
}

export async function getPrices() {
  const p = await loadPrices();
  return {
    yearly: { amount: p.yearly.amount / 100, currency: 'BRL' },
    monthly: { amount: p.monthly.amount / 100, currency: 'BRL' },
    orderBump: { amount: p.orderbump.amount / 100, currency: 'BRL' },
  };
}

export async function updatePricesConfig(prices: { yearly?: number; monthly?: number; orderbump?: number }): Promise<void> {
  const current = await loadPrices();
  if (prices.yearly !== undefined) current.yearly.amount = prices.yearly;
  if (prices.monthly !== undefined) current.monthly.amount = prices.monthly;
  if (prices.orderbump !== undefined) current.orderbump.amount = prices.orderbump;
  await ConfigCache.getInstance().set('PRICING_CONFIG', JSON.stringify(current), false, 'admin');
}
