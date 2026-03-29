import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  console.log('ElevenLabs key exists:', !!process.env.ELEVENLABS_API_KEY);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, voiceId } = req.body;
  if (!text || !voiceId) return res.status(400).json({ error: 'Missing text or voiceId' });
  if (text.length > 500) return res.status(400).json({ error: 'Text too long (max 500 chars)' });

  // Verify auth
  const authHeader = req.headers.authorization;
  let userId = null;
  if (authHeader?.startsWith('Bearer ')) {
    const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7));
    userId = user?.id || null;
  }

  // Rate limit: 20 requests per hour per user (non-blocking if table missing)
  if (userId) {
    try {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('voice_usage')
        .select('*', { count: 'exact', head: true })
        .eq('supervisor_id', userId)
        .gte('created_at', hourAgo);
      if (count >= 20) return res.status(429).json({ error: 'Rate limit: 20 voice requests per hour' });
    } catch (_) { /* table may not exist yet — skip rate limiting */ }
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'Voice service not configured' });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

    const audioBuffer = await response.arrayBuffer();

    // Log usage (non-blocking — table may not exist yet)
    if (userId) {
      supabase.from('voice_usage').insert({
        supervisor_id: userId,
        characters_used: text.length,
        voice_name: voiceId,
        created_at: new Date().toISOString(),
      }).then(() => {}).catch(() => {});
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('Voice generation error:', err);
    res.status(500).json({ error: 'Voice generation failed' });
  }
}
