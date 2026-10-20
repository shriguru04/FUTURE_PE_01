// Offline template engine. No network, no AI model. Output is composed from
// category data x tone frames x the user's own inputs.
import { sanitizeProfile } from './validation.js';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const stripEnd = (s) => s.replace(/[\s.!?,;:]+$/, '');
const pick = (arr, n) => arr[Math.abs(n) % arr.length];

export function parseList(text, max = 8) {
  const seen = new Set();
  return String(text || '')
    .split(/[\n,;•]+/)
    .map((s) => s.replace(/^[\s\-*\d.)]+/, '').trim())
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))
    .slice(0, max);
}

const firstSentences = (text, maxLen = 220) => {
  const t = String(text || '').trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '));
  return end > 60 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}...`;
};

/* ---------- Category data ---------- */
const CATEGORY = {
  salon: {
    place: 'salon', what: 'hair and beauty care', outcome: 'you leave feeling like yourself',
    verb: 'Refresh your look', promise: 'appointments planned around what you want',
    benefits: ['A consultation before every service', 'Appointments planned around your preferences', 'A relaxed space to unwind', 'Advice you can use at home'],
    lines: [(n) => `${n}, planned around your preferences and your routine.`, (n) => `${n} with time to talk through the details first.`, (n) => `${n} tailored to you rather than a fixed menu.`],
    serviceBenefits: ['So you know how to look after it at home.', 'So the result suits your day-to-day life.', 'So you feel comfortable at every step.'],
    differentiators: ['Appointments start with a conversation about what you want', 'A calm, welcoming space', 'Advice on looking after your look between visits'],
    mission: 'to make looking after yourself feel easy, comfortable, and personal',
    headings: ['Our Services', 'Why Clients Choose Us', 'Your First Visit', 'Book an Appointment', 'Find Us'],
    labels: ['Your name', 'Phone number', 'Service you are interested in', 'Preferred day and time', 'Anything we should know?'],
    secondary: 'View Our Services', booking: 'Book Your Appointment', enquiry: 'Ask About a Service', noun: 'clients',
  },
  cafe: {
    place: 'cafe', what: 'coffee, food and a place to sit', outcome: 'every visit feels like a small break',
    verb: 'Pull up a chair', promise: 'a welcoming table and something good to eat',
    benefits: ['A welcoming place to meet, work or unwind', 'Food and drink made with care', 'A menu with something for different tastes', 'Easy to drop in, easy to linger'],
    lines: [(n) => `${n}, made with care and served without fuss.`, (n) => `${n} for slow mornings, quick breaks and everything between.`, (n) => `${n} that is easy to enjoy with company or alone.`],
    serviceBenefits: ['A good reason to stop by.', 'Something to look forward to in your day.', 'Easy to share, easy to enjoy.'],
    differentiators: ['A relaxed atmosphere for any time of day', 'A menu planned around what our guests enjoy', 'A neighbourhood spot you can make your own'],
    mission: 'to give our neighbourhood a warm place to slow down',
    headings: ['From the Menu', 'Our Story', 'Visit Us', 'Plan a Gathering', 'Find Us'],
    labels: ['Your name', 'Phone number', 'Date and time', 'Number of guests', 'Anything we should know?'],
    secondary: 'See the Menu', booking: 'Reserve a Table', enquiry: 'Ask About Events', noun: 'guests',
  },
  clinic: {
    place: 'clinic', what: 'clear, respectful healthcare', outcome: 'you feel informed and looked after',
    verb: 'Take the next step', promise: 'clear information and respectful care',
    benefits: ['Clear explanations before and after your appointment', 'Appointments that respect your time', 'A respectful, welcoming environment', 'Care planned with you, not for you'],
    lines: [(n) => `${n}, with clear information about what to expect.`, (n) => `${n} explained in plain language.`, (n) => `${n}, with time set aside for your questions.`],
    serviceBenefits: ['So you know what to expect before you arrive.', 'So you can ask questions and make informed decisions.', 'So you feel supported throughout.'],
    differentiators: ['Plain-language explanations at every step', 'Time set aside for your questions', 'A respectful, welcoming environment'],
    mission: 'to make quality care easier to understand and easier to reach',
    headings: ['Our Services', 'What to Expect', 'Our Approach', 'Request an Appointment', 'Contact the Clinic'],
    labels: ['Full name', 'Phone number', 'Reason for your visit (brief)', 'Preferred day and time', 'Please do not include sensitive medical details here'],
    secondary: 'View Our Services', booking: 'Request an Appointment', enquiry: 'Ask a Question', noun: 'patients',
  },
  agency: {
    place: 'agency', what: 'marketing that is built around your goals', outcome: 'your marketing has a clear purpose',
    verb: 'Grow with a plan', promise: 'a clear plan and clear reporting',
    benefits: ['A plan tied to your business goals', 'Clear communication and regular updates', 'Work shaped around your audience', 'One team to coordinate your channels'],
    lines: [(n) => `${n}, planned around your goals and your audience.`, (n) => `${n} with clear steps and clear reporting.`, (n) => `${n} that fits the size of your business.`],
    serviceBenefits: ['So you can see what the work is for.', 'So your budget goes where it matters.', 'So you always know where things stand.'],
    differentiators: ['Strategy before tactics', 'Plain-English reporting', 'Work scoped to your business'],
    mission: 'to help local businesses be found and chosen with clear, honest marketing',
    headings: ['What We Do', 'How We Work', 'Our Approach', 'Start a Conversation', 'Contact Us'],
    labels: ['Your name', 'Business name', 'Email address', 'What would you like help with?', 'Rough timeline'],
    secondary: 'See How We Work', booking: 'Book a Strategy Call', enquiry: 'Request a Proposal', noun: 'clients',
  },
  gym: {
    place: 'gym', what: 'training that fits your life', outcome: 'showing up feels doable',
    verb: 'Start moving', promise: 'a place to train at your own level',
    benefits: ['A welcoming space for different fitness levels', 'Support to help you build a routine', 'Training options to suit your goals', 'A community that keeps you showing up'],
    lines: [(n) => `${n}, set at a level that suits you.`, (n) => `${n} with support to keep you consistent.`, (n) => `${n}, whether you are starting out or returning.`],
    serviceBenefits: ['So you can build a routine you can keep.', 'So you feel supported, not judged.', 'So progress feels clear and manageable.'],
    differentiators: ['A welcoming environment for every level', 'Support to build a routine that lasts', 'Training options for different goals'],
    mission: 'to make regular training feel welcoming and achievable',
    headings: ['Train With Us', 'What We Offer', 'Your First Session', 'Visit the Gym', 'Contact Us'],
    labels: ['Your name', 'Phone number', 'Your main goal', 'Experience level', 'Preferred time to visit'],
    secondary: 'See What We Offer', booking: 'Book a Visit', enquiry: 'Ask About Membership', noun: 'members',
  },
  retail: {
    place: 'store', what: 'products picked with care', outcome: 'finding the right thing feels simple',
    verb: 'Find something you will love', promise: 'a carefully chosen range and friendly help',
    benefits: ['A range chosen with our customers in mind', 'Friendly help when you want it', 'Easy to browse in store or online', 'Straightforward information about every product'],
    lines: [(n) => `${n}, chosen with our customers in mind.`, (n) => `${n} with help on hand when you want it.`, (n) => `${n} that is easy to browse and easy to buy.`],
    serviceBenefits: ['So choosing feels easier.', 'So you find what suits your needs.', 'So you can buy with confidence.'],
    differentiators: ['A range selected for local customers', 'Helpful, no-pressure service', 'Clear product information'],
    mission: 'to help our customers find the right products without the hassle',
    headings: ['Shop the Range', 'Why Shop With Us', 'New In Store', 'Visit the Store', 'Contact Us'],
    labels: ['Your name', 'Phone number', 'Product you are asking about', 'Your question'],
    secondary: 'Browse the Range', booking: 'Visit the Store', enquiry: 'Ask About a Product', noun: 'customers',
  },
  education: {
    place: 'institute', what: 'learning with clear structure', outcome: 'learners know what to do next',
    verb: 'Start learning', promise: 'a clear path and supportive teaching',
    benefits: ['Courses with a clear structure', 'Support from teachers who know your goals', 'Learning plans matched to your level', 'Regular feedback so you know where you stand'],
    lines: [(n) => `${n}, organised into clear steps.`, (n) => `${n} with support when you need it.`, (n) => `${n} matched to where you are today.`],
    serviceBenefits: ['So you always know what comes next.', 'So you can learn at a steady pace.', 'So you can ask questions and keep going.'],
    differentiators: ['A clear learning path', 'Teachers who track your progress', 'Support for different levels'],
    mission: 'to make learning clearer, steadier and easier to stay with',
    headings: ['Our Courses', 'How Learning Works', 'Who We Teach', 'Talk to Us', 'Contact the Institute'],
    labels: ['Student name', 'Parent or guardian name (if applicable)', 'Phone number', 'Course you are interested in', 'Current level'],
    secondary: 'Explore Courses', booking: 'Book a Counselling Session', enquiry: 'Ask About Courses', noun: 'students',
  },
  consulting: {
    place: 'practice', what: 'practical advice you can act on', outcome: 'decisions feel clearer',
    verb: 'Get clear on your next move', promise: 'advice you can act on',
    benefits: ['Advice shaped to your situation', 'Clear recommendations, not jargon', 'A straightforward way of working together', 'Support from first conversation to next step'],
    lines: [(n) => `${n}, shaped around your situation.`, (n) => `${n} with clear, practical recommendations.`, (n) => `${n} explained without jargon.`],
    serviceBenefits: ['So you know what to do next.', 'So decisions feel clearer.', 'So the advice fits your circumstances.'],
    differentiators: ['Advice tailored to the client', 'Plain-language recommendations', 'A clear process from start to finish'],
    mission: 'to give clients clear, practical advice they can act on',
    headings: ['How I Can Help', 'How We Work Together', 'About the Practice', 'Start a Conversation', 'Contact'],
    labels: ['Your name', 'Email address', 'Company or organisation', 'What would you like help with?', 'Ideal timeline'],
    secondary: 'See How I Can Help', booking: 'Book an Introductory Call', enquiry: 'Describe Your Project', noun: 'clients',
  },
  other: {
    place: 'business', what: 'dependable local service', outcome: 'working with us feels easy',
    verb: 'Get started', promise: 'a clear, dependable service',
    benefits: ['A clear explanation of what we offer', 'Service shaped around your needs', 'Easy to contact and easy to work with', 'Communication you can follow'],
    lines: [(n) => `${n}, explained clearly.`, (n) => `${n} shaped around your needs.`, (n) => `${n}, with straightforward communication.`],
    serviceBenefits: ['So you know what to expect.', 'So it fits your needs.', 'So the process feels simple.'],
    differentiators: ['Clear information up front', 'Service shaped to your needs', 'Easy to reach'],
    mission: 'to make good service simple to find and easy to use',
    headings: ['What We Offer', 'Why Choose Us', 'How It Works', 'Get in Touch', 'Contact Us'],
    labels: ['Your name', 'Phone number', 'Email address', 'How can we help?'],
    secondary: 'See What We Offer', booking: 'Book Now', enquiry: 'Send an Enquiry', noun: 'customers',
  },
};

/* ---------- Tone data ---------- */
const GOAL_CTAS = {
  enquiries: { default: 'Send an Enquiry', premium: 'Begin an Enquiry', friendly: 'Say Hello', energetic: "Let's Talk", minimalist: 'Enquire', conversational: 'Ask Us Anything', trustworthy: 'Speak With Our Team' },
  appointments: { default: 'Book an Appointment', premium: 'Reserve Your Appointment', friendly: 'Book Your Visit', energetic: 'Book Your Spot', minimalist: 'Book', conversational: 'Pick a Time', trustworthy: 'Schedule an Appointment' },
  calls: { default: 'Call Us Today', premium: 'Speak With Us', friendly: 'Give Us a Call', energetic: 'Call Now', minimalist: 'Call', conversational: 'Give Us a Ring', trustworthy: 'Call Our Team' },
  sales: { default: 'Shop Now', premium: 'Explore the Collection', friendly: 'Start Shopping', energetic: 'Shop Now', minimalist: 'Shop', conversational: 'Take a Look', trustworthy: 'Browse Our Range' },
  leads: { default: 'Get Started', premium: 'Request Your Consultation', friendly: "Let's Get Started", energetic: 'Get Started', minimalist: 'Get in Touch', conversational: 'Tell Us What You Need', trustworthy: 'Request Details' },
  visits: { default: 'Plan Your Visit', premium: 'Visit Us', friendly: 'Come and Say Hi', energetic: 'Come On In', minimalist: 'Visit', conversational: 'Drop By', trustworthy: 'Find Us' },
};

const goalCta = (goal, tone) => (GOAL_CTAS[goal] || GOAL_CTAS.enquiries)[tone] || (GOAL_CTAS[goal] || GOAL_CTAS.enquiries).default;
const decorate = (tone, s) => (tone === 'energetic' && !/[.!?]$/.test(s) ? `${s}!` : s);

// Each frame receives { n: name, L: " in Location" | "", c: category data, p: profile }
const HEADLINES = {
  professional: [({ n, L, c }) => `${n}: ${c.what}${L}`, ({ n, L, c }) => `${cap(c.what)}${L}, built around your needs`],
  friendly: [({ n, c }) => `Welcome to ${n}, where ${c.outcome}`, ({ n, c }) => `Hello from ${n}: ${c.what}, made personal`],
  premium: [({ c }) => `${cap(c.what)}, considered in every detail`, ({ n, c }) => `${n}. ${cap(c.what)}, thoughtfully delivered`],
  conversational: [({ n, L, c }) => `Looking for ${c.what}${L}? ${n} is here to help`, ({ n, c }) => `Let's talk ${c.what} with ${n}`],
  trustworthy: [({ L, c }) => `${cap(c.what)}${L} you can rely on`, ({ n, c }) => `${n}: ${c.promise}`],
  energetic: [({ n, c }) => `${c.verb} with ${n}!`, ({ n, L }) => `Meet ${n}${L}: let's get going!`],
  minimalist: [({ n, L, c }) => `${n}. ${cap(c.what)}${L}.`, ({ c }) => `${cap(c.what)}. Done well.`],
};

