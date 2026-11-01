import Link from "next/link";
import type { OfficeListing } from "@/lib/data";
import { Stars } from "./stars";
import { formatNumber, reviewsLabel } from "@/lib/format";

export function OfficeCard({ office }: { office: OfficeListing }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center">
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-ink">{office.name}</h2>
          <VerifiedBadge />
        </div>
        <p className="text-sm text-muted">{office.city_name}</p>

        <div className="flex items-center gap-2 text-sm">
          {office.rating_count > 0 ? (
            <>
              <Stars value={office.rating_avg} />
              <span className="font-semibold">{formatNumber(office.rating_avg)}</span>
              <span className="text-muted">({reviewsLabel(office.rating_count)})</span>
            </>
          ) : (
            <span className="text-muted">{reviewsLabel(0)}</span>
          )}
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="التخصصات">
          {office.specialty_names.map((n) => (
            <li key={n} className="rounded-full bg-navy-50 px-3 py-0.5 text-xs font-medium text-navy-700">
              {n}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/office/${office.slug}`}
        className="shrink-0 rounded-xl border border-navy-700 px-5 py-2.5 text-center font-semibold text-navy-700 transition hover:bg-navy-700 hover:text-white"
      >
        عرض الملف
      </Link>
    </article>
  );
}

export function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700"
      title="تم التحقق من ترخيص المكتب يدوياً"
    >
      <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      مرخّص وموثّق
    </span>
  );
}
