import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

// Scroll-triggered reveal. Used sparingly: reduced motion is handled by <MotionConfig reducedMotion="user">.
export default function AnimatedSection({ as = 'div', delay = 0, y = 18, className = '', children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };

export function Stagger({ as = 'div', className = '', children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className={className} {...rest}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ as = 'div', className = '', children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return <Comp variants={item} className={className} {...rest}>{children}</Comp>;
}
