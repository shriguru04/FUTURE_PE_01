import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONE = { success: 'text-success', error: 'text-danger', info: 'text-electric' };
const WORD = { success: 'Success', error: 'Error', info: 'Notice' };

export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-control border border-line bg-surface p-3.5 shadow-lift"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${TONE[t.type]}`} aria-hidden="true" />
              <p className="min-w-0 flex-1 break-words text-sm text-ink">
                <span className="sr-only">{WORD[t.type]}: </span>
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="-m-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
