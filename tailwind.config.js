const rgb = (v) => `rgb(var(${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: rgb('--canvas'),
        surface: rgb('--surface'),
        'surface-2': rgb('--surface-2'),
        ink: rgb('--ink'),
        muted: rgb('--muted'),
        line: rgb('--line'),
        brand: rgb('--brand'),
        electric: rgb('--electric'),
        danger: rgb('--danger'),
        success: rgb('--success'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.4rem, 7vw, 4.6rem)', { lineHeight: '1.03', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(1.9rem, 4.4vw, 3.1rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.4rem, 2.8vw, 1.9rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: { control: '0.75rem', card: '1.25rem', panel: '1.75rem' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / .05), 0 8px 24px -14px rgb(var(--shadow) / .14)',
        lift: '0 2px 4px rgb(var(--shadow) / .06), 0 20px 44px -20px rgb(var(--shadow) / .30)',
      },
      transitionTimingFunction: { out: 'cubic-bezier(.22,1,.36,1)' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        drift: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(24px,-18px) scale(1.08)' } },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        gradient: 'gradientShift 9s ease infinite',
        drift: 'drift 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
