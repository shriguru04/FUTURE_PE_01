import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Button from './Button.jsx';

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/templates', label: 'Business Templates' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'glass' : 'border-b border-transparent'}`}>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="relative rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink aria-[current=page]:text-ink">
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand to-electric" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button to="/generator" size="sm" className="hidden sm:inline-flex">Get Started</Button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-control border border-line bg-surface lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <ul className="container-page flex flex-col gap-1 py-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) => `flex min-h-[48px] items-center rounded-control px-3 text-base font-semibold ${isActive ? 'bg-brand/10 text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-2"><Button to="/generator" className="w-full">Get Started</Button></li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
