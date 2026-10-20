import { useState } from 'react';
import { FlaskConical, FolderOpen, Save, Trash2, Cpu } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { isAiConfigured } from '../services/contentGenerator.js';
import GeneratorForm from '../components/GeneratorForm.jsx';
import GeneratedContent from '../components/GeneratedContent.jsx';
import PromptPreview from '../components/PromptPreview.jsx';
import DraftsModal from '../components/DraftsModal.jsx';
import Modal from '../components/Modal.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';

export default function Generator() {
  useDocumentMeta('Copy Generator', 'Enter your business details, choose a tone and generate editable homepage, About Us, services, CTA and contact copy.');
  const ws = useWorkspace();
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const aiReady = isAiConfigured();

  return (
    <div className="container-page py-10 sm:py-14">
      <AnimatedSection className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <h1 className="text-display-lg">Copy generator</h1>
          <p className="mt-3 text-lg text-muted">Describe the business once. Generate, edit and export copy for every key page section.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Generation mode" className="inline-flex rounded-control border border-line bg-surface p-1">
            <button type="button" aria-pressed={ws.mode === 'demo'} onClick={() => ws.setMode('demo')} className={`flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${ws.mode === 'demo' ? 'bg-brand/10 text-ink' : 'text-muted hover:text-ink'}`}>
              <FlaskConical className="h-4 w-4" aria-hidden="true" />Demo
            </button>
            <button type="button" aria-pressed={ws.mode === 'ai'} disabled={!aiReady} onClick={() => ws.setMode('ai')} title={aiReady ? '' : 'AI mode needs a backend proxy (see README)'} className={`flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${ws.mode === 'ai' ? 'bg-brand/10 text-ink' : 'text-muted hover:text-ink'}`}>
              <Cpu className="h-4 w-4" aria-hidden="true" />AI
            </button>
          </div>
          {ws.mode === 'ai' && (
            <label className="flex items-center gap-2 text-sm font-semibold">
              <span className="sr-only">AI provider</span>
              <select value={ws.provider} onChange={(e) => ws.setProvider(e.target.value)} className="field !w-auto !py-2">
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={ws.saveDraft}><Save className="h-4 w-4" aria-hidden="true" />Save draft</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDraftsOpen(true)}><FolderOpen className="h-4 w-4" aria-hidden="true" />Drafts</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setResetOpen(true)}><Trash2 className="h-4 w-4" aria-hidden="true" />Reset workspace</button>
        </div>
      </AnimatedSection>

      {!aiReady && (
        <p className="mb-6 rounded-card border border-line bg-surface-2/60 p-4 text-sm leading-relaxed text-muted">
          <strong className="text-ink">Demo mode is active.</strong> Copy is assembled from built-in templates and your inputs, and no AI model is used. To enable AI mode, run the optional proxy described in the README and set <code className="rounded bg-surface px-1.5 py-0.5 text-xs">VITE_AI_PROXY_URL</code>.
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="min-w-0 space-y-6">
          <GeneratorForm />
          <PromptPreview />
        </div>
        <div className="min-w-0">
          <GeneratedContent />
        </div>
      </div>

      <DraftsModal open={draftsOpen} onClose={() => setDraftsOpen(false)} />
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset the workspace?"
        footer={(
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResetOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { ws.resetWorkspace(); setResetOpen(false); }}>Reset workspace</button>
          </>
        )}
      >
        <p className="leading-relaxed text-muted">This clears the form and all generated copy in the workspace. Saved drafts are not deleted.</p>
      </Modal>
    </div>
  );
}
