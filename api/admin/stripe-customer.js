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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  const { email, customerId } = req.body;
  if (!email && !customerId) return res.status(400).json({ error: 'Email or customerId required' });

  try {
    let customer;
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length === 0) return res.status(404).json({ error: 'No Stripe customer found for this email' });
      customer = customers.data[0];
    }

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({ customer: customer.id, limit: 10 });

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({ customer: customer.id, type: 'card', limit: 5 });

    // Get invoices
    const invoices = await stripe.invoices.list({ customer: customer.id, limit: 20 });

    // Get upcoming invoice if active subscription
    let upcomingInvoice = null;
    if (subscriptions.data.some(s => s.status === 'active' || s.status === 'trialing')) {
      try {
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({ customer: customer.id });
      } catch (_) { /* no upcoming invoice */ }
    }

    // Format subscriptions
    const subs = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      plan: sub.metadata?.plan_name || sub.items.data[0]?.price?.nickname || 'unknown',
      cycle: sub.metadata?.cycle || sub.items.data[0]?.price?.recurring?.interval || 'monthly',
      amount: sub.items.data.reduce((s, i) => s + (i.price.unit_amount || 0) * (i.quantity || 1), 0),
      currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      created: new Date(sub.created * 1000).toISOString(),
    }));

    // Format payment methods
    const methods = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
    }));

    // Format invoices
    const invs = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid || inv.total,
      status: inv.status,
      paid: inv.paid,
      created: new Date(inv.created * 1000).toISOString(),
      hostedUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
    }));

    res.status(200).json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: new Date(customer.created * 1000).toISOString(),
      },
      subscriptions: subs,
      paymentMethods: methods,
      invoices: invs,
      upcomingInvoice: upcomingInvoice ? {
        amount: upcomingInvoice.amount_due,
        dueDate: upcomingInvoice.due_date ? new Date(upcomingInvoice.due_date * 1000).toISOString() : null,
        nextPaymentAttempt: upcomingInvoice.next_payment_attempt ? new Date(upcomingInvoice.next_payment_attempt * 1000).toISOString() : null,
      } : null,
    });
  } catch (err) {
    console.error('Stripe customer error:', err);
    res.status(500).json({ error: err.message });
  }
}
