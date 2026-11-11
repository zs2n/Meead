import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OfficeCta } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { ResultsList } from "@/components/results-list";
import { getCities, getSpecialtyTree, searchOffices, type SpecialtyTree } from "@/lib/data";
import { officesLabel } from "@/lib/format";
import { absoluteUrl, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ city?: string }> };

/** الرابط قد يكون تخصصاً رئيسياً (labor) أو نوع قضية (custody) */
function locate(tree: SpecialtyTree[], slug: string) {
  const root = tree.find((r) => r.slug === slug);
  if (root) return { root, type: null };
  for (const r of tree) {
    const type = r.children.find((c) => c.slug === slug);
    if (type) return { root: r, type };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = locate(await getSpecialtyTree(), slug);
  if (!found) return { title: "غير موجود", robots: { index: false } };
  const name = found.type?.name_ar ?? found.root.name_ar;
  const title = `محامي ${name} في ${site.region}`;
  const description = `مكاتب المحاماة المرخّصة في قضايا ${name} في ${site.region}. قارن التقييمات وساعات العمل وتواصل مع المكتب مباشرة عبر ميعاد.`;
  return {
    title,
    description,
    alternates: { canonical: `/cases/${slug}` },
    openGraph: { title: `${title} | ${site.name}`, description, url: `/cases/${slug}` },
  };
}

export default async function CasePage({ params, searchParams }: Props) {
  const [{ slug }, { city: cityParam }] = await Promise.all([params, searchParams]);
  const [tree, cities] = await Promise.all([getSpecialtyTree(), getCities()]);
  const found = locate(tree, slug);
  if (!found) notFound();

  const { root, type } = found;
  const name = type?.name_ar ?? root.name_ar;
  const city = cities.find((c) => c.slug === cityParam);
  const offices = await searchOffices({ specialty: root.slug, type: type?.slug, city: city?.slug });
  const siblings = root.children.filter((c) => c.slug !== type?.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الرئيسية", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: root.name_ar, item: absoluteUrl(`/cases/${root.slug}`) },
            ...(type ? [{ "@type": "ListItem", position: 3, name: type.name_ar, item: absoluteUrl(`/cases/${type.slug}`) }] : []),
          ],
        }}
      />

      <nav className="mb-4 text-sm text-muted" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-ink">الرئيسية</Link>
        <span className="mx-2">/</span>
        {type ? (
          <>
            <Link href={`/cases/${root.slug}`} className="hover:text-ink">{root.name_ar}</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{type.name_ar}</span>
          </>
        ) : (
          <span className="text-ink">{root.name_ar}</span>
        )}
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          محامو {name} في {city?.name_ar ?? site.region}
        </h1>
        <p className="mt-2 max-w-2xl text-ink/80">
          مكاتب محاماة مرخّصة تتولى قضايا {name}، تحققنا من تراخيصها قبل نشرها. قارن بينها حسب تقييمات عملاء تواصلوا
          معها فعلاً، ثم تواصل مع المكتب الذي تختاره مباشرة ومجاناً.
        </p>
      </header>

      <nav aria-label="تصفية حسب المدينة" className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">المدينة:</span>
        {[{ slug: "", name_ar: site.region }, ...cities].map((c) => {
          const active = (city?.slug ?? "") === c.slug;
          return (
            <Link
              key={c.slug || "all"}
              href={c.slug ? `/cases/${slug}?city=${c.slug}` : `/cases/${slug}`}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 ${active ? "border-navy-700 bg-navy-700 text-white" : "border-line bg-card hover:border-navy-600"}`}
            >
              {c.name_ar}
            </Link>
          );
        })}
      </nav>

      <p className="mb-3 text-sm text-muted" role="status">
        {offices.length > 0 ? officesLabel(offices.length) : "لا توجد مكاتب مسجلة في هذا النوع حتى الآن"}
      </p>

      {offices.length > 0 ? (
        <ResultsList offices={offices} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center">
          <p className="font-semibold">نعمل على إضافة مكاتب في قضايا {name}.</p>
          <p className="mt-1 text-muted">تصفّح بقية المكاتب، فكثير منها يتولى أكثر من نوع.</p>
          <Link href="/search" className="mt-5 inline-block rounded-xl bg-gold-500 px-6 py-2.5 font-semibold text-navy-900 hover:bg-gold-400">
            عرض كل المكاتب
          </Link>
        </div>
      )}

      {siblings.length > 0 && (
        <section className="pt-10">
          <h2 className="mb-3 text-lg font-bold">أنواع أخرى في {root.name_ar}</h2>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((c) => (
              <li key={c.slug}>
                <Link href={`/cases/${c.slug}`} className="block rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium hover:border-gold-500 hover:bg-gold-100/60">
                  {c.name_ar}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <OfficeCta />
    </div>
  );
}
