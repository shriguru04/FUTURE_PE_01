export function Skeleton({ className = '' }) {
  return (
    <div aria-hidden="true" className={`relative overflow-hidden rounded-control bg-surface-2 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent" />
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Generating content</span>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function PageFallback() {
  return (
    <div className="container-page py-16" role="status">
      <span className="sr-only">Loading page</span>
      <Skeleton className="mb-6 h-12 w-2/3" />
      <Skeleton className="mb-3 h-5 w-full max-w-xl" />
      <Skeleton className="h-5 w-4/5 max-w-lg" />
    </div>
  );
}
