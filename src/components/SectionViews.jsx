import Editable from './Editable.jsx';

function Group({ title, children }) {
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="mb-1 text-xs font-semibold text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function SectionView({ id, content, onEdit }) {
  const ed = (label, key, cls = '') => (
    <Editable label={label} value={content[key]} onChange={(v) => onEdit([key], v)} className={cls} />
  );
  const list = (title, key) => (
    <Group title={title}>
      {content[key].map((item, i) => (
        <Editable key={`${key}-${i}`} label={`${title} ${i + 1}`} hideLabel value={item} onChange={(v) => onEdit([key, i], v)} />
      ))}
    </Group>
  );

  if (id === 'homepage') {
    return (
      <div className="space-y-5">
        {ed('Hero headline', 'heroHeadline', 'font-display text-2xl font-bold leading-tight sm:text-3xl')}
        {ed('Supporting subheadline', 'subheadline', 'text-base')}
        <div className="grid gap-4 sm:grid-cols-2">
          {ed('Main call to action', 'primaryCta', 'font-semibold')}
          {ed('Secondary call to action', 'secondaryCta', 'font-semibold')}
        </div>
        {ed('Value proposition', 'valueProposition')}
        {list('Key benefits', 'keyBenefits')}
        {list('Suggested section headings', 'sectionHeadings')}
      </div>
    );
  }

  if (id === 'about') {
    return (
      <div className="space-y-5">
        {ed('Business introduction', 'introduction')}
        {ed('Mission or purpose', 'mission')}
        {list('Differentiators', 'differentiators')}
        {ed('Customer-focused message', 'customerMessage')}
      </div>
    );
  }

  if (id === 'services') {
    return (
      <div className="grid gap-4">
        {content.services.map((s, i) => (
          <div key={i} className="min-w-0 space-y-3 rounded-card border border-line p-4">
            <Editable label={`Service ${i + 1} name`} value={s.name} onChange={(v) => onEdit(['services', i, 'name'], v)} className="font-display text-lg font-bold" />
            <Editable label="Description" value={s.description} onChange={(v) => onEdit(['services', i, 'description'], v)} />
            <Editable label="Customer benefit" value={s.benefit} onChange={(v) => onEdit(['services', i, 'benefit'], v)} />
            <Editable label="Call to action (optional)" value={s.cta} onChange={(v) => onEdit(['services', i, 'cta'], v)} className="font-semibold" />
          </div>
        ))}
      </div>
    );
  }

  if (id === 'cta') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {ed('Primary CTA', 'primary', 'font-semibold')}
        {ed('Secondary CTA', 'secondary', 'font-semibold')}
        {ed('Contact CTA', 'contact', 'font-semibold')}
        {ed('Booking CTA', 'booking', 'font-semibold')}
        {ed('Enquiry CTA', 'enquiry', 'font-semibold')}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {ed('Contact heading', 'heading', 'font-display text-xl font-bold')}
      {ed('Supporting text', 'supportingText')}
      {list('Suggested form labels', 'formLabels')}
      {ed('Submit button text', 'buttonText', 'font-semibold')}
    </div>
  );
}
