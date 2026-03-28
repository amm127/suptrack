import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SEAT_PRICES = {
  monthly: 'price_1TFlNyPh0EYN12t7zG3zAODs',
  annual:  'price_1TFlOUPh0EYN12t79KaLvSic',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, seatCount } = req.body;
    if (typeof seatCount !== 'number' || seatCount < 0) {
      return res.status(400).json({ error: 'Invalid seat count' });
    }

    // Get the supervisor's Stripe customer ID and billing cycle
    const { data: supervisor } = await supabase
      .from('supervisors')
      .select('stripe_customer_id, billing_cycle')
      .eq('user_id', userId)
      .single();

    if (!supervisor?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const cycle = supervisor.billing_cycle || 'monthly';
    const seatPriceId = SEAT_PRICES[cycle];

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

    // Find existing seat line item (could be either monthly or annual price)
    const seatItem = subscription.items.data.find(
      item => Object.values(SEAT_PRICES).includes(item.price.id)
    );

    if (seatCount === 0 && seatItem) {
      // Remove seat add-on
      await stripe.subscriptionItems.del(seatItem.id, { proration_behavior: 'create_prorations' });
    } else if (seatCount > 0 && seatItem) {
      if (seatItem.price.id === seatPriceId) {
        // Same cycle — just update quantity
        await stripe.subscriptionItems.update(seatItem.id, {
          quantity: seatCount,
          proration_behavior: 'create_prorations',
        });
      } else {
        // Cycle changed — remove old, add new
        await stripe.subscriptionItems.del(seatItem.id, { proration_behavior: 'create_prorations' });
        await stripe.subscriptionItems.create({
          subscription: subscription.id,
          price: seatPriceId,
          quantity: seatCount,
          proration_behavior: 'create_prorations',
        });
      }
    } else if (seatCount > 0 && !seatItem) {
      // Add seat add-on to subscription
      await stripe.subscriptionItems.create({
        subscription: subscription.id,
        price: seatPriceId,
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
