import { Link } from 'react-router-dom';

const VARIANTS = { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost' };

// Renders a router Link when `to` is set, an anchor when `href` is set, otherwise a button.
export default function Button({ variant = 'primary', size, to, href, className = '', children, ...rest }) {
  const cls = `btn ${VARIANTS[variant]} ${size === 'sm' ? 'btn-sm' : ''} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
