import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const PLANS = {
  starter_monthly:  { price: 'price_1TFl9bPh0EYN12t7BSJvA2kQ',  plan: 'starter' },
  starter_annual:   { price: 'price_1TFl9bPh0EYN12t7FeYqc8ac',   plan: 'starter' },
  growth_monthly:   { price: 'price_1TFlFDPh0EYN12t7fQbcQC5O',   plan: 'growth' },
  growth_annual:    { price: 'price_1TFlFhPh0EYN12t7XC4OqyVE',   plan: 'growth' },
  practice_monthly: { price: 'price_1TFlG8Ph0EYN12t71rJGxafK',   plan: 'practice' },
  practice_annual:  { price: 'price_1TFlGaPh0EYN12t7Acwi6vwx',   plan: 'practice' },
};

const SEAT_PRICES = {
  monthly: 'price_1TFlNyPh0EYN12t7zG3zAODs',
  annual:  'price_1TFlOUPh0EYN12t79KaLvSic',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { planId, userId, email, seatCount } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    const cycle = planId.endsWith('_annual') ? 'annual' : 'monthly';

    // Get or create Stripe customer
    const { data: supervisor } = await supabase
      .from('supervisors')
      .select('stripe_customer_id, trial_ends_at')
      .eq('user_id', userId)
      .single();

    let customerId = supervisor?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
      customerId = customer.id;
      await supabase.from('supervisors').update({ stripe_customer_id: customerId }).eq('user_id', userId);
    }

    // Build line items — plan + optional seats
    const line_items = [{ price: plan.price, quantity: 1 }];
    if (seatCount && seatCount > 0) {
      line_items.push({ price: SEAT_PRICES[cycle], quantity: seatCount });
    }

    // Only offer trial if the user's trial hasn't expired yet
    const trialEndsAt = supervisor?.trial_ends_at ? new Date(supervisor.trial_ends_at) : null;
    const trialStillActive = trialEndsAt && trialEndsAt > new Date();
    const trialDaysLeft = trialStillActive
      ? Math.max(1, Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)))
      : 0;

    const subscriptionData = {
      metadata: { user_id: userId, plan_name: plan.plan, cycle },
    };
    if (trialDaysLeft > 0) {
      subscriptionData.trial_period_days = trialDaysLeft;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items,
      success_url: `${req.headers.origin || process.env.APP_URL}?checkout=success`,
      cancel_url: `${req.headers.origin || process.env.APP_URL}?checkout=cancel`,
      subscription_data: subscriptionData,
      allow_promotion_codes: true,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}
