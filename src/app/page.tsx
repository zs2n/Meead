import Link from "next/link";
import { OfficeCta, SearchCta } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { OfficeCard } from "@/components/office-card";
import { SearchForm } from "@/components/search-form";
import { getCities, getSiteStats, getSpecialtyTree, searchOffices } from "@/lib/data";
import { VISITOR_FAQ } from "@/lib/faq";
import { formatNumber } from "@/lib/format";
import { absoluteUrl, site } from "@/lib/site";

const steps = [
  { title: "حدّد قضيتك", body: "اختر التخصص ونوع القضية والمدينة، ونعرض لك المكاتب التي تتولى هذا النوع تحديداً." },
  { title: "قارن بثقة", body: "اطّلع على تخصصات كل مكتب وساعات عمله وتقييمات عملاء تواصلوا معه فعلاً، وقارن بين ثلاثة مكاتب جنباً إلى جنب." },
  { title: "تواصل مباشرة", body: "راسل المكتب على واتساب أو اتصل به بضغطة واحدة. بلا وسيط وبلا رسوم." },
];

const trust = [
  {
    title: "تراخيص متحقَّق منها",
    body: "نراجع رقم ترخيص المحاماة وصورته يدوياً قبل نشر أي مكتب.",
    icon: "M10 2l6 2.5v4.6c0 3.8-2.5 7.2-6 8.4-3.5-1.2-6-4.6-6-8.4V4.5L10 2zm-2.6 8.2l1.9 1.9 3.6-4",
  },
  {
    title: "تقييمات ممن تواصل فعلاً",
    body: "لا يقيّم إلا من تواصل مع المكتب عبر ميعاد، وكل تقييم يُراجَع قبل نشره.",
    icon: "M10 2.5l2.3 4.7 5.2.8-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2L2.5 8l5.2-.8L10 2.5z",
  },
  {
    title: "مجاني وبلا تسجيل",
    body: "ابحث وقارن وتواصل دون حساب ودون أي رسوم.",
    icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm-3.2 8.3l2.2 2.2 4.2-4.6",
  },
];

export default async function HomePage() {
  const [cities, specialties, stats, featured] = await Promise.all([
    getCities(),
    getSpecialtyTree(),
    getSiteStats(),
    searchOffices({ limit: 3 }),
  ]);
  const specialtyNames = specialties.map((s) => s.name_ar).join(" · ");
  const caseTypeCount = specialties.reduce((n, s) => n + s.children.length, 0);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": absoluteUrl("/#org"),
              name: site.name,
              url: site.url,
              logo: absoluteUrl("/icon.svg"),
              description: site.description,
              areaServed: ["الدمام", "الخبر"],
              ...(site.contactEmail ? { email: site.contactEmail } : {}),
              sameAs: Object.values(site.social).filter(Boolean),
            },
            {
              "@type": "WebSite",
              "@id": absoluteUrl("/#website"),
              url: site.url,
              name: site.name,
              inLanguage: "ar",
              publisher: { "@id": absoluteUrl("/#org") },
            },
          ],
        }}
      />

      {/* ---------- الواجهة ---------- */}
      <section className="relative overflow-hidden bg-navy-800 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #c9a465 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-12 sm:pt-20">
          <p className="mb-4 inline-block rounded-full border border-gold-400/40 px-3 py-1 text-xs text-gold-100">
            {specialtyNames} · {site.region}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.45] sm:text-5xl sm:leading-[1.35]">
            اختر محاميك بثقة،
            <br />
            <span className="text-gold-400">قبل أن تبدأ قضيتك.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            ميعاد يجمع لك مكاتب المحاماة المرخّصة في {site.region}. قارن بينها حسب نوع قضيتك وتقييمات عملائها، ثم
            تواصل مع المكتب مباشرة.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
            {["تراخيص متحقَّق منها", "تقييمات مُراجَعة", "مجاني بلا تسجيل"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="text-gold-400">
                  <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- البحث ---------- */}
      <section aria-label="ابحث عن مكتب" className="relative mx-auto -mt-16 max-w-6xl px-4">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-xl sm:p-6">
          <SearchForm cities={cities} specialties={specialties} />
        </div>
      </section>

      {/* ---------- أرقام حقيقية (تظهر عند توفر عدد كافٍ) ---------- */}
      {stats.offices >= 5 && (
        <section aria-label="ميعاد بالأرقام" className="mx-auto max-w-6xl px-4 pt-10">
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: stats.offices, l: "مكتباً موثّقاً" },
              { n: caseTypeCount, l: "نوع قضية" },
              { n: stats.reviews, l: "تقييماً مُراجَعاً" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-line bg-card p-4">
                <dt className="sr-only">{s.l}</dt>
                <dd>
                  <span className="block text-2xl font-bold text-navy-700 sm:text-3xl">{formatNumber(s.n)}</span>
                  <span className="text-xs text-muted sm:text-sm">{s.l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ---------- أنواع القضايا ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-2xl font-bold">ما نوع قضيتك؟</h2>
        <p className="mt-1 text-muted">اختر النوع لترى المكاتب التي تتولاه.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {specialties.map((s) => (
            <div key={s.slug} className="rounded-2xl border border-line bg-card p-5">
              <h3 className="mb-3 flex items-center justify-between gap-2 font-bold">
                {s.name_ar}
                <Link href={`/cases/${s.slug}`} className="text-sm font-medium text-navy-600 hover:underline">
                  كل المكاتب ←
                </Link>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {s.children.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/cases/${c.slug}`}
                      className="block rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-gold-500 hover:bg-gold-100/60"
                    >
                      {c.name_ar}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- مكاتب من الدليل ---------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">مكاتب موثّقة في ميعاد</h2>
              <p className="mt-1 text-muted">مرتبة حسب تقييم العملاء.</p>
            </div>
            <Link href="/search" className="shrink-0 text-sm font-semibold text-navy-600 hover:underline">
              عرض الكل ←
            </Link>
          </div>
          <ul className="grid gap-3 lg:grid-cols-3">
            {featured.map((o) => (
              <li key={o.id}>
                <OfficeCard office={o} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- كيف يعمل ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="mb-6 text-2xl font-bold">ثلاث خطوات فقط</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-card p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-lg font-bold text-gold-400">
                {formatNumber(i + 1)}
              </span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-ink/80">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- لماذا ميعاد ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="mb-6 text-2xl font-bold">لماذا تثق بميعاد؟</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {trust.map((t) => (
            <div key={t.title} className="rounded-2xl bg-gold-100/50 p-5">
              <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden="true" className="mb-3 text-gold-700">
                <path d={t.icon} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="font-bold">{t.title}</h3>
              <p className="mt-1 text-ink/80">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          تعرّف على طريقة عملنا في صفحة{" "}
          <Link href="/about" className="font-semibold text-navy-600 underline">
            من نحن
          </Link>
          .
        </p>
      </section>

      {/* ---------- أسئلة شائعة ---------- */}
      <section className="mx-auto max-w-3xl px-4 pt-14">
        <h2 className="mb-6 text-center text-2xl font-bold">أسئلة شائعة</h2>
        <FaqList items={VISITOR_FAQ.slice(0, 4)} />
        <p className="mt-4 text-center">
          <Link href="/faq" className="text-sm font-semibold text-navy-600 underline">
            كل الأسئلة الشائعة
          </Link>
        </p>
      </section>

      <SearchCta />
      <OfficeCta />
    </>
  );
}
