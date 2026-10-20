import { SECTION_IDS, LANGUAGES } from '../data/options.js';
import { buildPrompt } from './promptBuilder.js';
import { generateDemoSection, DEMO_NOTICE, CLINIC_NOTICE } from './demoEngine.js';
import { validateProfile, validateSectionContent, normalizeSectionContent } from './validation.js';

export class GenerationError extends Error {
  constructor(message, { code = 'GENERATION_FAILED', fields, hint } = {}) {
    super(message);
    this.name = 'GenerationError';
    this.code = code;
    this.fields = fields;
    this.hint = hint;
  }
}

// The proxy is YOUR server. It holds the provider key and forwards the prompt.
// Contract: POST { provider, section, profile } -> { text } or { content }.
// The server validates the profile again and builds the prompt itself (see server/proxy.mjs).
const proxyUrl = () => import.meta.env?.VITE_AI_PROXY_URL || '';

export function isAiConfigured() {
  return Boolean(proxyUrl());
}

function parseModelJson(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (!cleaned) throw new GenerationError('The AI provider returned an empty response.', { code: 'EMPTY_RESPONSE', hint: 'Try again, or switch to demo mode.' });
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new GenerationError('The AI response was not valid JSON.', { code: 'MALFORMED_RESPONSE', hint: 'Regenerate this section, or switch to demo mode.' });
  }
}

async function callProvider({ provider, section, profile, signal }) {
  const url = proxyUrl();
  if (!url) {
    throw new GenerationError('AI mode is not configured.', {
      code: 'AI_NOT_CONFIGURED',
      hint: 'Set VITE_AI_PROXY_URL to your backend proxy, or switch to demo mode.',
    });
  }
  let res;
  try {
    res = await fetch(url, {
      method: 'POST', signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, section, profile }),
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new GenerationError('Could not reach the AI service.', { code: 'NETWORK_ERROR', hint: 'Check your connection, or switch to demo mode.' });
  }
  if (!res.ok) {
    throw new GenerationError(`The AI service returned an error (${res.status}).`, { code: 'PROVIDER_ERROR', hint: 'Try again in a moment, or switch to demo mode.' });
  }
  const data = await res.json().catch(() => null);
  if (!data) throw new GenerationError('The AI service returned an unreadable response.', { code: 'MALFORMED_RESPONSE' });
  return data.content && typeof data.content === 'object' ? data.content : parseModelJson(data.text);
}

/**
 * generateWebsiteCopy({ businessProfile, section, provider, mode, variant })
 * Returns { section, content, meta }. Never mutates other sections.
 * mode 'demo' = offline templates. mode 'ai' = backend proxy; it never silently
 * falls back to demo, so demo copy is never presented as AI copy.
 */
export async function generateWebsiteCopy({ businessProfile, section, provider = 'demo', mode = 'demo', variant = 0, signal } = {}) {
  if (!SECTION_IDS.includes(section)) {
    throw new GenerationError(`Unknown section "${section}".`, { code: 'INVALID_SECTION' });
  }
  const { valid, errors, profile } = validateProfile(businessProfile);
  if (!valid) {
    throw new GenerationError('Some business details are missing or invalid.', { code: 'INVALID_INPUT', fields: errors, hint: 'Fix the highlighted fields and try again.' });
  }

  const prompt = buildPrompt(profile, section);
  const meta = { section, mode, provider: mode === 'demo' ? 'demo-templates' : provider, generatedAt: new Date().toISOString(), prompt, notices: [] };

  let raw;
  if (mode === 'demo') {
    const lang = LANGUAGES.find((l) => l.value === profile.language);
    if (lang && !lang.demoSupported) {
      throw new GenerationError(`Demo mode only writes English, not ${profile.language}.`, { code: 'LANGUAGE_UNSUPPORTED', fields: { language: 'Demo mode supports English only.' }, hint: 'Choose English, or configure AI mode.' });
    }
    raw = generateDemoSection(profile, section, variant);
    meta.notices.push(DEMO_NOTICE);
  } else if (mode === 'ai') {
    raw = await callProvider({ provider, section, profile, signal });
  } else {
    throw new GenerationError(`Unknown mode "${mode}".`, { code: 'INVALID_MODE' });
  }
  if (profile.category === 'clinic') meta.notices.push(CLINIC_NOTICE);

  const check = validateSectionContent(section, raw);
  if (!check.valid) {
    throw new GenerationError('The generated content was incomplete.', { code: 'MALFORMED_RESPONSE', hint: `${check.problems.join('; ')}. Try regenerating.` });
  }
  return { section, content: normalizeSectionContent(section, raw), meta };
}
