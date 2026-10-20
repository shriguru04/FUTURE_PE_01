import { useRef } from 'react';
import { AlertCircle, Loader2, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { CATEGORIES, GOALS, LANGUAGES, TONES } from '../data/options.js';
import { LIMITS, validateProfile } from '../services/validation.js';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates.js';
import { useToast } from '../context/ToastContext.jsx';

function Field({ name, label, required, hint, error, value, max, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`f-${name}`} className="label !mb-0">
          {label} <span className="font-normal text-muted">{required ? '(required)' : '(optional)'}</span>
        </label>
        {max && <span className="shrink-0 text-xs tabular-nums text-muted" aria-hidden="true">{value.length}/{max}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
      {hint && <p id={`f-${name}-hint`} className="hint !mt-1.5">{hint}</p>}
      {error && (
        <p id={`f-${name}-err`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default function GeneratorForm() {
  const { profile, fieldErrors, setField, setProfile, resetForm, generateAll, progress, mode } = useWorkspace();
  const toast = useToast();
  const formRef = useRef(null);
  const busy = Boolean(progress);

  const bind = (name, hasHint = true) => ({
    id: `f-${name}`,
    name,
    value: profile[name],
    maxLength: LIMITS[name],
    onChange: (e) => setField(name, e.target.value),
    'aria-invalid': fieldErrors[name] ? 'true' : undefined,
    'aria-describedby': [hasHint ? `f-${name}-hint` : null, fieldErrors[name] ? `f-${name}-err` : null].filter(Boolean).join(' ') || undefined,
  });

  const fieldProps = (name, label, required, hint) => ({
    name, label, required, hint, error: fieldErrors[name], value: profile[name], max: LIMITS[name],
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (validateProfile(profile).valid && window.matchMedia('(max-width: 1023px)').matches) {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    await generateAll();
    setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 60);
  };

  const loadExample = () => {
    const t = BUSINESS_TEMPLATES.find((x) => x.category === profile.category) || BUSINESS_TEMPLATES[0];
    setProfile(t.profile);
    toast.info(`Loaded the ${t.label} example. Edit any field.`);
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card space-y-5 p-5 sm:p-6" aria-labelledby="form-heading">
      <div>
        <h2 id="form-heading" className="text-display-md">Business details</h2>
        <p className="mt-1.5 text-sm text-muted">The more specific you are, the more specific the copy. Everything stays in your browser.</p>
      </div>

      <Field {...fieldProps('name', 'Business name', true, 'The name customers know you by.')}>
        <input {...bind('name')} className="field" autoComplete="organization" placeholder="e.g. Petal & Comb" aria-required="true" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field {...fieldProps('category', 'Business category', true, 'Sets the wording and structure.')}>
          <select {...bind('category')} maxLength={undefined} className="field" aria-required="true">
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field {...fieldProps('location', 'Location', true, 'Town, city or neighbourhood you serve.')}>
          <input {...bind('location')} className="field" autoComplete="off" placeholder="e.g. Koregaon Park, Pune" aria-required="true" />
        </Field>
      </div>

      <Field {...fieldProps('description', 'Business description', true, 'What you do and what makes the place feel like yours. Facts only; the generator will not add credentials you do not give it.')}>
        <textarea {...bind('description')} rows={3} className="field" placeholder="e.g. A small neighbourhood salon offering hair, skin and nail services in a relaxed space." aria-required="true" />
      </Field>

      <Field {...fieldProps('services', 'Services offered', true, 'Separate with commas or new lines. Up to 8 are used.')}>
        <textarea {...bind('services')} rows={3} className="field" placeholder="e.g. Haircut and styling, Hair colour, Facial, Manicure" aria-required="true" />
      </Field>

      <Field {...fieldProps('audience', 'Target audience', true, 'Who you most want to reach.')}>
        <input {...bind('audience')} className="field" autoComplete="off" placeholder="e.g. Working professionals who want reliable appointments" aria-required="true" />
      </Field>

      <Field {...fieldProps('problem', 'Main customer problem', false, 'The frustration your customers have before they find you.')}>
        <textarea {...bind('problem')} rows={2} className="field" placeholder="e.g. Hard to find a salon that fits around a busy schedule" />
      </Field>

      <Field {...fieldProps('usp', 'Unique selling proposition', false, 'One true thing that sets you apart. Do not include claims you cannot back up.')}>
        <textarea {...bind('usp')} rows={2} className="field" placeholder="e.g. Early-morning and evening appointments" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field {...fieldProps('tone', 'Brand tone', true, 'How the copy should sound.')}>
          <select {...bind('tone')} maxLength={undefined} className="field" aria-required="true">
            {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field {...fieldProps('goal', 'Primary conversion goal', true, 'The one action you want visitors to take.')}>
          <select {...bind('goal')} maxLength={undefined} className="field" aria-required="true">
            <option value="">Choose a goal</option>
            {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </Field>
      </div>

      <Field {...fieldProps('language', 'Preferred language', true, mode === 'demo' ? 'Demo mode writes English only. Other languages need AI mode.' : 'Language the copy is written in.')}>
        <select {...bind('language')} maxLength={undefined} className="field" aria-required="true">
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value} disabled={mode === 'demo' && !l.demoSupported}>
              {l.value}{mode === 'demo' && !l.demoSupported ? ' (AI mode only)' : ''}
            </option>
          ))}
        </select>
      </Field>

      <Field {...fieldProps('keywords', 'Keywords', false, 'Up to three phrases customers might search, separated by commas.')}>
        <input {...bind('keywords')} className="field" autoComplete="off" placeholder="e.g. hair salon, bridal makeup" />
      </Field>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
          {busy ? 'Generating...' : 'Generate all sections'}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-secondary" onClick={loadExample} disabled={busy}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />Load example
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={busy}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />Reset form
          </button>
        </div>
      </div>
    </form>
  );
}