const SUBHEADS = {
  professional: [({ n, c, aud, prob, usp }) => `${n} provides ${c.what} for ${aud}${prob ? `. We understand the challenge: ${lowerFirst(prob)}` : ''}${usp ? `. ${cap(usp)}` : ''}.`],
  friendly: [({ n, aud, prob, usp }) => `${n} is here for ${aud}.${prob ? ` We know the frustration: ${lowerFirst(prob)}.` : ''}${usp ? ` ${cap(usp)}.` : ''}`],
  premium: [({ aud, usp, c }) => `For ${aud} who expect more.${usp ? ` ${cap(usp)}.` : ` ${cap(c.promise)}.`}`],
  conversational: [({ aud, prob, usp }) => `${prob ? `Sound familiar? ${cap(prob)}. ` : ''}We work with ${aud}${usp ? ` and here is what sets us apart: ${lowerFirst(usp)}` : ''}.`],
  trustworthy: [({ n, aud, prob, usp, c }) => `${n} serves ${aud} with ${c.promise}.${prob ? ` We know the frustration: ${lowerFirst(prob)}.` : ''}${usp ? ` ${cap(usp)}.` : ''}`],
  energetic: [({ aud, usp, c }) => `Made for ${aud}. ${usp ? `${cap(usp)}.` : `${cap(c.promise)}.`} Let's make it happen!`],
  minimalist: [({ aud, usp }) => `For ${aud}.${usp ? ` ${cap(usp)}.` : ''}`],
};

