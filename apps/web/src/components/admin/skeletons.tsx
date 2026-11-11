export function AuthSkeleton() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor" className="animate-pulse">
      <div className="size-12 rounded-2xl bg-surface-2" />
      <div className="mt-6 h-8 w-2/3 rounded-lg bg-surface-2" />
      <div className="mt-3 h-4 w-full rounded bg-surface-2" />
      <div className="mt-2 h-4 w-4/5 rounded bg-surface-2" />
      <div className="mt-8 h-12 rounded-xl bg-surface-2" />
      <div className="mt-5 h-12 rounded-xl bg-surface-2" />
      <div className="mt-5 h-13 rounded-xl bg-surface-2" />
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div aria-busy="true" aria-label="Panel yükleniyor" className="flex min-h-dvh">
      <div className="hidden w-68 shrink-0 bg-navy-950 lg:block" />
      <div className="flex-1 animate-pulse p-8">
        <div className="h-8 w-64 rounded-lg bg-surface-2" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface-2" />
          ))}
        </div>
        <div className="mt-6 h-80 rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className = "h-40" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}
