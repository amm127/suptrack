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
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  // GET — list all page content and email templates
  if (req.method === 'GET') {
    try {
      const [pages, templates, history] = await Promise.all([
        supabase.from('page_content').select('*').order('updated_at', { ascending: false }),
        supabase.from('email_templates').select('*').order('template_key'),
        supabase.from('content_history').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      res.status(200).json({
        pages: pages.data || [],
        templates: templates.data || [],
        history: history.data || [],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  // POST — save page content or email template
  if (req.method === 'POST') {
    const { type, page_key, content, template_key, subject, body } = req.body;

    try {
      if (type === 'page') {
        // Get old content for history
        const { data: old } = await supabase.from('page_content').select('*').eq('page_key', page_key).single();

        if (old) {
          // Save old version to history
          await supabase.from('content_history').insert({
            page_key,
            content: old.content,
            edited_by: admin.email,
            created_at: old.updated_at || new Date().toISOString(),
          });
          // Update existing
          await supabase.from('page_content').update({
            content,
            updated_by: admin.email,
            updated_at: new Date().toISOString(),
          }).eq('page_key', page_key);
        } else {
          // Insert new
          await supabase.from('page_content').insert({
            page_key,
            content,
            updated_by: admin.email,
            updated_at: new Date().toISOString(),
          });
        }

        // Log admin action
        await supabase.from('admin_actions').insert({
          admin_email: admin.email,
          action_type: 'edit_page',
          target_email: null,
          details: `Edited page: ${page_key}`,
          created_at: new Date().toISOString(),
        });

        res.status(200).json({ success: true });
      } else if (type === 'template') {
        const { data: old } = await supabase.from('email_templates').select('*').eq('template_key', template_key).single();

        if (old) {
          // Save old version to history
          await supabase.from('content_history').insert({
            page_key: `email:${template_key}`,
            content: { subject: old.subject, body: old.body },
            edited_by: admin.email,
            created_at: old.updated_at || new Date().toISOString(),
          });
          await supabase.from('email_templates').update({
            subject,
            body,
            updated_by: admin.email,
            updated_at: new Date().toISOString(),
          }).eq('template_key', template_key);
        } else {
          await supabase.from('email_templates').insert({
            template_key,
            subject,
            body,
            updated_by: admin.email,
            updated_at: new Date().toISOString(),
          });
        }

        await supabase.from('admin_actions').insert({
          admin_email: admin.email,
          action_type: 'edit_template',
          target_email: null,
          details: `Edited email template: ${template_key}`,
          created_at: new Date().toISOString(),
        });

        res.status(200).json({ success: true });
      } else if (type === 'restore') {
        // Restore from history
        const { history_id } = req.body;
        const { data: historyEntry } = await supabase.from('content_history').select('*').eq('id', history_id).single();
        if (!historyEntry) return res.status(404).json({ error: 'History entry not found' });

        // Save current as new history entry first
        const { data: current } = await supabase.from('page_content').select('*').eq('page_key', historyEntry.page_key).single();
        if (current) {
          await supabase.from('content_history').insert({
            page_key: historyEntry.page_key,
            content: current.content,
            edited_by: admin.email,
            created_at: new Date().toISOString(),
          });
        }

        // Restore the old version
        await supabase.from('page_content').upsert({
          page_key: historyEntry.page_key,
          content: historyEntry.content,
          updated_by: admin.email,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_key' });

        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: 'Invalid type' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
