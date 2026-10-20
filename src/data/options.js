export const CATEGORIES = [
  { value: 'salon', label: 'Salon' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'agency', label: 'Agency' },
  { value: 'gym', label: 'Gym' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'premium', label: 'Premium' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'trustworthy', label: 'Trustworthy' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'minimalist', label: 'Minimalist' },
];

export const GOALS = [
  { value: 'enquiries', label: 'Generate enquiries' },
  { value: 'appointments', label: 'Book appointments' },
  { value: 'calls', label: 'Receive phone calls' },
  { value: 'sales', label: 'Sell products' },
  { value: 'leads', label: 'Collect leads' },
  { value: 'visits', label: 'Encourage visits' },
];

// demoSupported: the offline template engine only writes English.
export const LANGUAGES = [
  { value: 'English', demoSupported: true },
  { value: 'Hindi', demoSupported: false },
  { value: 'Marathi', demoSupported: false },
  { value: 'Spanish', demoSupported: false },
  { value: 'French', demoSupported: false },
  { value: 'German', demoSupported: false },
];

export const SECTIONS = [
  { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Services' },
  { id: 'cta', label: 'Calls to Action' },
  { id: 'contact', label: 'Contact Section' },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

export const EMPTY_PROFILE = {
  name: '',
  category: '',
  location: '',
  description: '',
  services: '',
  audience: '',
  problem: '',
  usp: '',
  tone: 'professional',
  language: 'English',
  goal: '',
  keywords: '',
};
