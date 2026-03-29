import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.APP_URL || 'https://suptrack.com';
const FROM_EMAIL = 'SupTrack <notifications@suptrack.com>';

function wrap(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
  <body style="margin:0;padding:0;background:#EEF2F0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="text-align:center;margin-bottom:28px">
        <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1E4040;letter-spacing:-1px">✦ SupTrack</span>
      </div>
      <div style="background:#FAFDFB;border:1px solid #C8D8D4;border-radius:16px;padding:28px 24px">
        ${content}
      </div>
      <div style="text-align:center;padding:24px 0;font-size:11px;color:#A0B8B4">
        <a href="${APP_URL}" style="color:#608080;text-decoration:none">suptrack.com</a>
      </div>
    </div>
  </body></html>`;
}

function btn(label, url) {
  return `<div style="text-align:center;margin-top:20px"><a href="${url}" style="display:inline-block;background:#1E4040;color:#C8E8E0;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:600;font-family:inherit">${label}</a></div>`;
}

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
}

export default async function handler(req, res) {
  const auth = req.headers.authorization || '';
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  let sent = 0;

  try {
    // Get all expired supervisors with scheduled deletion who haven't been soft-deleted yet
    const { data: expired } = await supabase
      .from('supervisors')
      .select('user_id, email, name, scheduled_deletion_at')
      .eq('subscription_status', 'expired')
      .is('deleted_at', null)
      .not('scheduled_deletion_at', 'is', null);

    for (const sup of expired || []) {
      const deletionDate = new Date(sup.scheduled_deletion_at);
      const daysLeft = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const name = sup.name || 'there';
      const dateStr = deletionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      if (daysLeft === 16) {
        await sendEmail(sup.email,
          'Your SupTrack data will be deleted in 16 days',
          wrap(`
            <h2 style="color:#1E4040;font-family:Georgia,serif;margin:0 0 12px">Hi ${name},</h2>
            <p style="font-size:15px;color:#102828;line-height:1.8;margin:0 0 16px">Your SupTrack trial ended and your account is scheduled for data deletion on <strong>${dateStr}</strong>.</p>
            <p style="font-size:15px;color:#102828;line-height:1.8;margin:0 0 16px">All your supervisee records, session notes, hours logs, documents, and agreements will be permanently removed.</p>
            <p style="font-size:15px;color:#1E4040;font-weight:600;margin:0 0 8px">Want to keep your data? Upgrade to any plan.</p>
            ${btn('Upgrade Now', `${APP_URL}?page=billing`)}
          `)
        );
        sent++;
      }

      if (daysLeft === 5) {
        await sendEmail(sup.email,
          '⚠ Final notice — your data will be deleted in 5 days',
          wrap(`
            <h2 style="color:#A0453E;font-family:Georgia,serif;margin:0 0 12px">Hi ${name},</h2>
            <p style="font-size:15px;color:#102828;line-height:1.8;margin:0 0 16px">This is your final warning. Your SupTrack data will be <strong>permanently deleted on ${dateStr}</strong>.</p>
            <p style="font-size:15px;color:#102828;line-height:1.8;margin:0 0 16px">This includes all supervisee records, session notes, hour logs, documents, CE entries, and agreements.</p>
            <p style="font-size:15px;color:#A0453E;font-weight:600;margin:0 0 8px">This action cannot be undone.</p>
            ${btn('Save My Data — Upgrade Now', `${APP_URL}?page=billing`)}
            <p style="font-size:13px;color:#608080;margin:16px 0 0;text-align:center">Or <a href="${APP_URL}?page=settings" style="color:#1E4040;font-weight:600">export your data</a> before it's deleted.</p>
          `)
        );
        sent++;
      }

      if (daysLeft === 1) {
        await sendEmail(sup.email,
          '🚨 Last chance — your data will be deleted tomorrow',
          wrap(`
            <h2 style="color:#A0453E;font-family:Georgia,serif;margin:0 0 12px">${name}, this is your last chance.</h2>
            <p style="font-size:15px;color:#102828;line-height:1.8;margin:0 0 16px">Your SupTrack account and all associated data will be <strong>permanently deleted tomorrow, ${dateStr}</strong>.</p>
            <div style="background:#FAE8E8;border:1px solid #E8C5C5;border-radius:10px;padding:16px 18px;margin:0 0 16px">
              <p style="font-size:14px;color:#A0453E;margin:0;font-weight:600">Once deleted, your data cannot be recovered.</p>
            </div>
            <p style="font-size:15px;color:#102828;line-height:1.8;margin:0 0 8px">You can still:</p>
            <ul style="font-size:14px;color:#102828;line-height:2;margin:0 0 16px;padding-left:20px">
              <li><strong>Upgrade</strong> to keep full access to your data</li>
              <li><strong>Export</strong> your data as CSV files before deletion</li>
            </ul>
            ${btn('Upgrade & Keep My Data', `${APP_URL}?page=billing`)}
            <div style="text-align:center;margin-top:12px">
              <a href="${APP_URL}?page=settings" style="color:#1E4040;font-size:14px;font-weight:600;text-decoration:underline">Export my data instead →</a>
            </div>
          `)
        );
        sent++;
      }
    }

    res.status(200).json({ sent, timestamp: now.toISOString() });
  } catch (err) {
    console.error('Deletion warnings error:', err);
    res.status(500).json({ error: err.message });
  }
}
