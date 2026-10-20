import { motion } from 'framer-motion';
import { ArrowRight, Eye, Target, Volume2 } from 'lucide-react';
import { CATEGORIES, GOALS, TONES } from '../data/options.js';

const lab = (list, v) => list.find((x) => x.value === v)?.label || v;

export default function BusinessTemplateCard({ template, onPreview, onUse }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="card card-hover flex min-w-0 flex-col p-5"
    >
      <span className="badge self-start">{lab(CATEGORIES, template.category)}</span>
      <h3 className="mt-3 text-xl">{template.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{template.summary}</p>
      <blockquote className="mt-4 rounded-control bg-surface-2 p-3.5 font-display text-[0.98rem] font-bold leading-snug">
        {template.exampleHeadline}
      </blockquote>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2"><Volume2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" /><dt className="text-muted">Suggested tone:</dt><dd className="font-semibold">{lab(TONES, template.tone)}</dd></div>
        <div className="flex items-center gap-2"><Target className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" /><dt className="text-muted">Main goal:</dt><dd className="font-semibold">{lab(GOALS, template.goal)}</dd></div>
      </dl>
      <div className="mt-5 grid grid-cols-2 gap-2.5 pt-1 sm:mt-auto sm:pt-5">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onPreview(template)}><Eye className="h-4 w-4" aria-hidden="true" />Preview<span className="sr-only"> {template.label} template</span></button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onUse(template)}>Use this template<span className="sr-only">: {template.label}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </motion.li>
  );
}
