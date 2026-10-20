import useCountUp from '../hooks/useCountUp.js';

export default function Counter({ value, label }) {
  const { ref, value: n } = useCountUp(value);
  return (
    <div className="text-center sm:text-left">
      <div className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl">
        <span ref={ref} aria-label={String(value)}>{n}</span>
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