const VALUE_PROPS = {
  professional: (c, n, aud) => `${n} brings together ${c.promise} for ${aud}, with a straightforward approach from first contact to follow-up.`,
  friendly: (c, n, aud) => `At ${n}, we want ${aud} to feel at ease. That means ${c.promise}, and people who are glad you came in.`,
  premium: (c, n, aud) => `${n} offers ${c.promise}, shaped for ${aud} who value attention to detail.`,
  conversational: (c, n, aud) => `Here is what we offer ${aud}: ${c.promise}. No fuss, no jargon.`,
  trustworthy: (c, n, aud) => `${n} is focused on ${c.promise} for ${aud}. We explain what we do and what to expect, so you can decide with confidence.`,
  energetic: (c, n, aud) => `${n} is all about ${c.promise} for ${aud}. Ready when you are!`,
  minimalist: (c, n, aud) => `${cap(c.promise)}. For ${aud}.`,
};

const CONTACT_HEADINGS = {
  professional: ['Contact Us', 'Get in Touch'], friendly: ['Say Hello', 'We would love to hear from you'],
  premium: ['Arrange a Conversation', 'Begin Here'], conversational: ['Got a question?', 'Let us know what you need'],
  trustworthy: ['Speak With Our Team', 'Contact Us'], energetic: ["Let's Talk!", 'Get in Touch Today!'], minimalist: ['Contact', 'Get in touch'],
};

