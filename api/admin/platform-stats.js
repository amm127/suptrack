import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const ADMIN_EMAILS = ['amm127@yahoo.com', 'joshmullen17@gmail.com'];

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: sup } = await supabase.from('supervisors').select('lifetime_free,email').eq('user_id', user.id).single();
  if (!sup?.lifetime_free) return null;
  if (!ADMIN_EMAILS.includes(sup.email)) return null;
  return { ...user, email: sup.email };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const [r1, r2, r3, r4, r5, r6] = await Promise.all([
      supabase.from('supervisors').select('created_at,plan,subscription_status,trial_ends_at,stripe_customer_id,lifetime_free,email', { count: 'exact' }),
      supabase.from('interns').select('*', { count: 'exact', head: true }),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('error_logs').select('*', { count: 'exact', head: true }).gte('created_at', dayAgo),
      supabase.from('hour_logs').select('hours'),
    ]);

    const sups = r1.data || [];
    const totalHours = (r6.data || []).reduce((s, h) => s + (Number(h.hours) || 0), 0);

    // Compute stats
    const newToday = sups.filter(s => s.created_at >= todayStart).length;
    const newWeek = sups.filter(s => s.created_at >= weekAgo).length;
    const newMonth = sups.filter(s => s.created_at >= monthAgo).length;
    const activeTrial = sups.filter(s => !s.stripe_customer_id && !s.lifetime_free && s.trial_ends_at && new Date(s.trial_ends_at) > now).length;
    const expiring7d = sups.filter(s => !s.stripe_customer_id && !s.lifetime_free && s.trial_ends_at && new Date(s.trial_ends_at) > now && s.trial_ends_at <= sevenDaysOut).length;
    const paidUsers = sups.filter(s => s.stripe_customer_id && !s.lifetime_free).length;
    const churnedMonth = sups.filter(s => s.subscription_status === 'canceled' || s.subscription_status === 'cancelled').length;

    // Weekly signups for chart (last 12 weeks)
    const weeks = [];
    for (let w = 11; w >= 0; w--) {
      const wStart = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      wStart.setHours(0, 0, 0, 0);
      wStart.setDate(wStart.getDate() - wStart.getDay());
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 7);
      const count = sups.filter(s => { const d = new Date(s.created_at); return d >= wStart && d < wEnd; }).length;
      weeks.push({ label: `W${12 - w}`, start: wStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count });
    }

    res.status(200).json({
      supervisors: r1.count || sups.length,
      newToday,
      newWeek,
      newMonth,
      totalInterns: r2.count || 0,
      totalSessions: r3.count || 0,
      totalHours: Math.round(totalHours * 10) / 10,
      activeTrial,
      expiring7d,
      paidUsers,
      churnedMonth,
      openTickets: r4.count || 0,
      recentErrors: r5.count || 0,
      weeklySignups: weeks,
    });
  } catch (err) {
    console.error('Platform stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
