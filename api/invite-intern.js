import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { internId, internEmail, supervisorId, supervisorName } = req.body;

    if (!internId || !internEmail || !supervisorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a unique invite token
    const token = crypto.randomUUID();

    // Update the intern record with portal info
    const { error: updateError } = await supabase
      .from('interns')
      .update({
        portal_email: internEmail,
        portal_enabled: true,
        portal_invite_token: token,
      })
      .eq('id', internId)
      .eq('supervisor_id', supervisorId);

    if (updateError) {
      console.error('Update intern error:', updateError);
      return res.status(500).json({ error: 'Failed to enable portal access' });
    }

    // Create an invite record so the intern can sign up
    const { error: inviteError } = await supabase
      .from('invites')
      .insert({
        code: token,
        used: false,
        type: 'intern_portal',
        intern_id: internId,
        email: internEmail,
      });

    if (inviteError) {
      console.error('Invite insert error:', inviteError);
      // Don't fail — the portal_enabled flag is already set
    }

    const appUrl = req.headers.origin || process.env.APP_URL || 'https://app.suptrack.io';
    const inviteLink = `${appUrl}?invite=${token}&type=intern`;

    // Send invite email via Resend
    try {
      const emailRes = await fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: internEmail,
          type: 'INTERN_PORTAL_INVITE',
          data: { supervisorName: supervisorName || 'Your supervisor', internName: req.body.internName || '', inviteLink },
        }),
      });
      if (!emailRes.ok) console.error('Invite email send failed:', await emailRes.text());
    } catch (emailErr) {
      console.error('Invite email error:', emailErr.message);
      // Don't fail the invite if email fails — supervisor can still share the link
    }

    res.status(200).json({
      success: true,
      inviteLink,
      message: `Portal access enabled for ${internEmail}`,
    });
  } catch (err) {
    console.error('Invite intern error:', err);
    res.status(500).json({ error: err.message });
  }
}
