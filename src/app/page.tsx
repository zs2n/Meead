import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { getCities, getSpecialtyTree } from "@/lib/data";

export const revalidate = 300;

const steps = [
  { title: "اختر نوع قضيتك", body: "حدّد التخصص ونوع القضية والمدينة، ونعرض لك المكاتب المناسبة." },
  { title: "قارن بين المكاتب", body: "اطّلع على التخصصات وساعات العمل وتقييمات عملاء تواصلوا فعلاً." },
  { title: "تواصل مباشرة", body: "راسل المكتب عبر واتساب أو اتصل أو أرسل بريداً بضغطة واحدة." },
];

const trust = [
  { title: "تراخيص موثّقة", body: "لا يُنشر أي مكتب قبل التحقق من رخصته يدوياً." },
  { title: "تقييمات حقيقية", body: "لا يقيّم إلا من تواصل مع المكتب عبر ميعاد، وكل تقييم يُراجع قبل نشره." },
  { title: "بلا رسوم عليك", body: "البحث والمقارنة والتواصل مجانية تماماً." },
];

export default async function HomePage() {
  const [cities, specialties] = await Promise.all([getCities(), getSpecialtyTree()]);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-800 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c9a465 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 sm:pt-20">
          <p className="mb-3 inline-block rounded-full border border-gold-400/40 px-3 py-1 text-xs text-gold-100">
            الأحوال الشخصية · الدمام والخبر
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-[1.4] sm:text-5xl sm:leading-[1.3]">
            المحامي المناسب لقضيتك،
            <br />
            <span className="text-gold-400">في ميعاد.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            دليل موثوق لمكاتب المحاماة المرخّصة. قارن بين المكاتب وتخصصاتها وتقييمات عملائها، ثم تواصل مع
            من تختاره مباشرة.
          </p>
        </div>
      </section>

      <section className="relative mx-auto -mt-14 max-w-6xl px-4">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-lg sm:p-6">
          <SearchForm cities={cities} specialties={specialties} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="mb-6 text-xl font-bold">كيف يعمل ميعاد؟</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-card p-5">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 font-bold text-gold-400">
                {new Intl.NumberFormat("ar-SA").format(i + 1)}
              </span>
              <h3 className="font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="grid gap-4 rounded-2xl bg-gold-100/60 p-6 sm:grid-cols-3">
          {trust.map((t) => (
            <div key={t.title}>
              <h3 className="font-bold text-gold-700">{t.title}</h3>
              <p className="mt-1 text-sm text-ink/80">{t.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5 sm:flex-row">
          <div>
            <h3 className="font-bold">هل تدير مكتب محاماة؟</h3>
            <p className="text-sm text-muted">سجّل مكتبك في ميعاد واستقبل طلبات العملاء الباحثين عن محامٍ في تخصصك.</p>
          </div>
          <Link href="/join" className="shrink-0 rounded-xl bg-navy-700 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">
            سجّل مكتبك
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          ميعاد منصة للتعريف والتواصل فقط، ولا تقدّم استشارات قانونية.
        </p>
      </section>
    </>
  );
}
