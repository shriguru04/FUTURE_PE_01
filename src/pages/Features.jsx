import useDocumentMeta from '../hooks/useDocumentMeta.js';
import AnimatedSection, { Stagger, StaggerItem } from '../components/AnimatedSection.jsx';
import Button from '../components/Button.jsx';
import { FEATURES, PRINCIPLES } from '../data/content.js';

export default function Features() {
  useDocumentMeta('Features', 'Business-specific generation, brand tone adaptation, editable output, reusable prompts, export, local drafts and an offline demo mode.');
  return (
    <div className="container-page py-10 sm:py-16">
      <AnimatedSection className="max-w-2xl">
        <h1 className="text-display-lg">What CopyCraft AI does</h1>
        <p className="mt-4 text-lg text-muted">Ten capabilities, all working in the app today. No claims about conversion rates, because none have been measured.</p>
      </AnimatedSection>

      <Stagger as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <StaggerItem as="li" key={f.title} className="card card-hover group p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-electric/15 transition-transform duration-300 group-hover:scale-105"><f.icon className="h-6 w-6 text-brand" aria-hidden="true" /></span>
            <h2 className="mt-5 text-xl">{f.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{f.text}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatedSection className="card mt-14 p-6 sm:p-8">
        <h2 className="text-display-md">Rules the generator follows</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <li key={p.text} className="flex gap-3 text-sm leading-relaxed"><p.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />{p.text}</li>
          ))}
        </ul>
      </AnimatedSection>

      <AnimatedSection className="mt-10 flex flex-wrap gap-3">
        <Button to="/generator">Open the generator</Button>
        <Button to="/how-it-works" variant="secondary">See how it works</Button>
      </AnimatedSection>
    </div>
  );
}
