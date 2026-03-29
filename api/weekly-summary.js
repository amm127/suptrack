import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.APP_URL || 'https://suptrack.com';
const FROM_EMAIL = 'SupTrack <notifications@suptrack.com>';

export default async function handler(req, res) {
  // Verify cron secret
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all supervisors with weekly summary enabled
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('supervisor_id, preferences');

    const enabledIds = (prefs || [])
      .filter(p => p.preferences?.WEEKLY_SUMMARY !== false)
      .map(p => p.supervisor_id);

    // Also include supervisors with no preferences row (default = enabled)
    const { data: allSupervisors } = await supabase
      .from('supervisors')
      .select('user_id, name, email');

    const supervisors = (allSupervisors || []).filter(s => {
      const hasPref = (prefs || []).find(p => p.supervisor_id === s.user_id);
      // Include if no pref row (default enabled) or explicitly enabled
      return !hasPref || hasPref.preferences?.WEEKLY_SUMMARY !== false;
    });

    if (supervisors.length === 0) {
      return res.status(200).json({ message: 'No supervisors with weekly summary enabled', sent: 0 });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let sent = 0;

    for (const sup of supervisors) {
      if (!sup.email) continue;

      // Hours logged this week
      const { data: hourLogs } = await supabase
        .from('hour_logs')
        .select('hours')
        .eq('supervisor_id', sup.user_id)
        .gte('date', weekAgo.slice(0, 10));
      const hoursLogged = Math.round((hourLogs || []).reduce((s, h) => s + Number(h.hours || 0), 0) * 10) / 10;

      // Active intern count
      const { count: internCount } = await supabase
        .from('interns')
        .select('id', { count: 'exact', head: true })
        .eq('supervisor_id', sup.user_id)
        .eq('status', 'active');

      // Unread messages
      const { data: convos } = await supabase
        .from('conversations')
        .select('unread_count')
        .eq('supervisor_id', sup.user_id);
      const unreadMessages = (convos || []).reduce((s, c) => s + (c.unread_count || 0), 0);

      // Pending connection requests
      const { count: pendingRequests } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('supervisor_id', sup.user_id)
        .eq('status', 'pending');

      // Build summary stats
      const paymentsDue = 0; // Would need to parse JSONB payments from interns — simplified
      const upcomingDeadlines = (unreadMessages > 0 ? 1 : 0) + (pendingRequests || 0);

      // Build email
      const html = buildWeeklyEmail({
        name: sup.name || 'Supervisor',
        hoursLogged: hoursLogged || '0',
        internCount: internCount || 0,
        paymentsDue,
        upcomingDeadlines,
        unreadMessages,
        pendingRequests: pendingRequests || 0,
      });

      // Send via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: sup.email,
          subject: 'Your SupTrack week in review ✦',
          html,
        }),
      });

      if (response.ok) sent++;
      else console.error(`Failed to send to ${sup.email}:`, await response.text());
    }

    res.status(200).json({ message: `Weekly summary sent to ${sent} supervisors`, sent });
  } catch (err) {
    console.error('Weekly summary error:', err);
    res.status(500).json({ error: err.message });
  }
}

function buildWeeklyEmail({ name, hoursLogged, internCount, paymentsDue, upcomingDeadlines, unreadMessages, pendingRequests }) {
  const statBox = (label, value, color) =>
    `<div style="background:#E8F0EE;border-radius:10px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:${color || '#1E4040'};font-family:Georgia,serif">${value}</div>
      <div style="font-size:12px;color:#608080;margin-top:4px">${label}</div>
    </div>`;

  const actionItems = [];
  if (unreadMessages > 0) actionItems.push(`${unreadMessages} unread message${unreadMessages !== 1 ? 's' : ''}`);
  if (pendingRequests > 0) actionItems.push(`${pendingRequests} pending supervision request${pendingRequests !== 1 ? 's' : ''}`);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
  <body style="margin:0;padding:0;background:#EEF2F0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="text-align:center;margin-bottom:28px">
        <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1E4040;letter-spacing:-1px">✦ SupTrack</span>
      </div>
      <div style="background:#FAFDFB;border:1px solid #C8D8D4;border-radius:16px;padding:28px 24px">
        <h2 style="color:#1E4040;font-family:Georgia,serif;margin:0 0 6px;font-size:24px">Week in review</h2>
        <p style="color:#608080;font-size:14px;margin:0 0 24px">Hi ${name}, here's your supervision summary for the past week.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          ${statBox('Hours logged', hoursLogged)}
          ${statBox('Active supervisees', internCount)}
          ${statBox('Payments due', paymentsDue)}
          ${statBox('Action items', upcomingDeadlines)}
        </div>

        ${actionItems.length > 0 ? `
          <div style="background:#FAF2E0;border:1px solid #E8D8A0;border-radius:10px;padding:14px 16px;margin-bottom:20px">
            <div style="font-size:13px;color:#7A5A00;font-weight:600;margin-bottom:6px">Needs your attention</div>
            ${actionItems.map(item => `<div style="font-size:14px;color:#102828;padding:3px 0">• ${item}</div>`).join('')}
          </div>
        ` : `
          <div style="background:#E8F5EE;border:1px solid #A8D8BC;border-radius:10px;padding:14px 16px;margin-bottom:20px;text-align:center">
            <div style="font-size:14px;color:#2E7A4E">All caught up — nothing needs your attention this week ✦</div>
          </div>
        `}

        <div style="text-align:center">
          <a href="${APP_URL}" style="display:inline-block;background:#1E4040;color:#C8E8E0;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:600">Open SupTrack</a>
        </div>
      </div>
      <div style="text-align:center;padding:24px 0;font-size:11px;color:#A0B8B4">
        <a href="${APP_URL}" style="color:#608080;text-decoration:none">suptrack.com</a> ·
        <a href="${APP_URL}?page=settings" style="color:#608080;text-decoration:none">Manage notifications</a> ·
        <a href="${APP_URL}?page=settings" style="color:#608080;text-decoration:none">Unsubscribe</a>
      </div>
    </div>
  </body></html>`;
}
