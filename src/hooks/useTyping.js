import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Types `text` out one character at a time. Restarts whenever `text` changes.
// With reduced motion, the full text appears immediately.
export default function useTyping(text, { speed = 16, enabled = true } = {}) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const instant = reduce || !enabled;

  useEffect(() => {
    if (instant) return undefined;
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) { clearInterval(id); return c; }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, instant]);

  const shown = instant ? text : text.slice(0, count);
  return { shown, done: shown.length >= text.length };
}
