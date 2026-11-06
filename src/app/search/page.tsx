import type { Metadata } from "next";
import Link from "next/link";
import { ResultsList } from "@/components/results-list";
import { SearchForm } from "@/components/search-form";
import { getCities, getSpecialtyTree, searchOffices } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "نتائج البحث" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const pick = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = { city: pick(sp.city), specialty: pick(sp.specialty), type: pick(sp.type) };

  const [cities, specialties, offices] = await Promise.all([
    getCities(),
    getSpecialtyTree(),
    searchOffices(params),
  ]);

  const root = specialties.find((s) => s.slug === params.specialty) ?? specialties[0];
  const type = root?.children.find((c) => c.slug === params.type);
  const city = cities.find((c) => c.slug === params.city);

  const summary = [type?.name_ar ?? root?.name_ar, city ? city.name_ar : "الدمام والخبر"]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 rounded-2xl border border-line bg-card p-4 shadow-sm">
        <SearchForm cities={cities} specialties={specialties} defaults={params} compact />
      </div>

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">
          {offices.length > 0 ? `${formatNumber(offices.length)} مكتب مطابق` : "لا توجد نتائج"}
        </h1>
        <p className="text-sm text-muted">{summary} · مرتبة حسب التقييم</p>
      </div>

      {offices.length > 0 ? (
        <ResultsList offices={offices} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-card p-10 text-center">
          <p className="font-medium">لم نجد مكاتب مطابقة لهذا البحث حالياً.</p>
          <p className="mt-1 text-sm text-muted">جرّب اختيار «كل القضايا» أو «الدمام والخبر».</p>
          <Link href="/search" className="mt-4 inline-block text-sm font-semibold text-navy-600 underline">
            عرض كل المكاتب
          </Link>
        </div>
      )}
    </div>
  );
}
