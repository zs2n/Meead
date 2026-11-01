import type { City, SpecialtyTree } from "@/lib/data";

type Props = {
  cities: City[];
  specialties: SpecialtyTree[];
  defaults?: { city?: string; specialty?: string; type?: string };
  compact?: boolean;
};

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-white px-4 py-3 pe-10 text-ink shadow-sm " +
  "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40";

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** نموذج بحث يعمل بدون JavaScript (GET إلى /search) */
export function SearchForm({ cities, specialties, defaults = {}, compact = false }: Props) {
  const root = specialties.find((s) => s.slug === defaults.specialty) ?? specialties[0];

  return (
    <form
      action="/search"
      method="get"
      className={`grid gap-3 ${compact ? "sm:grid-cols-[1fr_1fr_1fr_auto]" : "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"}`}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted">التخصص</span>
        <span className="relative block">
          <select name="specialty" defaultValue={root?.slug} className={selectClass}>
            {specialties.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name_ar}
              </option>
            ))}
          </select>
          <Chevron />
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted">نوع القضية (اختياري)</span>
        <span className="relative block">
          <select name="type" defaultValue={defaults.type ?? ""} className={selectClass}>
            <option value="">كل القضايا</option>
            {root?.children.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_ar}
              </option>
            ))}
          </select>
          <Chevron />
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted">المدينة</span>
        <span className="relative block">
          <select name="city" defaultValue={defaults.city ?? "all"} className={selectClass}>
            <option value="all">الدمام والخبر</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_ar} فقط
              </option>
            ))}
          </select>
          <Chevron />
        </span>
      </label>

      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <button
          type="submit"
          className="w-full rounded-xl bg-gold-500 px-8 py-3 font-semibold text-navy-900 shadow-sm transition hover:bg-gold-400 active:scale-[.99]"
        >
          ابحث
        </button>
      </div>
    </form>
  );
}
