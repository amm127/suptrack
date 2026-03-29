import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: sup } = await supabase.from('supervisors').select('lifetime_free').eq('user_id', user.id).single();
  if (!sup?.lifetime_free) return null;
  return user;
}

async function logAction(adminId, action, target, details) {
  await supabase.from('error_logs').insert({
    message: `Admin action: ${action} on ${target}`,
    source: 'admin_stripe_action',
    created_at: new Date().toISOString(),
    metadata: JSON.stringify({ admin_id: adminId, action, target, details }),
  }).then(() => {});
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  const { action, customerId, params } = req.body;
  if (!action) return res.status(400).json({ error: 'Action required' });

  try {
    let result;

    switch (action) {
      case 'refund_payment': {
        const { chargeId, amount, reason } = params || {};
        if (!chargeId) return res.status(400).json({ error: 'chargeId required' });
        const refundParams = { charge: chargeId };
        if (amount) refundParams.amount = amount; // partial refund in cents
        if (reason) refundParams.reason = reason;
        result = await stripe.refunds.create(refundParams);
        await logAction(admin.id, 'refund_payment', chargeId, { amount: amount || 'full', reason });
        break;
      }

      case 'cancel_subscription': {
        const { subscriptionId, atPeriodEnd } = params || {};
        if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId required' });
        if (atPeriodEnd) {
          result = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        } else {
          result = await stripe.subscriptions.cancel(subscriptionId);
        }
        await logAction(admin.id, 'cancel_subscription', subscriptionId, { atPeriodEnd: !!atPeriodEnd });
        break;
      }

      case 'update_subscription': {
        const { subscriptionId, priceId } = params || {};
        if (!subscriptionId || !priceId) return res.status(400).json({ error: 'subscriptionId and priceId required' });
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        result = await stripe.subscriptions.update(subscriptionId, {
          items: [{ id: sub.items.data[0].id, price: priceId }],
          proration_behavior: 'create_prorations',
        });
        await logAction(admin.id, 'update_subscription', subscriptionId, { priceId });
        break;
      }

      case 'create_coupon': {
        const { percentOff, duration, durationInMonths, name } = params || {};
        if (!percentOff) return res.status(400).json({ error: 'percentOff required' });
        const coupon = await stripe.coupons.create({
          percent_off: percentOff,
          duration: duration || 'once',
          duration_in_months: duration === 'repeating' ? (durationInMonths || 3) : undefined,
          name: name || `Admin coupon ${percentOff}% off`,
        });
        // Apply to customer if customerId provided
        if (customerId) {
          await stripe.customers.update(customerId, { coupon: coupon.id });
          await logAction(admin.id, 'apply_coupon', customerId, { couponId: coupon.id, percentOff });
        } else {
          await logAction(admin.id, 'create_coupon', coupon.id, { percentOff, duration });
        }
        result = coupon;
        break;
      }

      case 'retry_charge': {
        const { invoiceId } = params || {};
        if (!invoiceId) return res.status(400).json({ error: 'invoiceId required' });
        result = await stripe.invoices.pay(invoiceId);
        await logAction(admin.id, 'retry_charge', invoiceId, {});
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Stripe action error:', err);
    await logAction(admin.id, action, customerId || 'unknown', { error: err.message });
    res.status(500).json({ error: err.message });
  }
}
