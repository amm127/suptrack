import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const PLANS = {
  starter_monthly:  { price: 'price_starter_monthly',  amount: 2499 },
  starter_annual:   { price: 'price_starter_annual',   amount: 24990 },
  growth_monthly:   { price: 'price_growth_monthly',   amount: 3999 },
  growth_annual:    { price: 'price_growth_annual',    amount: 39990 },
  practice_monthly: { price: 'price_practice_monthly', amount: 6999 },
  practice_annual:  { price: 'price_practice_annual',  amount: 69990 },
};

const SEAT_PRICE_ID = 'price_additional_seat'; // $9.99/mo recurring

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { planId, userId, email } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    // Get or create Stripe customer
    const { data: supervisor } = await supabase
      .from('supervisors')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = supervisor?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
      customerId = customer.id;
      await supabase.from('supervisors').update({ stripe_customer_id: customerId }).eq('user_id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.price, quantity: 1 }],
      success_url: `${req.headers.origin || process.env.APP_URL}?checkout=success`,
      cancel_url: `${req.headers.origin || process.env.APP_URL}?checkout=cancel`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { user_id: userId, plan_name: planId.split('_')[0] },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}
