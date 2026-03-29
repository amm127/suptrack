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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch data in parallel
    const [
      activeSubsRes,
      canceledSubsRes,
      pastDueSubsRes,
      recentChargesRes,
      balanceRes,
    ] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.subscriptions.list({ status: 'canceled', created: { gte: Math.floor(monthStart.getTime() / 1000) }, limit: 100 }),
      stripe.subscriptions.list({ status: 'past_due', limit: 100 }),
      stripe.charges.list({ limit: 20 }),
      stripe.balance.retrieve(),
    ]);

    // Calculate MRR from active subscriptions
    let mrr = 0;
    const activeSubs = activeSubsRes.data;
    for (const sub of activeSubs) {
      for (const item of sub.items.data) {
        const amount = item.price.unit_amount || 0;
        const interval = item.price.recurring?.interval;
        const qty = item.quantity || 1;
        if (interval === 'month') mrr += amount * qty;
        else if (interval === 'year') mrr += Math.round((amount * qty) / 12);
      }
    }

    // Total revenue all time
    let totalRevenue = 0;
    const available = balanceRes.available || [];
    const pending = balanceRes.pending || [];
    // Use charges to sum total — more accurate
    let hasMore = true;
    let startingAfter = null;
    let chargeTotal = 0;
    // Limit to 5 pages to avoid timeout
    for (let page = 0; page < 5 && hasMore; page++) {
      const params = { limit: 100 };
      if (startingAfter) params.starting_after = startingAfter;
      const chargesPage = await stripe.charges.list(params);
      for (const ch of chargesPage.data) {
        if (ch.paid && !ch.refunded) chargeTotal += ch.amount;
        else if (ch.paid && ch.amount_refunded) chargeTotal += (ch.amount - ch.amount_refunded);
      }
      hasMore = chargesPage.has_more;
      if (chargesPage.data.length > 0) startingAfter = chargesPage.data[chargesPage.data.length - 1].id;
    }
    totalRevenue = chargeTotal;

    // Upcoming renewals in next 7 days
    const upcomingRenewals = activeSubs.filter(sub => {
      const renewDate = new Date(sub.current_period_end * 1000);
      return renewDate <= weekFromNow && renewDate >= now;
    });

    // Recent charges formatted
    const recentCharges = recentChargesRes.data.map(ch => ({
      id: ch.id,
      amount: ch.amount,
      currency: ch.currency,
      status: ch.status,
      paid: ch.paid,
      refunded: ch.refunded,
      customer: ch.customer,
      customerEmail: ch.billing_details?.email || ch.receipt_email,
      description: ch.description,
      created: new Date(ch.created * 1000).toISOString(),
    }));

    // Failed payments detail
    const failedPayments = pastDueSubsRes.data.map(sub => ({
      id: sub.id,
      customer: sub.customer,
      customerEmail: sub.metadata?.email || null,
      plan: sub.metadata?.plan_name || 'unknown',
      amount: sub.items.data.reduce((s, i) => s + (i.price.unit_amount || 0) * (i.quantity || 1), 0),
      status: sub.status,
      daysOverdue: Math.floor((now.getTime() / 1000 - sub.current_period_end) / 86400),
      userId: sub.metadata?.user_id || null,
    }));

    // Net new this week (active subs created in last 7 days)
    const weekAgo = Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000);
    const netNew = activeSubs.filter(s => s.created >= weekAgo).length;

    res.status(200).json({
      mrr,
      totalRevenue,
      activeSubscriptions: activeSubs.length,
      canceledThisMonth: canceledSubsRes.data.length,
      failedPayments,
      failedPaymentsCount: pastDueSubsRes.data.length,
      recentCharges,
      upcomingRenewals: upcomingRenewals.length,
      netNewThisWeek: netNew,
    });
  } catch (err) {
    console.error('Stripe overview error:', err);
    res.status(500).json({ error: err.message });
  }
}
