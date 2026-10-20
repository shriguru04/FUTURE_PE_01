import { CATEGORIES, TONES, GOALS, LANGUAGES, SECTION_IDS } from '../data/options.js';

export const LIMITS = {
  name: 80,
  location: 80,
  description: 600,
  services: 500,
  audience: 200,
  problem: 300,
  usp: 300,
  keywords: 150,
};

// Generated and typed text is always rendered as plain text by React, but we
// still strip markup so exports and prompts never carry HTML.
export function sanitizeText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function sanitizeProfile(profile = {}) {
  const out = { ...profile };
  for (const key of Object.keys(LIMITS)) {
    out[key] = sanitizeText(profile[key]).slice(0, LIMITS[key]);
  }
  out.category = sanitizeText(profile.category);
  out.tone = sanitizeText(profile.tone);
  out.goal = sanitizeText(profile.goal);
  out.language = sanitizeText(profile.language) || 'English';
  return out;
}

const has = (list, v) => list.some((o) => o.value === v);

// Returns { valid, errors } where errors is { field: message }.
export function validateProfile(raw = {}) {
  const p = sanitizeProfile(raw);
  const errors = {};
  const required = [
    ['name', 'Enter your business name.'],
    ['location', 'Enter the town or city you serve.'],
    ['description', 'Describe your business in a sentence or two.'],
    ['services', 'List at least one service or product.'],
    ['audience', 'Describe who your customers are.'],
  ];
  for (const [field, msg] of required) if (!p[field]) errors[field] = msg;

  if (!has(CATEGORIES, p.category)) errors.category = 'Choose a business category.';
  if (!has(TONES, p.tone)) errors.tone = 'Choose a brand tone.';
  if (!has(GOALS, p.goal)) errors.goal = 'Choose a primary conversion goal.';
  if (!has(LANGUAGES, p.language)) errors.language = 'Choose a supported language.';

  for (const [field, max] of Object.entries(LIMITS)) {
    if ((raw[field] ?? '').length > max && !errors[field]) {
      errors[field] = `Keep this under ${max} characters.`;
    }
  }
  if (p.description && p.description.length < 15) {
    errors.description = 'Add a little more detail (at least 15 characters).';
  }
  return { valid: Object.keys(errors).length === 0, errors, profile: p };
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isStrArr = (v) => Array.isArray(v) && v.length > 0 && v.every(isStr);

const SHAPES = {
  homepage: {
    heroHeadline: isStr, subheadline: isStr, primaryCta: isStr, secondaryCta: isStr,
    valueProposition: isStr, keyBenefits: isStrArr, sectionHeadings: isStrArr,
  },
  about: { introduction: isStr, mission: isStr, differentiators: isStrArr, customerMessage: isStr },
  services: {
    services: (v) =>
      Array.isArray(v) && v.length > 0 &&
      v.every((s) => s && isStr(s.name) && isStr(s.description) && isStr(s.benefit) && isStr(s.cta)),
  },
  cta: { primary: isStr, secondary: isStr, contact: isStr, booking: isStr, enquiry: isStr },
  contact: { heading: isStr, supportingText: isStr, formLabels: isStrArr, buttonText: isStr },
};

export function validateSectionContent(section, content) {
  if (!SECTION_IDS.includes(section)) return { valid: false, problems: [`Unknown section "${section}".`] };
  if (!content || typeof content !== 'object') return { valid: false, problems: ['Response was empty or not an object.'] };
  const problems = [];
  for (const [key, check] of Object.entries(SHAPES[section])) {
    if (!check(content[key])) problems.push(`Missing or invalid field: ${key}`);
  }
  return { valid: problems.length === 0, problems };
}

// Keep only known keys and sanitize every string, so unexpected model output
// cannot add fields or markup to the workspace.
export function normalizeSectionContent(section, content) {
  const clean = (v) =>
    typeof v === 'string' ? sanitizeText(v)
      : Array.isArray(v) ? v.map(clean)
      : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
      : v;
  const out = {};
  for (const key of Object.keys(SHAPES[section])) out[key] = clean(content[key]);
  return out;
}
