import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId } = req.body;

    const { data: supervisor } = await supabase
      .from('supervisors')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!supervisor?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: supervisor.stripe_customer_id,
      return_url: req.headers.origin || process.env.APP_URL,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: err.message });
  }
}