const CONTACT_TEXT = {
  appointments: (n, L) => `Tell us what you need and when suits you, and the team at ${n}${L} will follow up to confirm.`,
  enquiries: (n, L) => `Send your question to ${n}${L} and we will reply as soon as we can.`,
  calls: (n, L) => `Prefer to talk it through? Call ${n}${L}, or leave your number and we will call you back.`,
  sales: (n) => `Questions about a product? Message ${n} and we will help you choose.`,
  leads: (n) => `Share a few details and ${n} will get back to you with the next steps.`,
  visits: (n, L) => `Planning a visit to ${n}${L}? Let us know and we will help you plan.`,
};

const BUTTONS = { appointments: 'Request Appointment', enquiries: 'Send Enquiry', calls: 'Request a Call Back', sales: 'Send Message', leads: 'Submit Details', visits: 'Send Message' };

const SERVICE_CTA = {
  appointments: (s) => `Book ${s}`, enquiries: (s) => `Ask About ${s}`, calls: (s) => `Call About ${s}`,
  sales: (s) => `Shop ${s}`, leads: (s) => `Get Details on ${s}`, visits: (s) => `Visit for ${s}`,
};

const TONE_CLOSERS = {
  professional: '', friendly: ' Come in and see for yourself.', premium: ' Unhurried and attentive.',
  conversational: ' Ask us anything.', trustworthy: ' Questions are always welcome.', energetic: ' Let us show you!', minimalist: '',
};

