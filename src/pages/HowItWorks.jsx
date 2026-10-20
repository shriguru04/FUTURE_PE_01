import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import AnimatedSection from '../components/AnimatedSection.jsx';
import Button from '../components/Button.jsx';
import CopyButton from '../components/CopyButton.jsx';
import { PIPELINE, STEPS } from '../data/content.js';
import { buildPrompt } from '../services/promptBuilder.js';
import { getTemplate } from '../data/businessTemplates.js';

function Pipeline() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setActive((a) => (a + 1) % PIPELINE.length), 1700);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <ol className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center lg:gap-1" aria-label="Data flow">
      {PIPELINE.map((label, i) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="flex flex-col items-center gap-2 lg:flex-1 lg:flex-row lg:gap-1"
        >
          <div className={`w-full rounded-card border px-3 py-3.5 text-center text-sm font-semibold transition-all duration-500 lg:min-h-[76px] lg:flex lg:items-center lg:justify-center ${active === i ? 'border-brand bg-brand/10 shadow-soft' : 'border-line bg-surface'}`}>
            {label}
          </div>
          {i < PIPELINE.length - 1 && (
            <>
              <ArrowDown className="h-4 w-4 shrink-0 text-muted lg:hidden" aria-hidden="true" />
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted lg:block" aria-hidden="true" />
            </>
          )}
        </motion.li>
      ))}
    </ol>
  );
}

export default function HowItWorks() {
  useDocumentMeta('How It Works', 'From business details to structured prompt to editable website copy: the six-step CopyCraft AI workflow.');
  const sample = useMemo(() => buildPrompt(getTemplate('cafe').profile, 'homepage'), []);

  return (
    <div className="container-page py-10 sm:py-16">
      <AnimatedSection className="max-w-2xl">
        <h1 className="text-display-lg">How it works</h1>
        <p className="mt-4 text-lg text-muted">The same workflow runs whether copy comes from an AI provider or the offline demo engine.</p>
      </AnimatedSection>

      <section className="mt-12" aria-labelledby="flow-heading">
        <h2 id="flow-heading" className="mb-5 text-display-md">The pipeline</h2>
        <Pipeline />
      </section>

      <section className="mt-16" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="mb-8 text-display-md">Step by step</h2>
        <ol className="relative max-w-3xl space-y-8 pl-12 sm:pl-14">
          <motion.span
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ originY: 0 }}
            className="absolute bottom-4 left-[15px] top-4 w-0.5 rounded-full bg-gradient-to-b from-brand to-electric sm:left-[19px]"
          />
          {STEPS.map((s, i) => (
            <AnimatedSection as="li" key={s.title} className="relative">
              <span className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-electric text-sm font-bold text-white sm:-left-14 sm:h-10 sm:w-10" aria-hidden="true">{i + 1}</span>
              <h3 className="text-xl"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{s.text}</p>
            </AnimatedSection>
          ))}
        </ol>
      </section>

      <section className="mt-16" aria-labelledby="prompt-ex-heading">
        <AnimatedSection>
          <h2 id="prompt-ex-heading" className="text-display-md">A real prompt from the app</h2>
          <p className="mt-3 max-w-2xl text-muted">This is the homepage prompt built from the fictional cafe template. Each section (About, Services, CTAs, Contact) has its own task and output format. Inspect yours any time with &ldquo;View generated prompt&rdquo; in the generator.</p>
          <div className="card mt-6 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <span className="text-sm font-semibold">Homepage prompt</span>
              <CopyButton getText={() => sample} label="Copy prompt" message="Prompt copied." />
            </div>
            <pre tabIndex={0} aria-label="Example prompt" className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed">{sample}</pre>
          </div>
        </AnimatedSection>
      </section>

      <AnimatedSection className="mt-12 flex flex-wrap gap-3">
        <Button to="/generator">Try the generator</Button>
        <Button to="/templates" variant="secondary">Browse templates</Button>
      </AnimatedSection>
    </div>
  );
}
