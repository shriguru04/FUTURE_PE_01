import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { clearAllLocalData } from '../utils/storage.js';

const COLS = [
  { title: 'Product', links: [['/generator', 'Copy Generator'], ['/templates', 'Business Templates'], ['/features', 'Features']] },
  { title: 'Learn', links: [['/how-it-works', 'How It Works'], ['/about', 'About the Project'], ['/', 'Home']] },
];

export default function Footer() {
  const toast = useToast();
  const clear = () => {
    const ok = clearAllLocalData();
    if (ok) toast.success('Saved drafts, workspace and theme were cleared from this browser. Reload to start fresh.');
    else toast.error('Could not clear browser storage.');
  };
  return (
    <footer className="mt-10 border-t border-line bg-surface-2/50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Structured prompts and editable website copy for local businesses.
          </p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-bold">{c.title}</h2>
            <ul className="mt-3 space-y-1">
              {c.links.map(([to, label]) => (
                <li key={to + label}>
                  <Link to={to} className="inline-flex min-h-[40px] items-center text-sm text-muted transition-colors hover:text-ink">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="text-sm font-bold">Your data</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Inputs, generated copy, drafts and your theme are kept in this browser&rsquo;s local storage. In demo mode nothing is sent to any server. There are no accounts.
          </p>
          <button type="button" onClick={clear} className="btn btn-secondary btn-sm mt-3">Clear saved data</button>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs leading-relaxed text-muted sm:flex-row sm:justify-between">
          <p>Built for the Future Interns Prompt Engineering Internship, Task 1. Examples on this site are illustrative, not customer results.</p>
          <p>Generated copy should be reviewed before publishing.</p>
        </div>
      </div>
    </footer>
  );
}
