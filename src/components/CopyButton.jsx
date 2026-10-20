import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../utils/clipboard.js';
import { useToast } from '../context/ToastContext.jsx';

export default function CopyButton({ getText, label = 'Copy', copiedLabel = 'Copied', message, className = 'btn btn-secondary btn-sm', disabled }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    const text = typeof getText === 'function' ? getText() : getText;
    if (!text) { toast.error('Nothing to copy yet.'); return; }
    const ok = await copyText(text);
    if (!ok) { toast.error('Copy failed. Select the text and copy it manually.'); return; }
    setCopied(true);
    toast.success(message || 'Copied to clipboard.');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'done' : 'idle'}
            initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
