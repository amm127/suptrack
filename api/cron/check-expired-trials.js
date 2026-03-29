import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  const auth = req.headers.authorization || '';
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  let processed = 0;
  let hardDeleted = 0;
  let softDeleted = 0;
  let expired = 0;

  try {
    // 1. Mark newly expired trials
    const { data: newlyExpired } = await supabase
      .from('supervisors')
      .select('user_id, email, trial_ends_at')
      .is('deleted_at', null)
      .is('trial_expired_at', null)
      .is('stripe_customer_id', null)
      .not('lifetime_free', 'is', true)
      .lt('trial_ends_at', now.toISOString())
      .not('trial_ends_at', 'is', null);

    for (const sup of newlyExpired || []) {
      const scheduledDeletion = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('supervisors').update({
        subscription_status: 'expired',
        trial_expired_at: now.toISOString(),
        scheduled_deletion_at: scheduledDeletion,
      }).eq('user_id', sup.user_id);
      expired++;
    }

    // 2. Soft delete: trial_expired_at > 30 days ago, not yet soft deleted
    const { data: toSoftDelete } = await supabase
      .from('supervisors')
      .select('user_id, email')
      .is('deleted_at', null)
      .lt('trial_expired_at', thirtyDaysAgo)
      .not('trial_expired_at', 'is', null)
      .is('stripe_customer_id', null)
      .not('lifetime_free', 'is', true);

    for (const sup of toSoftDelete || []) {
      // Soft delete interns
      await supabase.from('interns').update({ deleted_at: now.toISOString() })
        .eq('supervisor_id', sup.user_id).is('deleted_at', null);

      // Soft delete supervisor
      await supabase.from('supervisors').update({ deleted_at: now.toISOString() })
        .eq('user_id', sup.user_id);

      // Delete storage files
      try {
        // Avatar
        await supabase.storage.from('avatars').remove([`${sup.user_id}/avatar`]);
        // Intern documents
        const { data: docs } = await supabase.storage.from('intern-documents').list(sup.user_id);
        if (docs?.length) {
          await supabase.storage.from('intern-documents').remove(docs.map(d => `${sup.user_id}/${d.name}`));
        }
      } catch (storageErr) {
        console.error('Storage cleanup error:', storageErr.message);
      }

      // Log
      await supabase.from('error_logs').insert({
        message: `Soft deleted account: ${sup.email} (user_id: ${sup.user_id})`,
        source: 'cron_check_expired_trials',
        created_at: now.toISOString(),
      });

      softDeleted++;
    }

    // 3. Hard delete: trial_expired_at > 60 days ago, already soft deleted
    const { data: toHardDelete } = await supabase
      .from('supervisors')
      .select('user_id, email')
      .not('deleted_at', 'is', null)
      .lt('trial_expired_at', sixtyDaysAgo)
      .not('trial_expired_at', 'is', null)
      .is('stripe_customer_id', null)
      .not('lifetime_free', 'is', true);

    for (const sup of toHardDelete || []) {
      // Hard delete interns (preserve nothing)
      await supabase.from('interns').delete().eq('supervisor_id', sup.user_id);

      // Hard delete related data
      await supabase.from('sessions').delete().eq('supervisor_id', sup.user_id);
      await supabase.from('hour_logs').delete().eq('supervisor_id', sup.user_id);
      await supabase.from('ce_entries').delete().eq('supervisor_id', sup.user_id);
      await supabase.from('messages').delete().eq('sender_id', sup.user_id);
      await supabase.from('todos').delete().eq('supervisor_id', sup.user_id);
      await supabase.from('invites').delete().eq('supervisor_id', sup.user_id);
      await supabase.from('announcements').delete().eq('sent_by', sup.user_id);
      await supabase.from('notification_preferences').delete().eq('supervisor_id', sup.user_id);

      // Hard delete supervisor record (keep support_tickets, payment_transactions, error_logs)
      await supabase.from('supervisors').delete().eq('user_id', sup.user_id);

      // Revoke auth
      try {
        await supabase.auth.admin.deleteUser(sup.user_id);
      } catch (authErr) {
        console.error('Auth delete error:', authErr.message);
      }

      // Log final deletion
      await supabase.from('error_logs').insert({
        message: `Hard deleted account: ${sup.email} (user_id: ${sup.user_id})`,
        source: 'cron_check_expired_trials',
        created_at: now.toISOString(),
      });

      hardDeleted++;
    }

    processed = expired + softDeleted + hardDeleted;

    res.status(200).json({
      processed,
      expired,
      softDeleted,
      hardDeleted,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error('Check expired trials error:', err);
    await supabase.from('error_logs').insert({
      message: `Cron error: ${err.message}`,
      source: 'cron_check_expired_trials',
      created_at: now.toISOString(),
    });
    res.status(500).json({ error: err.message });
  }
}
