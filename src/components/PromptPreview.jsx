import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Terminal } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { buildPrompt } from '../services/promptBuilder.js';
import { validateProfile } from '../services/validation.js';
import { SECTIONS } from '../data/options.js';
import CopyButton from './CopyButton.jsx';

export default function PromptPreview() {
  const { profile, activeTab, setTab } = useWorkspace();
  const [open, setOpen] = useState(false);
  const prompt = useMemo(() => buildPrompt(profile, activeTab), [profile, activeTab]);
  const complete = useMemo(() => validateProfile(profile).valid, [profile]);

  return (
    <section className="card overflow-hidden" aria-labelledby="prompt-heading">
      <h2 id="prompt-heading" className="text-base">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="prompt-panel"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[56px] w-full items-center justify-between gap-3 px-5 py-3 text-left font-display font-bold hover:bg-surface-2/60"
        >
          <span className="flex items-center gap-2.5"><Terminal className="h-5 w-5 text-brand" aria-hidden="true" />View generated prompt</span>
          <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="prompt-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-line px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  Section
                  <select value={activeTab} onChange={(e) => setTab(e.target.value)} className="field !w-auto !py-1.5">
                    {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                <CopyButton getText={() => prompt} label="Copy prompt" message="Prompt copied." />
              </div>
              {!complete && (
                <p className="text-sm text-muted">Some required fields are empty, so the prompt shows &ldquo;Not provided&rdquo; for them. It updates as you type.</p>
              )}
              <pre tabIndex={0} aria-label="Generated prompt" className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-control bg-surface-2 p-4 font-mono text-xs leading-relaxed text-ink">{prompt}</pre>
              <p className="text-xs text-muted">In AI mode your server builds this same prompt from the validated form data. In demo mode it is shown for inspection only; the template engine does not send it anywhere.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
