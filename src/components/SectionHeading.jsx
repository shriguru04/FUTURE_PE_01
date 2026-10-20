import AnimatedSection from './AnimatedSection.jsx';

export default function SectionHeading({ id, title, text, align = 'left', as: Tag = 'h2', className = '' }) {
  const center = align === 'center';
  return (
    <AnimatedSection className={`mb-10 sm:mb-14 ${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      <Tag id={id} className="text-display-lg">{title}</Tag>
      {text && <p className="mt-4 text-lg leading-relaxed text-muted">{text}</p>}
    </AnimatedSection>
  );
}
