import { useEffect, useId, useRef } from 'react';

// Auto-growing textarea used for every editable piece of generated copy.
export default function Editable({ label, value, onChange, className = '', hideLabel = false }) {
  const id = useId();
  const ref = useRef(null);

  useEffect(() => {
    const fit = () => {
      const el = ref.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [value]);

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-1 block text-xs font-semibold text-muted'}>{label}</label>
      <textarea
        id={id}
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        className={`block w-full resize-none rounded-control border border-transparent bg-surface-2/60 px-3 py-2 leading-relaxed text-ink transition hover:border-line focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/25 ${className}`}
      />
    </div>
  );
}
