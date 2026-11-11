import Link from "next/link";
import type { OfficeListing } from "@/lib/data";
import { Stars } from "./stars";
import { formatNumber, reviewsLabel } from "@/lib/format";

const MAX_TAGS = 4;

export function OfficeCard({ office, action }: { office: OfficeListing; action?: React.ReactNode }) {
  const tags = office.specialty_names.slice(0, MAX_TAGS);
  const more = office.specialty_names.length - tags.length;

  return (
    <article className="group rounded-2xl border border-line bg-card p-4 shadow-sm transition hover:border-gold-400/70 hover:shadow-md sm:p-5">
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-lg font-bold text-gold-400 sm:h-14 sm:w-14"
        >
          {office.name.trim().charAt(0)}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-lg font-bold leading-snug text-ink">
              <Link href={`/office/${office.slug}`} className="hover:underline">
                {office.name}
              </Link>
            </h3>
            <VerifiedBadge />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-muted">{office.city_name}</span>
            {office.rating_count > 0 ? (
              <span className="flex items-center gap-1.5">
                <Stars value={office.rating_avg} />
                <span className="font-semibold">{formatNumber(office.rating_avg)}</span>
                <span className="text-muted">({reviewsLabel(office.rating_count)})</span>
              </span>
            ) : (
              <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-700">جديد في ميعاد</span>
            )}
          </div>

          <ul className="flex flex-wrap gap-1.5" aria-label="أنواع القضايا">
            {tags.map((n) => (
              <li key={n} className="rounded-full bg-navy-50 px-3 py-0.5 text-xs font-medium text-navy-700">
                {n}
              </li>
            ))}
            {more > 0 && (
              <li className="rounded-full bg-paper px-3 py-0.5 text-xs text-muted">+{formatNumber(more)}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <div className="text-sm">{action}</div>
        <Link
          href={`/office/${office.slug}`}
          className="rounded-xl bg-navy-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          عرض الملف والتواصل
        </Link>
      </div>
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
