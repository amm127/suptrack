const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const rateMap = {};
const RATE_LIMIT = 20;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  if (!rateMap[ip]) rateMap[ip] = [];
  rateMap[ip] = rateMap[ip].filter(t => now - t < 3600000);
  if (rateMap[ip].length >= RATE_LIMIT) return res.status(429).json({ error: 'Rate limit exceeded' });
  rateMap[ip].push(now);

  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const { messages, systemPrompt, maxTokens } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 1000,
      messages,
    };
    if (systemPrompt) body.system = systemPrompt;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });

    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    res.status(200).json({ text });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: err.message });
  }
}
