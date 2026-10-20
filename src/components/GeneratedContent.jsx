import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, Download, Info, Loader2, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SECTIONS } from '../data/options.js';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates.js';
import { exportAll, sectionToText, downloadFile, safeFilename } from '../services/exportService.js';
import SectionView from './SectionViews.jsx';
import CopyButton from './CopyButton.jsx';
import EmptyState from './EmptyState.jsx';
import Modal from './Modal.jsx';
import { SectionSkeleton } from './Skeleton.jsx';

const labelOf = (id) => SECTIONS.find((s) => s.id === id)?.label || id;

function modeLabelFor(meta) {
  const modes = new Set(Object.values(meta || {}).map((m) => m?.mode).filter(Boolean));
  if (modes.has('ai') && modes.has('demo')) return 'Mixed: some sections AI-generated, some from demo templates; review before publishing';
  if (modes.has('ai')) return 'AI-generated; review before publishing';
  return 'Demo mode (template-generated, no AI model)';
}

function Progress({ progress, loading }) {
  const frac = (progress.done + (loading[progress.current] ? 0.5 : 0)) / progress.total;
  return (
    <div className="rounded-card border border-line bg-surface-2/60 p-4" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Generation progress">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
        <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden="true" />Writing {labelOf(progress.current).toLowerCase()}...</span>
        <span className="tabular-nums text-muted">{Math.min(progress.done + 1, progress.total)} of {progress.total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-brand to-electric" animate={{ width: `${Math.round(frac * 100)}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>
    </div>
  );
}

export default function GeneratedContent() {
  const ws = useWorkspace();
  const { sections, meta, loading, errors, activeTab, setTab, progress, profile, mode, provider } = ws;
  const toast = useToast();
  const tabRefs = useRef([]);
  const [confirm, setConfirm] = useState(null); // { type: 'regen' | 'reset', id? }
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return undefined;
    const onDoc = (e) => { if (!menuRef.current?.contains(e.target)) setMenu(false); };
    const onKey = (e) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [menu]);

  const onTabKey = (e) => {
    const ids = SECTIONS.map((s) => s.id);
    const i = ids.indexOf(activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % ids.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + ids.length) % ids.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = ids.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(ids[next]);
    tabRefs.current[next]?.focus();
  };

  const regenerate = (id) => {
    if (meta[id]?.edited) setConfirm({ type: 'regen', id });
    else ws.generateSection(id, { regenerate: true });
  };

  const download = (format) => {
    setMenu(false);
    const text = exportAll({ businessName: profile.name || 'Website', sections, format, modeLabel: modeLabelFor(meta) });
    downloadFile(safeFilename(profile.name, format), text, format === 'md' ? 'text/markdown' : 'text/plain');
    toast.success(`Downloaded ${safeFilename(profile.name, format)}.`);
  };

  const tryExample = async () => {
    ws.setProfile(BUSINESS_TEMPLATES[0].profile);
    toast.info('Example loaded. Review it, then generate.');
  };

  const copyAll = () => exportAll({ businessName: profile.name || 'Website', sections, format: 'txt', modeLabel: modeLabelFor(meta) });
  const busy = Boolean(progress) || Object.values(loading).some(Boolean);
  const current = sections[activeTab];
  const isLoading = loading[activeTab];
  const error = errors[activeTab];

  return (
    <section id="results" className="card min-w-0 scroll-mt-24" aria-labelledby="results-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5 sm:p-6">
        <div className="min-w-0">
          <h2 id="results-heading" className="text-display-md">Website copy</h2>
          <p className="mt-1 text-sm text-muted">
            {mode === 'demo' ? 'Demo templates: no AI model is used.' : `AI mode via ${provider}.`} Click any text to edit it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={ws.generateAll} disabled={busy}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />Generate all
          </button>
          <CopyButton getText={copyAll} label="Copy all" message="All sections copied." disabled={!ws.hasContent} />
          <div className="relative" ref={menuRef}>
            <button type="button" className="btn btn-secondary btn-sm" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} disabled={!ws.hasContent}>
              <Download className="h-4 w-4" aria-hidden="true" />Download<ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-20 mt-2 w-52 origin-top-right overflow-hidden rounded-control border border-line bg-surface p-1 shadow-lift"
                >
                  <button role="menuitem" type="button" onClick={() => download('txt')} className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium hover:bg-surface-2">Plain text (.txt)</button>
                  <button role="menuitem" type="button" onClick={() => download('md')} className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium hover:bg-surface-2">Markdown (.md)</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {progress && <div className="px-5 pt-5 sm:px-6"><Progress progress={progress} loading={loading} /></div>}

      <div className="border-b border-line px-3 sm:px-5">
        <div role="tablist" aria-label="Website copy sections" className="flex gap-1 overflow-x-auto" onKeyDown={onTabKey}>
          {SECTIONS.map((s, i) => {
            const active = s.id === activeTab;
            return (
              <button
                key={s.id}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={active}
                aria-controls={`panel-${s.id}`}
                tabIndex={active ? 0 : -1}
                type="button"
                onClick={() => setTab(s.id)}
                className={`relative flex min-h-[48px] shrink-0 items-center gap-2 px-3.5 text-sm font-semibold transition-colors ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                {s.label}
                {loading[s.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="generating" /> : sections[s.id] ? <Check className="h-3.5 w-3.5 text-success" aria-label="generated" /> : null}
                {active && <motion.span layoutId="tab-underline" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand to-electric" transition={{ type: 'spring', stiffness: 500, damping: 42 }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {!ws.hasContent && !busy && !error ? (
          <EmptyState
            title="Your website copy will appear here"
            text="Fill in the business details, then generate. You get a homepage, About Us, services, calls to action and a contact section. Every line stays editable."
          >
            <button type="button" className="btn btn-primary" onClick={ws.generateAll}><Sparkles className="h-4 w-4" aria-hidden="true" />Generate website copy</button>
            <button type="button" className="btn btn-secondary" onClick={tryExample}><Wand2 className="h-4 w-4" aria-hidden="true" />Load an example</button>
          </EmptyState>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={0}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0 outline-none"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg">{labelOf(activeTab)}</h3>
                <div className="flex flex-wrap gap-2">
                  <CopyButton getText={() => current && sectionToText(activeTab, current)} label="Copy section" message={`${labelOf(activeTab)} copied.`} disabled={!current} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => (current ? regenerate(activeTab) : ws.generateSection(activeTab))} disabled={busy}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />{current ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="mb-5 flex gap-3 rounded-card border border-danger/40 bg-danger/5 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-danger">{error.message}</p>
                    {error.hint && <p className="mt-1 text-muted">{error.hint}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => ws.generateSection(activeTab)}>Try again</button>
                      {mode === 'ai' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => ws.setMode('demo')}>Switch to demo mode</button>}
                    </div>
                  </div>
                </div>
              )}

              {isLoading ? <SectionSkeleton /> : current ? (
                <>
                  <SectionView id={activeTab} content={current} onEdit={(path, value) => ws.editContent(activeTab, path, value)} />
                  {meta[activeTab]?.notices?.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {meta[activeTab].notices.map((n) => (
                        <li key={n} className="flex gap-2.5 rounded-control bg-surface-2 p-3 text-xs leading-relaxed text-muted">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-electric" aria-hidden="true" /><span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : !error && (
                <EmptyState title={`${labelOf(activeTab)} is not generated yet`} text="Generate this section on its own. Your other sections are not affected.">
                  <button type="button" className="btn btn-primary" onClick={() => ws.generateSection(activeTab)} disabled={busy}><Sparkles className="h-4 w-4" aria-hidden="true" />Generate {labelOf(activeTab)}</button>
                </EmptyState>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <Modal
        open={confirm?.type === 'regen'}
        onClose={() => setConfirm(null)}
        title="Replace your edits?"
        footer={(
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirm(null)}>Keep my edits</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { const id = confirm.id; setConfirm(null); ws.generateSection(id, { regenerate: true }); }}>Regenerate section</button>
          </>
        )}
      >
        <p className="leading-relaxed text-muted">You edited the {confirm?.id ? labelOf(confirm.id) : ''} section. Regenerating writes new copy for this section only and discards those edits. Other sections are not changed.</p>
      </Modal>
    </section>
  );
}
