import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SEAT_PRICE_ID = 'price_additional_seat'; // $9.99/mo recurring

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, seatCount } = req.body;
    if (typeof seatCount !== 'number' || seatCount < 0) {
      return res.status(400).json({ error: 'Invalid seat count' });
    }

    // Get the supervisor's Stripe customer ID
    const { data: supervisor } = await supabase
      .from('supervisors')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!supervisor?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: supervisor.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    const subscription = subscriptions.data[0];

    // Find or add the seat line item
    const seatItem = subscription.items.data.find(
      item => item.price.id === SEAT_PRICE_ID
    );

    if (seatCount === 0 && seatItem) {
      // Remove seat add-on
      await stripe.subscriptionItems.del(seatItem.id, { proration_behavior: 'create_prorations' });
    } else if (seatCount > 0 && seatItem) {
      // Update seat quantity
      await stripe.subscriptionItems.update(seatItem.id, {
        quantity: seatCount,
        proration_behavior: 'create_prorations',
      });
    } else if (seatCount > 0 && !seatItem) {
      // Add seat add-on to subscription
      await stripe.subscriptionItems.create({
        subscription: subscription.id,
        price: SEAT_PRICE_ID,
        quantity: seatCount,
        proration_behavior: 'create_prorations',
      });
    }

    // Update seat count in Supabase
    await supabase.from('supervisors').update({ seat_count: seatCount }).eq('user_id', userId);

    res.status(200).json({ success: true, seatCount });
  } catch (err) {
    console.error('Update seats error:', err);
    res.status(500).json({ error: err.message });
  }
}
