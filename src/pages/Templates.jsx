import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, SearchX, X } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates.js';
import { CATEGORIES, GOALS, TONES } from '../data/options.js';
import { generateDemoSection } from '../services/demoEngine.js';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import BusinessTemplateCard from '../components/BusinessTemplateCard.jsx';
import Modal from '../components/Modal.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';

const lab = (list, v) => list.find((x) => x.value === v)?.label || v;

function haystack(t) {
  return [t.label, lab(CATEGORIES, t.category), t.summary, t.exampleHeadline, lab(TONES, t.tone), lab(GOALS, t.goal)].join(' ').toLowerCase();
}

export default function Templates() {
  useDocumentMeta('Business Templates', 'Searchable library of starting points for salons, cafes, clinics, agencies, gyms, retail, coaching and consulting. Prefill the generator in one click.');
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [preview, setPreview] = useState(null);
  const { setProfile } = useWorkspace();
  const toast = useToast();
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? BUSINESS_TEMPLATES.filter((t) => haystack(t).includes(q)) : BUSINESS_TEMPLATES;
  }, [query]);

  const onQuery = (v) => {
    setQuery(v);
    setParams(v ? { q: v } : {}, { replace: true });
  };

  const applyTemplate = (t) => {
    setProfile(t.profile);
    toast.success(`${t.label} template loaded into the generator.`);
    navigate('/generator');
  };

  const demo = useMemo(() => {
    if (!preview) return null;
    return { home: generateDemoSection(preview.profile, 'homepage'), cta: generateDemoSection(preview.profile, 'cta'), services: generateDemoSection(preview.profile, 'services') };
  }, [preview]);

  return (
    <div className="container-page py-10 sm:py-16">
      <AnimatedSection className="max-w-2xl">
        <h1 className="text-display-lg">Business templates</h1>
        <p className="mt-4 text-lg text-muted">Start from a realistic example for your kind of business. Choosing one fills the generator with editable inputs. Every business named here is fictional.</p>
      </AnimatedSection>

      <div className="relative mt-8 max-w-xl">
        <label htmlFor="tpl-search" className="sr-only">Search templates</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input id="tpl-search" type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search by business, tone or goal" className="field !pl-11 !pr-11" autoComplete="off" />
        {query && (
          <button type="button" onClick={() => onQuery('')} className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink" aria-label="Clear search"><X className="h-4 w-4" aria-hidden="true" /></button>
        )}
      </div>
      <p className="mt-3 text-sm text-muted" role="status" aria-live="polite">{results.length} of {BUSINESS_TEMPLATES.length} templates</p>

      {results.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-panel border border-dashed border-line px-6 py-14 text-center">
          <SearchX className="h-10 w-10 text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-xl">No templates match &ldquo;{query}&rdquo;</h2>
          <p className="mt-2 text-muted">Try a category such as salon or cafe, or start from a blank form.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => onQuery('')}>Clear search</button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/generator')}>Open blank generator</button>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {results.map((t) => <BusinessTemplateCard key={t.id} template={t} onPreview={setPreview} onUse={applyTemplate} />)}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.label} preview` : ''}
        size="sm:max-w-2xl"
        footer={preview && (
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>Close</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { const t = preview; setPreview(null); applyTemplate(t); }}>Use this template</button>
          </>
        )}
      >
        {preview && demo && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-muted">{preview.profile.name}, {preview.profile.location}</p>
              <p className="mt-2 font-display text-2xl font-bold leading-tight">{demo.home.heroHeadline}</p>
              <p className="mt-2 leading-relaxed text-muted">{demo.home.subheadline}</p>
              <div className="mt-4 flex flex-wrap gap-2.5"><span className="btn btn-primary btn-sm cursor-default">{demo.cta.primary}</span><span className="btn btn-secondary btn-sm cursor-default">{demo.cta.secondary}</span></div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted">Services</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {demo.services.services.map((s) => <li key={s.name} className="rounded-control border border-line p-3 text-sm"><span className="font-semibold">{s.name}</span></li>)}
              </ul>
            </div>
            {preview.category === 'clinic' && <p className="rounded-control bg-surface-2 p-3 text-xs leading-relaxed text-muted">Healthcare copy avoids outcome promises and treatment claims. Confirm all wording with a qualified professional and check local advertising rules.</p>}
            <p className="text-xs text-muted">Illustrative output from the demo engine. No AI model was used.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
