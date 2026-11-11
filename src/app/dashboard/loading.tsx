export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" role="status" aria-live="polite">
      <span className="sr-only">جارٍ التحميل…</span>
      <div className="space-y-4" aria-hidden="true">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-line" />
        <div className="h-28 animate-pulse rounded-2xl bg-line/70" />
        <div className="h-28 animate-pulse rounded-2xl bg-line/70" />
      </div>
    </div>
  );
}
