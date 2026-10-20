import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  const base = useId();
  return (
    <div className="card divide-y divide-line overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${base}-panel-${i}`;
        const btnId = `${base}-btn-${i}`;
        return (
          <div key={item.q}>
            <h3 className="text-base">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-[1.02rem] font-bold hover:bg-surface-2/60"
              >
                <span className="min-w-0">{item.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-prose px-5 pb-5 leading-relaxed text-muted">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