/* ---------- Section generators ---------- */
function context(rawProfile, variant) {
  const p = sanitizeProfile(rawProfile);
  const c = CATEGORY[p.category] || CATEGORY.other;
  const tone = HEADLINES[p.tone] ? p.tone : 'professional';
  return {
    p, c, tone, variant,
    n: p.name,
    L: p.location ? ` in ${p.location}` : '',
    aud: lowerFirst(stripEnd(p.audience)),
    prob: stripEnd(p.problem),
    usp: stripEnd(p.usp),
    kws: parseList(p.keywords, 3),
  };
}

const GENERATORS = {
  homepage(x) {
    const { c, tone, variant, p } = x;
    const frame = { n: x.n, L: x.L, c, p, aud: x.aud, prob: x.prob, usp: x.usp };
    const subhead = pick(SUBHEADS[tone], variant)(frame);
    let valueProposition = VALUE_PROPS[tone](c, x.n, x.aud);
    if (x.kws.length) valueProposition += ` Looking for ${x.kws[0]}${x.L}? You are in the right place.`;
    const headings = [...c.headings];
    if (x.kws[0]) headings[0] = `${cap(x.kws[0])}${x.L}`;
    return {
      heroHeadline: decorate(tone, pick(HEADLINES[tone], variant)(frame)).replace(/!{2,}/g, '!'),
      subheadline: subhead.replace(/\.\./g, '.'),
      primaryCta: decorate(tone, goalCta(p.goal, tone)),
      secondaryCta: decorate(tone, c.secondary),
      valueProposition,
      keyBenefits: c.benefits,
      sectionHeadings: headings,
    };
  },

  about(x) {
    const { c, tone, p } = x;
    const desc = firstSentences(p.description);
    const intro = {
      professional: `${x.n} is a ${c.place}${x.L} serving ${x.aud}. ${desc}`,
      friendly: `Welcome! ${x.n} is a ${c.place}${x.L}, and we are glad you are here. ${desc}`,
      premium: `${x.n} is a ${c.place}${x.L} for ${x.aud}. ${desc}`,
      conversational: `So, who are we? ${x.n} is a ${c.place}${x.L}. ${desc}`,
      trustworthy: `${x.n} is a ${c.place}${x.L} serving ${x.aud}. ${desc}`,
      energetic: `${x.n} is a ${c.place}${x.L}, and we love what we do! ${desc}`,
      minimalist: `${x.n}. A ${c.place}${x.L}. ${desc}`,
    }[tone];
    const differentiators = [...(x.usp ? [cap(x.usp)] : []), ...c.differentiators].slice(0, 3);
    const customerMessage = {
      professional: `If you are one of the ${c.noun} we hope to serve, we would be glad to hear from you.`,
      friendly: `We would love to meet you. Get in touch whenever you are ready.`,
      premium: `We look forward to welcoming you.`,
      conversational: `Have a question before you decide? Just ask. We are happy to help.`,
      trustworthy: `We are happy to answer your questions before you decide.`,
      energetic: `Ready to get going? We are ready when you are!`,
      minimalist: `Get in touch.`,
    }[tone];
    return { introduction: intro, mission: `Our mission is ${c.mission}.`, differentiators, customerMessage };
  },

  services(x) {
    const { c, tone, p } = x;
    const list = parseList(p.services);
    const makeCta = SERVICE_CTA[p.goal] || SERVICE_CTA.enquiries;
    return {
      services: list.map((raw, i) => {
        const name = cap(raw);
        return {
          name,
          description: `${c.lines[(i + x.variant) % c.lines.length](name)}${TONE_CLOSERS[tone]}`,
          benefit: c.serviceBenefits[(i + x.variant) % c.serviceBenefits.length],
          cta: decorate(tone, makeCta(name)),
        };
      }),
    };
  },

  cta(x) {
    const { c, tone, p } = x;
    return {
      primary: decorate(tone, goalCta(p.goal, tone)),
      secondary: decorate(tone, c.secondary),
      contact: decorate(tone, goalCta('enquiries', tone) === goalCta(p.goal, tone) ? 'Get in Touch' : goalCta('enquiries', tone)),
      booking: decorate(tone, c.booking),
      enquiry: decorate(tone, c.enquiry),
    };
  },

  contact(x) {
    const { c, tone, p, variant } = x;
    const text = (CONTACT_TEXT[p.goal] || CONTACT_TEXT.enquiries)(x.n, x.L);
    return {
      heading: pick(CONTACT_HEADINGS[tone], variant),
      supportingText: text,
      formLabels: c.labels,
      buttonText: decorate(tone, BUTTONS[p.goal] || 'Send Message'),
    };
  },
};

export function generateDemoSection(profile, section, variant = 0) {
  const gen = GENERATORS[section];
  if (!gen) throw new Error(`Unknown section: ${section}`);
  return gen(context(profile, variant));
}

export const DEMO_NOTICE =
  'Demo mode: this copy was assembled from built-in templates and your inputs. No AI model was used. Review every statement and edit it so it is true for your business before publishing.';
export const CLINIC_NOTICE =
  'Healthcare copy: confirm every statement with a qualified professional and check local advertising rules before publishing.';
