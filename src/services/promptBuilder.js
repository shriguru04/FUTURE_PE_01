import { sanitizeProfile } from './validation.js';
import { CATEGORIES, TONES, GOALS } from '../data/options.js';

const label = (list, value) => list.find((o) => o.value === value)?.label ?? value;
const orNone = (v) => (v && v.trim() ? v : 'Not provided');

export const SECTION_SPECS = {
  homepage: {
    title: 'Homepage',
    task: 'Write the homepage copy: a hero headline, a supporting subheadline, a main and a secondary call to action, a short value proposition, 3-4 key benefits, and suggested section headings for the page.',
    schema: '{"heroHeadline": string, "subheadline": string, "primaryCta": string, "secondaryCta": string, "valueProposition": string, "keyBenefits": string[], "sectionHeadings": string[]}',
    extra: 'The headline must be under 12 words. The subheadline must be one or two sentences.',
  },
  about: {
    title: 'About Us',
    task: 'Write the About Us copy: a business introduction, a mission or purpose statement, 3 differentiators, and a short customer-focused closing message.',
    schema: '{"introduction": string, "mission": string, "differentiators": string[], "customerMessage": string}',
    extra: 'Only describe the business using facts supplied in the business context.',
  },
  services: {
    title: 'Services',
    task: 'Write one entry per listed service. Each entry has a service name, a short description, the customer benefit, and an optional call to action.',
    schema: '{"services": [{"name": string, "description": string, "benefit": string, "cta": string}]}',
    extra: 'Use only the services listed. Keep each description under 40 words.',
  },
  cta: {
    title: 'Calls to Action',
    task: 'Write five calls to action: primary, secondary, contact, booking and enquiry. Each must be a short button-style phrase.',
    schema: '{"primary": string, "secondary": string, "contact": string, "booking": string, "enquiry": string}',
    extra: 'Each call to action must be under 6 words and start with a verb. The primary call to action must match the conversion goal.',
  },
  contact: {
    title: 'Contact Section',
    task: 'Write the contact section: a heading, short supporting text, suggested form field labels, and the submit button text.',
    schema: '{"heading": string, "supportingText": string, "formLabels": string[], "buttonText": string}',
    extra: 'Do not invent phone numbers, addresses, opening hours or email addresses.',
  },
};

const OUTPUT_REQUIREMENTS = [
  'Use clear and natural language.',
  'Write for the specified target audience.',
  'Communicate genuine customer benefits.',
  'Use concise and persuasive headlines.',
  'Produce a clear value proposition.',
  'Create relevant calls to action.',
  'Adapt wording to the selected business category.',
  'Avoid unnecessary jargon.',
  'Avoid unsupported claims.',
  'Do not invent business credentials, reviews, awards, prices, or guarantees.',
  'Do not repeat the same content unnecessarily.',
  'Return content in a predictable, structured format.',
];

const HEALTHCARE_RULE =
  'Healthcare rule: do not promise outcomes, cures or results, do not make diagnostic or treatment claims, and do not imply medical advice. Describe care, access and information only.';

export function buildPrompt(rawProfile, section) {
  const spec = SECTION_SPECS[section];
  if (!spec) throw new Error(`Unknown section: ${section}`);
  const p = sanitizeProfile(rawProfile);
  const categoryLabel = label(CATEGORIES, p.category) || 'Local business';

  const lines = [
    'ROLE:',
    `Act as an experienced website copywriter specializing in ${categoryLabel.toLowerCase()} businesses.`,
    '',
    'BUSINESS CONTEXT:',
    `Business name: ${orNone(p.name)}`,
    `Category: ${categoryLabel}`,
    `Location: ${orNone(p.location)}`,
    `Description: ${orNone(p.description)}`,
    `Services: ${orNone(p.services)}`,
    `Target audience: ${orNone(p.audience)}`,
    `Customer problem: ${orNone(p.problem)}`,
    `Unique selling proposition: ${orNone(p.usp)}`,
    '',
    'WRITING REQUIREMENTS:',
    `Brand tone: ${label(TONES, p.tone)}`,
    `Language: ${p.language}`,
    `Conversion goal: ${label(GOALS, p.goal)}`,
    `Keywords: ${orNone(p.keywords)}`,
    '',
    `TASK (${spec.title}):`,
    spec.task,
    '',
    'OUTPUT REQUIREMENTS:',
    ...OUTPUT_REQUIREMENTS.map((r) => `* ${r}`),
    `* ${spec.extra}`,
  ];
  if (p.category === 'clinic') lines.push(`* ${HEALTHCARE_RULE}`);
  lines.push(
    '',
    'RESPONSE FORMAT:',
    `Return only valid JSON, with no markdown fences and no commentary, matching this shape: ${spec.schema}`,
    `Write all string values in ${p.language}.`,
  );
  return lines.join('\n');
}

export function buildAllPrompts(profile) {
  return Object.fromEntries(Object.keys(SECTION_SPECS).map((s) => [s, buildPrompt(profile, s)]));
}
