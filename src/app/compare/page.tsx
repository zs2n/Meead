import type { Metadata } from "next";
import Link from "next/link";
import { Stars } from "@/components/stars";
import { getOfficesBySlugs } from "@/lib/data";
import { formatNumber, reviewsLabel } from "@/lib/format";

export const metadata: Metadata = { title: "مقارنة المكاتب" };

type Props = { searchParams: Promise<{ o?: string }> };

export default async function ComparePage({ searchParams }: Props) {
  const { o } = await searchParams;
  const slugs = (o ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]+$/.test(s))
    .slice(0, 3);

  const fetched = await getOfficesBySlugs(slugs);
  const offices = slugs
    .map((s) => fetched.find((f) => f.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  if (offices.length < 2) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">اختر مكتبين على الأقل للمقارنة</h1>
        <Link href="/search" className="mt-6 inline-block rounded-xl bg-navy-700 px-5 py-2.5 font-semibold text-white">
          العودة للنتائج
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (o: (typeof offices)[number]) => React.ReactNode }[] = [
    {
      label: "المدينة",
      render: (x) => x.city_name,
    },
    {
      label: "التقييم",
      render: (x) =>
        x.rating_count > 0 ? (
          <div className="flex flex-col items-center gap-1">
            <Stars value={x.rating_avg} size={16} />
            <span className="font-bold">{formatNumber(x.rating_avg)}</span>
          </div>
        ) : (
          <span className="text-muted">لا تقييمات</span>
        ),
    },
    {
      label: "عدد التقييمات",
      render: (x) => reviewsLabel(x.rating_count),
    },
    {
      label: "أنواع القضايا",
      render: (x) => (
        <ul className="flex flex-col items-center gap-1">
          {x.specialty_names.map((n) => (
            <li key={n} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
              {n}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "عن المكتب",
      render: (x) => <p className="line-clamp-4 text-start text-xs text-muted">{x.description ?? "—"}</p>,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/search" className="text-sm text-muted hover:text-ink">→ العودة للنتائج</Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">مقارنة المكاتب</h1>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36 bg-paper p-4 text-start font-medium text-muted"></th>
              {offices.map((x) => (
                <th key={x.id} className="border-s border-line p-4 text-center align-top">
                  <div className="font-bold">{x.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className="bg-paper p-4 text-start font-medium text-muted">{r.label}</th>
                {offices.map((x) => (
                  <td key={x.id} className="border-s border-line p-4 text-center align-top">
                    {r.render(x)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-line">
              <th scope="row" className="bg-paper p-4 text-start font-medium text-muted"></th>
              {offices.map((x) => (
                <td key={x.id} className="border-s border-line p-4 text-center">
                  <Link href={`/office/${x.slug}`} className="inline-block rounded-xl border border-navy-700 px-4 py-2 font-semibold text-navy-700 hover:bg-navy-700 hover:text-white">
                    عرض الملف
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
