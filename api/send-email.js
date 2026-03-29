const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'SupTrack <notifications@suptrack.com>';
const APP_URL = process.env.APP_URL || 'https://suptrack.com';

// Simple in-memory rate limiter (resets on cold start)
const rateMap = {};
const RATE_LIMIT = 20; // per IP per hour

const TEMPLATES = {
  NEW_MESSAGE: ({ name, preview }) => ({
    subject: `New message from ${name} on SupTrack`,
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">New message from ${name}</h2>
      <div style="background:#E8F0EE;border-radius:10px;padding:16px 18px;font-size:15px;color:#102828;line-height:1.6;margin-bottom:20px">${preview}</div>
      ${btn('View Message', `${APP_URL}?page=messages`)}
    `),
  }),
  CONNECTION_REQUEST: ({ name, email, license, message }) => ({
    subject: `${name} wants to work with you`,
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">New supervision request</h2>
      <p style="font-size:15px;color:#102828;line-height:1.6;margin:0 0 16px"><strong>${name}</strong> (${email}) is interested in working with you.</p>
      ${license ? `<p style="font-size:14px;color:#608080;margin:0 0 8px">Credential/Program: ${license}</p>` : ''}
      ${message ? `<div style="background:#E8F0EE;border-radius:10px;padding:14px 16px;font-size:14px;color:#102828;line-height:1.6;margin-bottom:20px">${message}</div>` : ''}
      ${btn('View Request', `${APP_URL}?page=messages`)}
    `),
  }),
  PAYMENT_DUE: ({ internName, amount, dueDate }) => ({
    subject: `Payment reminder — ${internName}`,
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">Payment reminder</h2>
      <p style="font-size:15px;color:#102828;line-height:1.6;margin:0 0 16px"><strong>${internName}</strong> has an outstanding payment of <strong>$${amount}</strong>${dueDate ? ` due ${dueDate}` : ''}.</p>
      ${btn('View Payments', `${APP_URL}?page=payments`)}
    `),
  }),
  PAYMENT_RECEIVED: ({ internName, amount, date }) => ({
    subject: `Payment received — ${internName}`,
    html: wrap(`
      <h2 style="color:#2E7A4E;font-family:'Georgia',serif;margin:0 0 12px">Payment received</h2>
      <p style="font-size:15px;color:#102828;line-height:1.6;margin:0 0 8px"><strong>$${amount}</strong> received from <strong>${internName}</strong> on ${date}.</p>
      <p style="font-size:14px;color:#608080;margin:0 0 20px">This payment has been recorded in your SupTrack account.</p>
      ${btn('View Payments', `${APP_URL}?page=payments`)}
    `),
  }),
  DOCUMENT_UPLOADED: ({ internName, docName }) => ({
    subject: `${internName} uploaded a document`,
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">Document uploaded</h2>
      <p style="font-size:15px;color:#102828;line-height:1.6;margin:0 0 16px"><strong>${internName}</strong> uploaded <strong>${docName || 'a document'}</strong> to their profile.</p>
      ${btn('View Document', `${APP_URL}?page=interns`)}
    `),
  }),
  HOURS_MILESTONE: ({ internName, percentage, completed, required }) => ({
    subject: `${internName} hit a supervision milestone!`,
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">Hours milestone reached</h2>
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:48px;font-family:'Georgia',serif;color:#1E4040;font-weight:700">${percentage}%</div>
        <p style="font-size:15px;color:#608080;margin:8px 0 0">${internName} has completed ${completed} of ${required} required hours</p>
      </div>
      ${btn('View Progress', `${APP_URL}?page=interns`)}
    `),
  }),
  LICENSE_90_DAYS: ({ licenseType, expirationDate, ceHoursLeft }) => ({
    subject: 'Your license renews in 90 days',
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">License renewal reminder</h2>
      <p style="font-size:15px;color:#102828;line-height:1.6;margin:0 0 16px">Your <strong>${licenseType}</strong> license expires on <strong>${expirationDate}</strong>.</p>
      ${ceHoursLeft > 0 ? `<p style="font-size:14px;color:#608080;margin:0 0 16px">You still need <strong>${ceHoursLeft} CE hours</strong> for renewal.</p>` : ''}
      ${btn('View CE Tracker', `${APP_URL}?page=ce`)}
    `),
  }),
  LICENSE_30_DAYS: ({ licenseType, expirationDate, ceHoursLeft }) => ({
    subject: 'Your license renews in 30 days',
    html: wrap(`
      <div style="background:#FAF2E0;border:2px solid #C4A040;border-radius:10px;padding:16px 18px;margin-bottom:20px;text-align:center">
        <div style="font-size:14px;color:#C4A040;font-weight:600;letter-spacing:1px">URGENT</div>
      </div>
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 12px">License renewal in 30 days</h2>
      <p style="font-size:15px;color:#102828;line-height:1.6;margin:0 0 16px">Your <strong>${licenseType}</strong> license expires on <strong>${expirationDate}</strong>. Please ensure all requirements are met.</p>
      ${ceHoursLeft > 0 ? `<p style="font-size:15px;color:#A0453E;font-weight:600;margin:0 0 16px">${ceHoursLeft} CE hours still needed.</p>` : ''}
      ${btn('View CE Tracker', `${APP_URL}?page=ce`)}
    `),
  }),
  INTERN_BIRTHDAY: ({ internName, daysUntil }) => ({
    subject: `${internName}'s birthday is ${daysUntil === 0 ? 'today' : `in ${daysUntil} days`}`,
    html: wrap(`
      <div style="text-align:center;padding:16px 0">
        <div style="font-size:40px;margin-bottom:8px">🎂</div>
        <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 8px">${daysUntil === 0 ? `Happy birthday, ${internName}!` : `${internName}'s birthday is coming up`}</h2>
        <p style="font-size:14px;color:#608080;margin:0">${daysUntil === 0 ? 'Today is their birthday — a great time to reach out.' : `Their birthday is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`}</p>
      </div>
    `),
  }),
  WEEKLY_SUMMARY: ({ hoursLogged, paymentsDue, upcomingDeadlines, internCount }) => ({
    subject: 'Your SupTrack week in review',
    html: wrap(`
      <h2 style="color:#1E4040;font-family:'Georgia',serif;margin:0 0 16px">Week in review</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        ${statBox('Hours logged', hoursLogged || '0')}
        ${statBox('Active supervisees', internCount || '0')}
        ${statBox('Payments due', paymentsDue || '0')}
        ${statBox('Upcoming deadlines', upcomingDeadlines || '0')}
      </div>
      ${btn('Open SupTrack', APP_URL)}
    `),
  }),
  WELCOME: ({ name, trialEndDate }) => ({
    subject: "You're in. Let's make supervision feel different. ✦",
    html: welcomeEmail(name || 'there', trialEndDate || ''),
  }),
  CUSTOM: ({ subject, body }) => ({
    subject: subject || 'Message from SupTrack',
    html: wrap(`
      <div style="font-size:15px;color:#102828;line-height:1.8;white-space:pre-wrap">${body || ''}</div>
    `),
  }),
};

function welcomeEmail(name, trialEndDate) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
  <body style="margin:0;padding:0;background:#FAF5EE;font-family:Georgia,'Times New Roman',serif">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px">
      <div style="text-align:center;margin-bottom:32px">
        <span style="font-size:28px;font-weight:700;color:#1E4040;letter-spacing:-1px">✦ SupTrack</span>
      </div>
      <div style="background:#FFFEFB;border:1px solid #E8DDD0;border-radius:16px;padding:36px 32px">
        <div style="text-align:center;font-size:20px;color:#C4A040;margin-bottom:24px">✦</div>
        <p style="font-size:18px;color:#1E4040;margin:0 0 20px;line-height:1.6">Hey ${name},</p>
        <p style="font-size:16px;color:#3A5A4A;line-height:1.8;margin:0 0 16px">Welcome to SupTrack — we're really glad you're here.</p>
        <p style="font-size:15px;color:#4A6A5A;line-height:1.8;margin:0 0 16px">We built this because we know what supervision actually feels like. The documentation. The scheduling. The wondering if you're tracking everything correctly. The weight of holding space for someone else's clinical growth while managing everything else on your plate.</p>
        <p style="font-size:15px;color:#4A6A5A;line-height:1.8;margin:0 0 24px">You shouldn't have to do all of that in spreadsheets and sticky notes.</p>
        <p style="font-size:15px;color:#4A6A5A;line-height:1.8;margin:0 0 24px">SupTrack was built by supervisors, for supervisors. Every feature exists because someone like you needed it. And we're just getting started.</p>

        <div style="margin-bottom:24px">
          <p style="font-size:15px;color:#1E4040;font-weight:600;margin:0 0 6px">Here's what you can do right now:</p>
          <div style="background:#F5F0E8;border-radius:10px;padding:18px 20px;margin-top:12px">
            <div style="margin-bottom:14px"><span style="color:#C4A040;font-weight:700">✦</span> <strong style="color:#1E4040">Add your first supervisee</strong><br/><span style="font-size:14px;color:#6A8A7A">Start tracking hours, sessions, and notes in one place.</span></div>
            <div style="margin-bottom:14px"><span style="color:#C4A040;font-weight:700">✦</span> <strong style="color:#1E4040">Complete your profile</strong><br/><span style="font-size:14px;color:#6A8A7A">Show up in our directory so the right interns can find you.</span></div>
            <div><span style="color:#C4A040;font-weight:700">✦</span> <strong style="color:#1E4040">Set up your agreements</strong><br/><span style="font-size:14px;color:#6A8A7A">Generate professional supervision agreements in minutes.</span></div>
          </div>
        </div>

        <p style="font-size:15px;color:#4A6A5A;line-height:1.8;margin:0 0 24px">Your 14-day free trial is fully unlocked${trialEndDate?' until <strong>'+trialEndDate+'</strong>':''} — no credit card, no pressure, no catch. Just the tools you need to supervise with confidence.</p>
        <p style="font-size:15px;color:#4A6A5A;line-height:1.8;margin:0 0 28px">Have a question or a suggestion? Reply to this email — we actually read them.</p>

        <p style="font-size:15px;color:#4A6A5A;line-height:1.8;margin:0 0 8px">Here's to supervision that finally feels as meaningful as the work itself.</p>
        <p style="font-size:15px;color:#1E4040;margin:0 0 4px">With warmth,</p>
        <p style="font-size:16px;color:#1E4040;font-weight:700;margin:0 0 28px">The SupTrack Team</p>

        <div style="text-align:center">
          <a href="${APP_URL}" style="display:inline-block;background:#1E4040;color:#C8E8E0;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:16px;font-weight:700;font-family:Georgia,serif">Get Started →</a>
        </div>

        <div style="text-align:center;margin-top:24px;font-size:14px;color:#C4A040">✦</div>
        <p style="font-size:13px;color:#8A9A8A;text-align:center;margin:16px 0 0;font-style:italic;line-height:1.6">P.S. — Your supervisees are lucky to have someone who cares enough to do this right. Don't forget that.</p>
      </div>
      <div style="text-align:center;padding:24px 0;font-size:11px;color:#B0A8A0">
        <a href="${APP_URL}" style="color:#8A9A8A;text-decoration:none">suptrack.com</a> ·
        <a href="${APP_URL}?page=settings" style="color:#8A9A8A;text-decoration:none">Unsubscribe</a>
        <br/>
        <a href="${APP_URL}/terms" style="color:#B0A8A0;text-decoration:none">Terms</a> ·
        <a href="${APP_URL}/privacy" style="color:#B0A8A0;text-decoration:none">Privacy</a> ·
        <a href="mailto:support@suptrack.com" style="color:#B0A8A0;text-decoration:none">support@suptrack.com</a>
      </div>
    </div>
  </body></html>`;
}

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
        <a href="${APP_URL}" style="color:#608080;text-decoration:none">suptrack.com</a> ·
        <a href="${APP_URL}?page=settings" style="color:#608080;text-decoration:none">Manage notifications</a> ·
        <a href="${APP_URL}?page=settings" style="color:#608080;text-decoration:none">Unsubscribe</a>
        <br/>
        <a href="${APP_URL}/terms" style="color:#A0B8B4;text-decoration:none">Terms</a> ·
        <a href="${APP_URL}/privacy" style="color:#A0B8B4;text-decoration:none">Privacy</a> ·
        <a href="mailto:support@suptrack.com" style="color:#A0B8B4;text-decoration:none">support@suptrack.com</a>
      </div>
    </div>
  </body></html>`;
}

function btn(label, url) {
  return `<div style="text-align:center"><a href="${url}" style="display:inline-block;background:#1E4040;color:#C8E8E0;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:600;font-family:inherit">${label}</a></div>`;
}

function statBox(label, value) {
  return `<div style="background:#E8F0EE;border-radius:10px;padding:14px;text-align:center">
    <div style="font-size:24px;font-weight:700;color:#1E4040;font-family:Georgia,serif">${value}</div>
    <div style="font-size:12px;color:#608080;margin-top:4px">${label}</div>
  </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  if (!rateMap[ip]) rateMap[ip] = [];
  rateMap[ip] = rateMap[ip].filter(t => now - t < 3600000);
  if (rateMap[ip].length >= RATE_LIMIT) return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  rateMap[ip].push(now);

  try {
    const { to, type, data, subject: customSubject, body: customBody } = req.body;
    if (!to || !type) return res.status(400).json({ error: 'Missing to or type' });
    if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

    const template = TEMPLATES[type];
    if (!template) return res.status(400).json({ error: `Unknown email type: ${type}` });

    const templateData = type === 'CUSTOM' ? { subject: customSubject, body: customBody, ...(data || {}) } : (data || {});
    const { subject, html } = template(templateData);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: type === 'WELCOME' ? 'SupTrack <hello@suptrack.com>' : FROM_EMAIL, to, subject, html }),
    });

    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result.message || 'Send failed' });

    res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: err.message });
  }
}
