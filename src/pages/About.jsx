import useDocumentMeta from '../hooks/useDocumentMeta.js';
import AnimatedSection, { Stagger, StaggerItem } from '../components/AnimatedSection.jsx';
import Button from '../components/Button.jsx';
import { Check } from 'lucide-react';

const DEMONSTRATES = [
  ['Prompt engineering', 'Role, context, requirements and output format kept as separate, testable parts.'],
  ['Structured prompt design', 'A dedicated template per section, built dynamically from validated inputs.'],
  ['Business requirement understanding', 'Category, audience, problem, differentiator and goal all shape the output.'],
  ['AI-assisted content workflows', 'Generate, validate, edit, regenerate one section, export.'],
  ['Content quality evaluation', 'Automated checks for shape, tone differences and banned claims such as guarantees or invented awards.'],
  ['Practical software development', 'React, a provider-independent service layer, accessible UI, and local persistence.'],
];

export default function About() {
  useDocumentMeta('About', 'Why CopyCraft AI exists and what it demonstrates: structured prompt design, AI-assisted content workflows and practical software development.');
  return (
    <div className="container-page py-10 sm:py-16">
      <AnimatedSection className="max-w-3xl">
        <h1 className="text-display-lg">About CopyCraft AI</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">Many local businesses need a website but not a full-time copywriter. CopyCraft AI turns a few facts about a business into a structured first draft of its website copy, which the owner can then edit, export and publish.</p>
        <p className="mt-4 text-lg leading-relaxed text-muted">It was built as a Prompt Engineering Internship project (Future Interns, Task 1) to show how careful prompt design, validation and a usable interface fit together.</p>
      </AnimatedSection>

      <section className="mt-14" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="mb-6 text-display-md">What the project demonstrates</h2>
        <Stagger as="ul" className="grid gap-4 sm:grid-cols-2">
          {DEMONSTRATES.map(([t, d]) => (
            <StaggerItem as="li" key={t} className="card flex gap-3 p-5">
              <Check className="mt-1 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <div><h3 className="text-lg">{t}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{d}</p></div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <AnimatedSection className="card p-6">
          <h2 className="text-display-md">What it is not</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted">
            <li>It is not a company with customers, awards or a track record, and this site does not claim any.</li>
            <li>Demo mode is template-based. It is not a language model.</li>
            <li>It cannot verify facts about your business. You must.</li>
          </ul>
        </AnimatedSection>
        <AnimatedSection delay={0.06} className="card p-6">
          <h2 className="text-display-md">What is stored, and where</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted">
            <li>Your form, generated copy, saved drafts and theme choice, in this browser&rsquo;s local storage only.</li>
            <li>Nothing is sent anywhere in demo mode.</li>
            <li>In AI mode, validated form data goes to your own proxy server, which holds the provider key. The key is never in the browser.</li>
          </ul>
        </AnimatedSection>
      </div>

      <AnimatedSection className="mt-12"><Button to="/generator">Open the generator</Button></AnimatedSection>
    </div>
  );
}
