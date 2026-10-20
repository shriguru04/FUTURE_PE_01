import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getTemplate } from '../data/businessTemplates.js';
import { TONES } from '../data/options.js';
import { generateDemoSection } from '../services/demoEngine.js';
import useTyping from '../hooks/useTyping.js';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const PREVIEW_IDS = ['salon', 'cafe', 'clinic', 'gym', 'agency'];

export default function ProductPreview() {
  const [tid, setTid] = useState('salon');
  const [tone, setTone] = useState('friendly');
  const navigate = useNavigate();
  const { setProfile } = useWorkspace();
  const toast = useToast();
  const template = getTemplate(tid);

  const out = useMemo(() => {
    const p = { ...template.profile, tone };
    return { home: generateDemoSection(p, 'homepage'), services: generateDemoSection(p, 'services'), cta: generateDemoSection(p, 'cta') };
  }, [template, tone]);

  const { shown } = useTyping(out.home.heroHeadline, { speed: 14 });

  const pickTemplate = (id) => {
    setTid(id);
    setTone(getTemplate(id).tone);
  };

  const useInGenerator = () => {
    setProfile({ ...template.profile, tone });
    toast.success(`Loaded the ${template.label} example into the generator.`);
    navigate('/generator');
  };

  return (
    <div className="card overflow-hidden shadow-lift">
      <div className="space-y-4 border-b border-line bg-surface-2/50 p-4 sm:p-5">
        <div>
          <p id="pp-type" className="mb-2 text-xs font-semibold text-muted">Business type</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="pp-type">
            {PREVIEW_IDS.map((id) => (
              <button key={id} type="button" className="chip" aria-pressed={tid === id} onClick={() => pickTemplate(id)}>{getTemplate(id).label}</button>
            ))}
          </div>
        </div>
        <div>
          <p id="pp-tone" className="mb-2 text-xs font-semibold text-muted">Brand tone</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="pp-tone">
            {TONES.map((t) => (
              <button key={t.value} type="button" className="chip" aria-pressed={tone === t.value} onClick={() => setTone(t.value)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="p-5 sm:p-8"
        >
          <p className="text-sm font-semibold text-muted">{template.profile.name}</p>
          <h3 className="mt-2 min-h-[5.5rem] text-display-md sm:min-h-[4.5rem]" aria-live="off">
            <span className="sr-only">{out.home.heroHeadline}</span>
            <span aria-hidden="true">{shown}<span className="ml-0.5 inline-block h-[0.9em] w-0.5 translate-y-0.5 animate-pulse bg-brand" /></span>
          </h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">{out.home.subheadline}</p>
          <div className="mt-5 flex flex-wrap gap-3" aria-label="Call to action preview">
            <span className="btn btn-primary cursor-default">{out.cta.primary}</span>
            <span className="btn btn-secondary cursor-default">{out.cta.secondary}</span>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {out.services.services.slice(0, 2).map((s) => (
              <div key={s.name} className="rounded-card border border-line p-4">
                <p className="font-display font-bold">{s.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.description}</p>
                <p className="mt-2 text-sm font-semibold text-brand">{s.cta}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-5 py-4 sm:px-8">
        <p className="max-w-md text-xs leading-relaxed text-muted">Illustrative output from the built-in demo engine for a fictional business. Not a customer result, and no AI model was used.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={useInGenerator}>Use in generator<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </div>
  );
}
