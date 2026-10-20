import { useEffect, useState } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import Modal from './Modal.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

const fmt = (iso) => {
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch { return iso; }
};

export default function DraftsModal({ open, onClose }) {
  const { listDrafts, restoreDraft, deleteDraft, deleteAllDrafts } = useWorkspace();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => { if (open) setDrafts(listDrafts()); }, [open, listDrafts]);

  const remove = (id) => { deleteDraft(id); setDrafts(listDrafts()); };
  const clearAll = () => { deleteAllDrafts(); setDrafts([]); };
  const restore = (d) => { restoreDraft(d); onClose(); };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Saved drafts"
      footer={drafts.length > 0 ? <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>Delete all drafts</button> : null}
    >
      <p className="mb-4 text-sm text-muted">Drafts are stored in this browser only. Clearing site data removes them. The 10 most recent are kept.</p>
      {drafts.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-muted">No drafts yet. Generate content, then choose &ldquo;Save draft&rdquo;.</p>
      ) : (
        <ul className="space-y-3">
          {drafts.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line p-3.5">
              <div className="min-w-0">
                <p className="truncate font-semibold">{d.name}</p>
                <p className="text-xs text-muted">{fmt(d.savedAt)} &middot; {Object.keys(d.sections || {}).length} section(s)</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => restore(d)}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />Restore<span className="sr-only">: {d.name}</span>
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(d.id)} aria-label={`Delete draft ${d.name}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
