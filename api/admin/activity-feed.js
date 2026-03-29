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
    const events = [];

    // Recent signups
    const { data: recentSups } = await supabase
      .from('supervisors')
      .select('name,email,plan,created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    (recentSups || []).forEach(s => {
      events.push({
        type: 'signup',
        description: `${s.name || s.email} signed up`,
        user_name: s.name || null,
        user_email: s.email,
        timestamp: s.created_at,
      });
    });

    // Recent interns added
    const { data: recentInterns } = await supabase
      .from('interns')
      .select('name,supervisor_id,created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get supervisor names for intern events
    const supIds = [...new Set((recentInterns || []).map(i => i.supervisor_id).filter(Boolean))];
    const supMap = {};
    if (supIds.length > 0) {
      const { data: supNames } = await supabase
        .from('supervisors')
        .select('user_id,name,email')
        .in('user_id', supIds);
      (supNames || []).forEach(s => { supMap[s.user_id] = s.name || s.email; });
    }

    (recentInterns || []).forEach(i => {
      events.push({
        type: 'intern',
        description: `${i.name || 'New supervisee'} added by ${supMap[i.supervisor_id] || 'unknown'}`,
        user_name: supMap[i.supervisor_id] || null,
        user_email: null,
        timestamp: i.created_at,
      });
    });

    // Recent support tickets
    const { data: recentTickets } = await supabase
      .from('support_tickets')
      .select('subject,user_email,created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    (recentTickets || []).forEach(t => {
      events.push({
        type: 'ticket',
        description: `Support ticket: ${t.subject || 'No subject'}`,
        user_name: null,
        user_email: t.user_email,
        timestamp: t.created_at,
      });
    });

    // Recent admin actions
    const { data: recentActions } = await supabase
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    (recentActions || []).forEach(a => {
      events.push({
        type: 'admin',
        description: `${a.admin_email}: ${a.action_type} → ${a.target_email || 'platform'}`,
        user_name: null,
        user_email: a.admin_email,
        timestamp: a.created_at,
      });
    });

    // Sort all events by timestamp descending
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ events: events.slice(0, 50) });
  } catch (err) {
    console.error('Activity feed error:', err);
    res.status(500).json({ error: err.message });
  }
}
