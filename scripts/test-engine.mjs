// Run: npm run test:engine   (plain Node, no dependencies)
import { generateWebsiteCopy, GenerationError } from '../src/services/contentGenerator.js';
import { buildPrompt } from '../src/services/promptBuilder.js';
import { validateProfile } from '../src/services/validation.js';
import { exportAll, sectionToText, safeFilename } from '../src/services/exportService.js';
import { CATEGORIES, TONES, GOALS, SECTION_IDS } from '../src/data/options.js';

let passed = 0, failed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log(`  ok   ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}\n       ${e.message}`); }
};
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

const base = {
  name: 'Glow Studio', category: 'salon', location: 'Pune',
  description: 'A neighbourhood salon offering hair and skin services for busy people.',
  services: 'Haircut, Colour, Facial', audience: 'Working professionals aged 25-40',
  problem: 'Hard to find time for appointments', usp: 'Evening and weekend appointments',
  tone: 'friendly', language: 'English', goal: 'appointments', keywords: 'hair salon',
};
const gen = (over = {}, section = 'homepage', extra = {}) =>
  generateWebsiteCopy({ businessProfile: { ...base, ...over }, section, ...extra });

console.log('Engine tests');

await test('every category x tone x section x goal produces valid content', async () => {
  let n = 0;
  for (const c of CATEGORIES) for (const t of TONES) for (const g of GOALS) for (const s of SECTION_IDS) {
    await gen({ category: c.value, tone: t.value, goal: g.value }, s); n++;
  }
  assert(n === 9 * 7 * 6 * 5, `ran ${n}`);
});

await test('cafe and clinic homepages differ', async () => {
  const a = (await gen({ category: 'cafe', name: 'Bean There' })).content;
  const b = (await gen({ category: 'clinic', name: 'Calm Clinic' })).content;
  assert(a.heroHeadline !== b.heroHeadline && a.valueProposition !== b.valueProposition);
  assert(JSON.stringify(a.keyBenefits) !== JSON.stringify(b.keyBenefits));
});

await test('changing tone changes the headline and CTA wording', async () => {
  const heads = new Set();
  for (const t of TONES) heads.add((await gen({ tone: t.value })).content.heroHeadline);
  assert(heads.size === TONES.length, `only ${heads.size} distinct headlines`);
});

await test('regenerating (variant) changes wording but not the section shape', async () => {
  const a = (await gen({}, 'homepage', { variant: 0 })).content;
  const b = (await gen({}, 'homepage', { variant: 1 })).content;
  assert(a.heroHeadline !== b.heroHeadline, 'headline should vary');
});

await test('services produce one entry per listed service', async () => {
  const { content } = await gen({}, 'services');
  assert(content.services.length === 3 && content.services[0].name === 'Haircut');
});

await test('empty form is rejected with field errors', async () => {
  try { await generateWebsiteCopy({ businessProfile: {}, section: 'homepage' }); assert(false, 'should throw'); }
  catch (e) { assert(e instanceof GenerationError && e.code === 'INVALID_INPUT' && e.fields.name && e.fields.category && e.fields.goal); }
});

await test('invalid category/tone/goal values are rejected', async () => {
  const r = validateProfile({ ...base, category: 'spaceship', tone: 'angry', goal: 'win' });
  assert(!r.valid && r.errors.category && r.errors.tone && r.errors.goal);
});

await test('over-length input is rejected', async () => {
  const r = validateProfile({ ...base, name: 'x'.repeat(200) });
  assert(!r.valid && r.errors.name);
});

await test('HTML in inputs is stripped from prompts and output', async () => {
  const { content, meta } = await gen({ name: 'Glow <script>alert(1)</script>Studio', usp: '<img src=x onerror=alert(1)>Late hours' });
  const all = JSON.stringify(content) + meta.prompt;
  assert(!/<script|<img|onerror=/i.test(all), 'markup leaked');
});

await test('AI mode without a proxy fails clearly and does not fall back to demo', async () => {
  try { await gen({}, 'homepage', { mode: 'ai', provider: 'openai' }); assert(false, 'should throw'); }
  catch (e) { assert(e.code === 'AI_NOT_CONFIGURED', e.code); }
});

await test('demo mode rejects non-English instead of faking it', async () => {
  try { await gen({ language: 'Hindi' }); assert(false, 'should throw'); }
  catch (e) { assert(e.code === 'LANGUAGE_UNSUPPORTED', e.code); }
});

await test('demo output is labelled as demo', async () => {
  const { meta } = await gen();
  assert(meta.mode === 'demo' && meta.provider === 'demo-templates' && /No AI model was used/.test(meta.notices[0]));
});

await test('no invented credentials, prices, guarantees or medical claims', async () => {
  const banned = /guarantee|award|certified|years of experience|best in|#1|cure|treat(s|ment)? (your|for)|\$\d|₹\d|% /i;
  for (const c of CATEGORIES) for (const t of TONES) for (const s of SECTION_IDS) {
    const text = JSON.stringify((await gen({ category: c.value, tone: t.value }, s)).content);
    const hit = text.match(banned);
    assert(!hit, `${c.value}/${t.value}/${s}: ${hit && hit[0]}`);
  }
});

await test('clinic output carries the healthcare notice', async () => {
  const { meta } = await gen({ category: 'clinic' });
  assert(meta.notices.some((n) => /Healthcare copy/.test(n)));
});

await test('prompt contains all required blocks and clinic safety rule', () => {
  const p = buildPrompt({ ...base, category: 'clinic' }, 'services');
  for (const k of ['ROLE:', 'BUSINESS CONTEXT:', 'WRITING REQUIREMENTS:', 'TASK', 'OUTPUT REQUIREMENTS:', 'Business name: Glow Studio', 'Healthcare rule'])
    assert(p.includes(k), `missing ${k}`);
  assert(!buildPrompt(base, 'services').includes('Healthcare rule'));
});

await test('each section builds a different prompt from the same inputs', () => {
  const set = new Set(SECTION_IDS.map((s) => buildPrompt(base, s)));
  assert(set.size === 5);
});

await test('prompt changes when inputs change', () => {
  assert(buildPrompt(base, 'homepage') !== buildPrompt({ ...base, tone: 'premium' }, 'homepage'));
});

await test('exports are non-empty, labelled, and cover generated sections only', async () => {
  const sections = {
    homepage: (await gen()).content,
    cta: (await gen({}, 'cta')).content,
  };
  const txt = exportAll({ businessName: 'Glow Studio', sections, format: 'txt' });
  const md = exportAll({ businessName: 'Glow Studio', sections, format: 'md' });
  assert(txt.includes('HOMEPAGE') && !txt.includes('SERVICES') && /no AI model/i.test(txt));
  assert(md.startsWith('# Glow Studio') && md.includes('## Calls to Action'));
  assert(sectionToText('cta', sections.cta).includes('Primary:'));
  assert(safeFilename('Glow Studio!!', 'md') === 'glow-studio-copy.md');
});

await test('long inputs do not break generation', async () => {
  const { content } = await gen({ name: 'A'.repeat(80), description: 'word '.repeat(120).trim(), services: Array.from({ length: 20 }, (_, i) => `Service ${i}`).join(', ') }, 'services');
  assert(content.services.length === 8, 'services capped at 8');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
