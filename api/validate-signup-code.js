import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const LIFETIME_FREE_CODES = (process.env.LIFETIME_FREE_CODES || 'STfree1,STfree2,STfree3,STfree4,STfree5').split(',');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, userId, name, email } = req.body;
  if (!code || !userId) return res.status(400).json({ error: 'Missing code or userId' });

  try {
    if (LIFETIME_FREE_CODES.includes(code)) {
      await supabase.from('supervisors').upsert({
        user_id: userId,
        name: name || email || '',
        email: email || '',
        plan: 'starter',
        trial_ends_at: null,
        lifetime_free: true,
      }, { onConflict: 'user_id' });
      return res.status(200).json({ success: true, type: 'lifetime_free' });
    }

    // Track as referral if not a special code
    if (email) {
      await supabase.from('referrals').insert({
        referrer_id: null,
        referred_email: email,
        referred_user_id: userId,
        status: 'signed_up',
      }).then(() => {});
    }

    res.status(200).json({ success: true, type: 'referral' });
  } catch (err) {
    console.error('Validate signup code error:', err);
    res.status(500).json({ error: err.message });
  }
}
