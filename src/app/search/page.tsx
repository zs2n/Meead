import type { Metadata } from "next";
import Link from "next/link";
import { OfficeCta } from "@/components/cta-band";
import { ResultsList } from "@/components/results-list";
import { SearchForm } from "@/components/search-form";
import { SORTS, getCities, getSpecialtyTree, resolveSpecialty, searchOffices } from "@/lib/data";
import { officesLabel } from "@/lib/format";
import { site } from "@/lib/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const pick = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function readParams(searchParams: Props["searchParams"]) {
  const sp = await searchParams;
  return { city: pick(sp.city), specialty: pick(sp.specialty), type: pick(sp.type), sort: pick(sp.sort) };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await readParams(searchParams);
  const [cities, tree] = await Promise.all([getCities(), getSpecialtyTree()]);
  const { root, type } = resolveSpecialty(tree, params);
  const city = cities.find((c) => c.slug === params.city);
  const subject = type?.name_ar ?? root?.name_ar;
  const title = subject ? `مكاتب محاماة ${subject} في ${city?.name_ar ?? site.region}` : `مكاتب المحاماة في ${city?.name_ar ?? site.region}`;
  const hasFilters = Object.values(params).some(Boolean);
  return {
    title,
    description: `قارن بين ${title} الموثّقة في ميعاد حسب التقييم، وتواصل مع المكتب مباشرة.`,
    alternates: { canonical: "/search" },
    // صفحات الفلاتر لا تُفهرس لتجنّب التكرار؛ الصفحات المفهرسة هي /cases/…
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await readParams(searchParams);
  const [cities, specialties, offices] = await Promise.all([getCities(), getSpecialtyTree(), searchOffices(params)]);

  const { root, type } = resolveSpecialty(specialties, params);
  const city = cities.find((c) => c.slug === params.city);
  const subject = type?.name_ar ?? root?.name_ar;
  const where = city ? city.name_ar : site.region;
  const sort = SORTS.find((s) => s.key === params.sort)?.key ?? "rating";

  const sortHref = (key: string) => {
    const q = new URLSearchParams();
    if (root) q.set("specialty", root.slug);
    if (type) q.set("type", type.slug);
    if (city) q.set("city", city.slug);
    if (key !== "rating") q.set("sort", key);
    const s = q.toString();
    return s ? `/search?${s}` : "/search";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 rounded-2xl border border-line bg-card p-4 shadow-sm">
        <SearchForm cities={cities} specialties={specialties} defaults={{ ...params, specialty: root?.slug }} compact />
      </div>

      <div className="mb-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {subject ? `مكاتب محاماة ${subject} في ${where}` : `مكاتب المحاماة في ${where}`}
          </h1>
          <p className="mt-1 text-sm text-muted" role="status">
            {offices.length > 0 ? `${officesLabel(offices.length)} مطابقة لبحثك` : "لا توجد نتائج مطابقة"}
          </p>
        </div>

        {offices.length > 1 && (
          <nav aria-label="ترتيب النتائج" className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">الترتيب:</span>
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={sortHref(s.key)}
                aria-current={s.key === sort ? "true" : undefined}
                className={`rounded-full border px-3 py-1.5 ${
                  s.key === sort ? "border-navy-700 bg-navy-700 text-white" : "border-line bg-card text-ink hover:border-navy-600"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {offices.length > 0 ? (
        <ResultsList offices={offices} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center sm:p-10">
          <p className="text-lg font-semibold">لم نجد مكاتب مطابقة لهذا البحث حالياً.</p>
          <p className="mt-1 text-muted">جرّب اختيار «كل القضايا» أو «{site.region}»، فالدليل يكبر كل أسبوع.</p>
          <Link href="/search" className="mt-5 inline-block rounded-xl bg-gold-500 px-6 py-2.5 font-semibold text-navy-900 hover:bg-gold-400">
            عرض كل المكاتب
          </Link>
        </div>
      )}

      <OfficeCta />
    </div>
  );
}
