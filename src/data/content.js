import { Store, SlidersHorizontal, LayoutTemplate, ListChecks, MousePointerClick, PencilLine, Terminal, Download, HardDrive, FlaskConical, ShieldCheck, Eye, Lock } from 'lucide-react';

export const FEATURES = [
  { icon: Store, title: 'Business-specific generation', text: 'Wording, benefits, headings and form labels change across nine business categories, so a cafe never reads like a clinic.' },
  { icon: SlidersHorizontal, title: 'Brand tone adaptation', text: 'Seven tones, from professional to energetic, change headlines, calls to action and sentence rhythm.' },
  { icon: LayoutTemplate, title: 'Homepage copy', text: 'Hero headline, subheadline, two calls to action, a value proposition, key benefits and suggested section headings.' },
  { icon: ListChecks, title: 'Service descriptions', text: 'Each service you list gets a description, a customer benefit and its own call to action.' },
  { icon: MousePointerClick, title: 'Goal-matched calls to action', text: 'Primary, secondary, contact, booking and enquiry CTAs follow your conversion goal and tone.' },
  { icon: PencilLine, title: 'Editable outputs', text: 'Click any line to rewrite it. Regenerating one section never overwrites the others.' },
  { icon: Terminal, title: 'Reusable prompts', text: 'See the exact structured prompt built from your inputs for each section, and copy it for use anywhere.' },
  { icon: Download, title: 'Copy and export', text: 'Copy a section or everything, or download plain text or Markdown.' },
  { icon: HardDrive, title: 'Local draft storage', text: 'Save and restore drafts in your browser. No account, no upload.' },
  { icon: FlaskConical, title: 'Demo mode', text: 'Works offline with built-in templates and is always labelled as demo output. Real AI is an optional, server-side add-on.' },
];

export const BENEFITS = [
  { icon: Store, title: 'Written for your kind of business', text: 'Category-specific language, not one paragraph with the name swapped.' },
  { icon: PencilLine, title: 'Yours to edit', text: 'Every generated line is editable before you copy or export it.' },
  { icon: Eye, title: 'Honest about its source', text: 'Demo output is labelled as demo output. It never pretends to be a model.' },
  { icon: Lock, title: 'Private by default', text: 'Demo mode sends nothing anywhere. Drafts live in your browser.' },
];

export const STEPS = [
  { title: 'Enter business information', text: 'Add your name, location, description, services, audience, the problem customers have and what sets you apart.' },
  { title: 'Select category and brand tone', text: 'Pick one of nine categories, one of seven tones and one conversion goal.' },
  { title: 'Build a structured prompt', text: 'Your inputs are sanitised and slotted into a role, context, requirements and output-format prompt, with a separate template for each section.' },
  { title: 'Generate the copy', text: 'The configured AI provider writes it through your server-side proxy, or the demo template engine assembles it offline.' },
  { title: 'Review and edit', text: 'Responses are validated for shape. You read, edit and regenerate any single section.' },
  { title: 'Copy, download or save', text: 'Copy a section, copy everything, download .txt or .md, or save a draft locally.' },
];

export const PIPELINE = ['Your inputs', 'Prompt builder', 'AI provider or demo engine', 'Validation', 'Editable workspace', 'Copy, export, save'];

export const FAQ = [
  { q: 'Does CopyCraft AI use a real AI model?', a: 'Only if you set one up. Demo mode, the default, assembles copy from built-in templates and your inputs, and says so on every result. AI mode sends your validated inputs to a small server you run, which holds the provider key.' },
  { q: 'Where is my data stored?', a: 'In your browser\u2019s local storage: the form, generated copy, drafts and theme. In demo mode nothing is sent to any server. There are no accounts.' },
  { q: 'Can I publish the copy as it is?', a: 'Treat it as a strong first draft. Check every statement is true for your business, especially benefits and anything that sounds like a claim.' },
  { q: 'Will this improve my search ranking or conversions?', a: 'There is no evidence on this site that it does, so it makes no such promise. It helps you produce clear, consistent copy faster.' },
  { q: 'Which languages are supported?', a: 'Demo mode writes English. Other languages need AI mode with a configured provider.' },
  { q: 'Is it safe for healthcare clinics?', a: 'Clinic prompts and templates avoid outcome promises and treatment claims, and clinic output carries a reminder to confirm wording with a qualified professional and check local advertising rules.' },
];

export const BEFORE_AFTER = [
  { templateId: 'salon', prompt: 'Write website copy for a salon.', before: 'Welcome to our salon! We offer a wide range of services at great prices. Our experienced team is the best in town. Contact us today!', issues: 'Generic, and invents experience, pricing and rankings.' },
  { templateId: 'gym', prompt: 'Write homepage text for a gym.', before: 'Transform your body and achieve your dream physique with our state-of-the-art equipment. Join today for guaranteed results!', issues: 'Promises results nobody can guarantee and ignores who the gym is for.' },
  { templateId: 'clinic', prompt: 'Write a homepage for a clinic.', before: 'Our expert doctors cure your problems quickly with the latest treatments. Book now for guaranteed relief!', issues: 'Makes medical claims and outcome promises.' },
];

export const PRINCIPLES = [
  { icon: ShieldCheck, text: 'No invented credentials, reviews, awards, prices or guarantees.' },
  { icon: Lock, text: 'Provider keys stay on the server, never in the browser bundle.' },
  { icon: Eye, text: 'Demo output is always labelled as demo output.' },
];
