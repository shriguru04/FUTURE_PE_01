// Optional AI proxy. Run: npm run server   (Node 20.6+; reads .env via --env-file)
// The provider key lives ONLY in this process's environment. The browser sends a validated
// business profile; this server rebuilds the prompt itself, so clients cannot send arbitrary prompts.
import http from 'node:http';
import { validateProfile } from '../src/services/validation.js';
import { buildPrompt } from '../src/services/promptBuilder.js';
import { SECTION_IDS } from '../src/data/options.js';

const PORT = Number(process.env.PORT || 8787);
const MAX_BODY = 20_000;
const RATE_LIMIT = 20; // requests per minute per IP
const hits = new Map();

const PROVIDERS = {
  anthropic: {
    key: () => process.env.ANTHROPIC_API_KEY,
    call: async (prompt, key) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: AbortSignal.timeout(30_000),
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
          max_tokens: 1500,
          system: 'You are a website copywriter. Reply with valid JSON only.',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}`);
      const data = await res.json();
      return data.content?.[0]?.text ?? '';
    },
  },
  openai: {
    key: () => process.env.OPENAI_API_KEY,
    call: async (prompt, key) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(30_000),
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a website copywriter. Reply with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? '';
    },
  },
};

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};

const limited = (ip) => {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > RATE_LIMIT;
};

const readBody = (req) => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  req.on('error', reject);
});

http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/generate') return send(res, 404, { error: 'Not found' });
  if (limited(req.socket.remoteAddress || 'unknown')) return send(res, 429, { error: 'Too many requests' });

  let body;
  try { body = JSON.parse(await readBody(req)); } catch { return send(res, 400, { error: 'Invalid request body' }); }

  const { provider, section, profile } = body || {};
  const p = PROVIDERS[provider];
  if (!p) return send(res, 400, { error: 'Unknown provider' });
  if (!SECTION_IDS.includes(section)) return send(res, 400, { error: 'Unknown section' });
  const check = validateProfile(profile);
  if (!check.valid) return send(res, 400, { error: 'Invalid profile', fields: check.errors });
  const key = p.key();
  if (!key) return send(res, 503, { error: `${provider} is not configured on the server` });

  try {
    const text = await p.call(buildPrompt(check.profile, section), key);
    return send(res, 200, { text });
  } catch (err) {
    console.error('[proxy]', err.message); // details stay server-side
    return send(res, 502, { error: 'Provider request failed' });
  }
}).listen(PORT, () => console.log(`CopyCraft proxy listening on http://localhost:${PORT}`));
