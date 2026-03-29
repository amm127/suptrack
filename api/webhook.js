import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      const planName = sub.metadata?.plan_name || 'starter';
      const cycle = sub.metadata?.cycle || 'monthly';
      if (userId) {
        // Count seat add-on quantity
        const seatPriceIds = [
          'price_1TFlNyPh0EYN12t7zG3zAODs',
          'price_1TFlOUPh0EYN12t79KaLvSic',
        ];
        const seatItem = sub.items?.data?.find(item => seatPriceIds.includes(item.price.id));
        const seatCount = seatItem ? seatItem.quantity : 0;

        await supabase.from('supervisors').update({
          plan: planName,
          billing_cycle: cycle,
          stripe_customer_id: sub.customer,
          seat_count: seatCount,
          subscription_status: sub.status === 'active' ? 'active' : sub.status === 'trialing' ? 'trial' : sub.status,
          stripe_subscription_id: sub.id,
        }).eq('user_id', userId);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (userId) {
        await supabase.from('supervisors').update({
          plan: 'starter',
          seat_count: 0,
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('user_id', userId);
      }
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const userId = sub.metadata?.user_id;
        const planName = sub.metadata?.plan_name || 'starter';
        const cycle = sub.metadata?.cycle || 'monthly';
        if (userId) {
          await supabase.from('supervisors').update({
            plan: planName,
            billing_cycle: cycle,
            stripe_customer_id: session.customer,
          }).eq('user_id', userId);
        }
      }
      break;
    }
  }

  res.status(200).json({ received: true });
}
