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
    // Fetch all supervisors with service key (bypasses RLS)
    const { data: sups, error } = await supabase
      .from('supervisors')
      .select('user_id,name,email,plan,subscription_status,trial_ends_at,stripe_customer_id,lifetime_free,created_at,photo,credential')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get intern counts per supervisor
    const { data: internCounts } = await supabase
      .from('interns')
      .select('supervisor_id');

    const countMap = {};
    (internCounts || []).forEach(i => {
      countMap[i.supervisor_id] = (countMap[i.supervisor_id] || 0) + 1;
    });

    const result = (sups || []).map(s => ({
      ...s,
      intern_count: countMap[s.user_id] || 0,
    }));

    res.status(200).json({ supervisors: result });
  } catch (err) {
    console.error('All supervisors error:', err);
    res.status(500).json({ error: err.message });
  }
}
