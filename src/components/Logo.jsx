import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight ${className}`} aria-label="CopyCraft AI home">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d46e6" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#logo-g)" />
        <path d="M40 22a13 13 0 1 0 0 20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <circle cx="46" cy="18" r="4" fill="#fff" />
      </svg>
      <span>CopyCraft <span className="text-brand">AI</span></span>
    </Link>
  );
}
