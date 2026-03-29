import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function toCsv(headers, rows) {
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify auth
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth required' });
  const token = authHeader.slice(7);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid session' });

  try {
    const userId = user.id;

    // Fetch all data in parallel
    const [
      { data: supervisor },
      { data: interns },
      { data: sessions },
      { data: hourLogs },
      { data: ceEntries },
    ] = await Promise.all([
      supabase.from('supervisors').select('*').eq('user_id', userId).single(),
      supabase.from('interns').select('*').eq('supervisor_id', userId).is('deleted_at', null).order('created_at'),
      supabase.from('sessions').select('*').eq('supervisor_id', userId).order('created_at'),
      supabase.from('hour_logs').select('*').eq('supervisor_id', userId).order('created_at'),
      supabase.from('ce_entries').select('*').eq('supervisor_id', userId).order('created_at'),
    ]);

    // Build CSVs
    const internsCsv = toCsv(
      ['name', 'credential', 'discipline', 'status', 'start_date', 'hours_completed', 'hours_total', 'billing_rate', 'billing_schedule', 'created_at'],
      interns || []
    );

    const sessionsCsv = toCsv(
      ['intern_id', 'date', 'duration', 'session_type', 'topics', 'notes', 'created_at'],
      (sessions || []).map(s => ({
        ...s,
        topics: Array.isArray(s.topics) ? s.topics.join('; ') : s.topics || '',
      }))
    );

    const hoursCsv = toCsv(
      ['intern_id', 'date', 'hours', 'type', 'category', 'notes', 'created_at'],
      hourLogs || []
    );

    const ceCsv = toCsv(
      ['title', 'provider', 'date', 'hours', 'category', 'license_board', 'created_at'],
      ceEntries || []
    );

    const profileCsv = toCsv(
      ['name', 'email', 'plan', 'credential', 'license_number', 'created_at'],
      supervisor ? [supervisor] : []
    );

    // Return as JSON with CSV strings (client handles download)
    res.status(200).json({
      files: [
        { name: 'profile.csv', content: profileCsv },
        { name: 'supervisees.csv', content: internsCsv },
        { name: 'sessions.csv', content: sessionsCsv },
        { name: 'hours_log.csv', content: hoursCsv },
        { name: 'ce_entries.csv', content: ceCsv },
      ],
      exportedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
}
