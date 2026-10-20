import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function EmptyState({ title, text, children }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center sm:py-16">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand/15 to-electric/15"
        aria-hidden="true"
      >
        <Sparkles className="h-9 w-9 text-brand" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-electric/70" />
        <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-brand/70" />
      </motion.div>
      <h3 className="text-display-md">{title}</h3>
      <p className="mt-3 max-w-md leading-relaxed text-muted">{text}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
