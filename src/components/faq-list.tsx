import type { Faq } from "@/lib/faq";

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-paper">
            <span>{f.q}</span>
            <svg className="faq-chevron shrink-0 text-muted transition-transform" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          </summary>
          <p className="px-5 pb-5 text-ink/85">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
