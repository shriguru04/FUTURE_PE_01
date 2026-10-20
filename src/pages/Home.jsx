import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Sparkles, MousePointerClick, Type } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import Button from '../components/Button.jsx';
import AnimatedSection, { Stagger, StaggerItem } from '../components/AnimatedSection.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ProductPreview from '../components/ProductPreview.jsx';
import Counter from '../components/Counter.jsx';
import Accordion from '../components/Accordion.jsx';
import { BENEFITS, FEATURES, STEPS, FAQ, BEFORE_AFTER } from '../data/content.js';
import { CATEGORIES, GOALS, SECTIONS, TONES } from '../data/options.js';
import { getTemplate } from '../data/businessTemplates.js';
import { generateDemoSection } from '../services/demoEngine.js';

const EASE = [0.22, 1, 0.36, 1];
const heroItem = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

function Hero() {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-96 w-96 animate-drift rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -right-24 top-24 h-[26rem] w-[26rem] animate-drift rounded-full bg-electric/20 blur-3xl [animation-delay:-6s]" />
      </div>
      <div className="container-page pb-16 pt-14 sm:pb-24 sm:pt-20">
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.11 } } }} className="mx-auto max-w-4xl text-center">
          <motion.h1 variants={heroItem} id="hero-title" className="text-display-xl">
            Turn Your Business Ideas Into Website Copy <span className="gradient-text">That Converts.</span>
          </motion.h1>
          <motion.p variants={heroItem} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Create clear, persuasive, business-ready website content tailored to your services, audience, and brand voice.
          </motion.p>
          <motion.div variants={heroItem} className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button to="/generator"><Sparkles className="h-4 w-4" aria-hidden="true" />Generate Website Copy</Button>
            <Button to="/templates" variant="secondary">Explore Examples<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          className="relative mx-auto mt-14 max-w-4xl"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-10 top-16 hidden animate-float items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold shadow-soft xl:flex">
            <Type className="h-4 w-4 text-brand" />Headline
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 bottom-24 hidden animate-float-slow items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold shadow-soft xl:flex">
            <MousePointerClick className="h-4 w-4 text-electric" />Call to action
          </div>
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="section-y border-y border-line bg-surface-2/40" aria-labelledby="benefits-title">
      <div className="container-page">
        <SectionHeading id="benefits-title" title="Built to be useful, and honest about what it is" text="Plain facts about how the tool behaves." />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <StaggerItem key={b.title} className="card card-hover p-5">
              <b.icon className="h-6 w-6 text-brand" aria-hidden="true" />
              <h3 className="mt-4 text-lg">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <ul className="mt-14 grid grid-cols-2 gap-8 border-t border-line pt-10 sm:grid-cols-4">
          {[[CATEGORIES.length, 'business categories'], [TONES.length, 'brand tones'], [GOALS.length, 'conversion goals'], [SECTIONS.length, 'copy sections']].map(([n, l]) => (
            <li key={l}><Counter value={n} label={l} /></li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">These counts describe what the tool supports. They are not usage or performance statistics.</p>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="section-y" aria-labelledby="features-title">
      <div className="container-page">
        <SectionHeading id="features-title" title="Everything you need to go from details to draft" text="Ten capabilities, each one working in the app." />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(0, 6).map((f) => (
            <StaggerItem key={f.title} className="card card-hover p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-electric/15"><f.icon className="h-5 w-5 text-brand" aria-hidden="true" /></span>
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-8"><Link to="/features" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-brand hover:underline">See all features<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}

function HowItWorksSummary() {
  return (
    <section className="section-y bg-surface-2/40" aria-labelledby="hiw-title">
      <div className="container-page">
        <SectionHeading id="hiw-title" title="How it works" text="Six steps from a few facts to copy you can use." />
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <AnimatedSection as="li" key={s.title} delay={(i % 3) * 0.06} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand" aria-hidden="true">{i + 1}</span>
              <h3 className="mt-3 text-lg"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </AnimatedSection>
          ))}
        </ol>
        <div className="mt-8"><Link to="/how-it-works" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-brand hover:underline">See the full workflow<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="section-y" aria-labelledby="cats-title">
      <div className="container-page">
        <SectionHeading id="cats-title" title="Made for local businesses" text="Pick a category and the generator speaks its language." />
        <Stagger as="ul" className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <StaggerItem as="li" key={c.value}>
              <Link to={`/templates?q=${encodeURIComponent(c.label)}`} className="chip min-h-[48px] px-5 text-base hover:-translate-y-0.5">{c.label}</Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function BeforeAfter() {
  const rows = useMemo(() => BEFORE_AFTER.map((r) => {
    const t = getTemplate(r.templateId);
    const home = generateDemoSection(t.profile, 'homepage');
    return { ...r, t, after: `${home.heroHeadline}. ${home.subheadline}` };
  }), []);
  return (
    <section className="section-y border-y border-line bg-surface-2/40" aria-labelledby="ba-title">
      <div className="container-page">
        <SectionHeading id="ba-title" title="A vague prompt versus a structured one" text="Illustrative examples. The left side is typical of what a one-line prompt invites; the right side is output from this app's demo engine for a fictional business." />
        <div className="grid gap-6 lg:grid-cols-3">
          {rows.map((r, i) => (
            <AnimatedSection key={r.templateId} delay={i * 0.07} className="card flex min-w-0 flex-col overflow-hidden">
              <h3 className="border-b border-line px-5 py-3.5 text-base">{r.t.label}</h3>
              <div className="flex-1 space-y-5 p-5">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-danger"><X className="h-4 w-4" aria-hidden="true" />Vague prompt</p>
                  <p className="mt-1.5 rounded-control bg-surface-2 p-2.5 font-mono text-xs">{r.prompt}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">&ldquo;{r.before}&rdquo;</p>
                  <p className="mt-1.5 text-xs font-semibold text-danger">{r.issues}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-success"><Check className="h-4 w-4" aria-hidden="true" />Structured prompt</p>
                  <p className="mt-1.5 text-xs text-muted">Name, location, audience, problem, USP, tone and goal supplied.</p>
                  <p className="mt-2.5 text-sm leading-relaxed">&ldquo;{r.after}&rdquo;</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function SampleOutput() {
  const out = useMemo(() => {
    const p = { ...getTemplate('cafe').profile };
    return { home: generateDemoSection(p, 'homepage'), services: generateDemoSection(p, 'services'), cta: generateDemoSection(p, 'cta'), contact: generateDemoSection(p, 'contact') };
  }, []);
  return (
    <section className="section-y" aria-labelledby="sample-title">
      <div className="container-page">
        <SectionHeading id="sample-title" title="One input, five sections" text="Sample output for a fictional cafe, generated live by the demo engine." />
        <div className="grid gap-5 lg:grid-cols-3">
          <AnimatedSection className="card p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-muted">Homepage</h3>
            <p className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">{out.home.heroHeadline}</p>
            <p className="mt-3 leading-relaxed text-muted">{out.home.subheadline}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {out.home.keyBenefits.map((b) => (<li key={b} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{b}</li>))}
            </ul>
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="card p-6">
            <h3 className="text-sm font-semibold text-muted">Calls to action</h3>
            <ul className="mt-3 space-y-2">
              {Object.entries(out.cta).map(([k, v]) => (<li key={k} className="flex items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2 text-sm"><span className="text-muted">{k}</span><span className="font-semibold">{v}</span></li>))}
            </ul>
          </AnimatedSection>
          <AnimatedSection delay={0.05} className="card p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-muted">Services</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {out.services.services.slice(0, 4).map((s) => (<div key={s.name} className="rounded-control border border-line p-3.5"><p className="font-display font-bold">{s.name}</p><p className="mt-1 text-sm text-muted">{s.description}</p></div>))}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="card p-6">
            <h3 className="text-sm font-semibold text-muted">Contact section</h3>
            <p className="mt-3 font-display text-lg font-bold">{out.contact.heading}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{out.contact.supportingText}</p>
            <p className="mt-3 text-xs text-muted">Button: <span className="font-semibold text-ink">{out.contact.buttonText}</span></p>
          </AnimatedSection>
        </div>
        <p className="mt-5 text-xs text-muted">Illustrative demo-engine output for a fictional business. No AI model was used.</p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="section-y bg-surface-2/40" aria-labelledby="faq-title">
      <div className="container-page max-w-3xl">
        <SectionHeading id="faq-title" title="Frequently asked questions" />
        <AnimatedSection><Accordion items={FAQ} /></AnimatedSection>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="section-y" aria-labelledby="final-title">
      <div className="container-page">
        <AnimatedSection className="relative isolate overflow-hidden rounded-panel border border-line bg-surface p-8 text-center shadow-lift sm:p-14">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand/10 via-transparent to-electric/10" />
          <h2 id="final-title" className="mx-auto max-w-2xl text-display-lg">Write your first draft in a few minutes</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">No account and no API key needed. Start from a blank form or a template.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/generator"><Sparkles className="h-4 w-4" aria-hidden="true" />Generate Website Copy</Button>
            <Button to="/templates" variant="secondary">Browse templates</Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default function Home() {
  useDocumentMeta('', 'Create clear, business-specific website copy for salons, cafes, clinics, agencies, gyms and more. Structured prompts, editable output, demo mode with no API key.');
  return (
    <>
      <Hero />
      <Benefits />
      <FeatureGrid />
      <HowItWorksSummary />
      <Categories />
      <BeforeAfter />
      <SampleOutput />
      <Faq />
      <FinalCta />
    </>
  );
}
