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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  const { action_type, target_user_id, target_email, details } = req.body;

  if (!action_type) return res.status(400).json({ error: 'action_type required' });

  try {
    // Execute the admin action via service key
    const { action, params } = req.body;

    if (action === 'extend_trial') {
      const currentEnd = params.current_end ? new Date(params.current_end) : new Date();
      const newEnd = new Date(currentEnd.getTime() + (params.days || 7) * 24 * 60 * 60 * 1000);
      await supabase.from('supervisors').update({ trial_ends_at: newEnd.toISOString() }).eq('user_id', target_user_id);
    } else if (action === 'change_plan') {
      await supabase.from('supervisors').update({ plan: params.plan }).eq('user_id', target_user_id);
    } else if (action === 'toggle_lifetime') {
      await supabase.from('supervisors').update({ lifetime_free: params.value }).eq('user_id', target_user_id);
    } else if (action === 'toggle_disabled') {
      await supabase.from('supervisors').update({ subscription_status: params.status }).eq('user_id', target_user_id);
    }

    // Log the action
    await supabase.from('admin_actions').insert({
      admin_email: admin.email,
      action_type,
      target_user_id: target_user_id || null,
      target_email: target_email || null,
      details: details || null,
      created_at: new Date().toISOString(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Audit action error:', err);
    res.status(500).json({ error: err.message });
  }
}
