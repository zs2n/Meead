import type { Metadata } from "next";
import Link from "next/link";
import { SearchCta } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { OFFICE_FAQ, VISITOR_FAQ } from "@/lib/faq";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن أكثر الأسئلة حول ميعاد: هل هو مجاني؟ كيف نتحقق من المكاتب؟ هل التقييمات حقيقية؟ وكيف يسجّل المكتب؟",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const all = [...VISITOR_FAQ, ...OFFICE_FAQ];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: all.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <PageHeader eyebrow="الأسئلة الشائعة" title="كل ما تريد معرفته عن ميعاد" lead="لم تجد إجابتك؟ راسلنا وسنرد عليك." />

      <div className="mx-auto max-w-3xl space-y-10 px-4 pt-10">
        <section>
          <h2 className="mb-4 text-xl font-bold">للباحثين عن محامٍ</h2>
          <FaqList items={VISITOR_FAQ} />
        </section>
        <section>
          <h2 className="mb-4 text-xl font-bold">لمكاتب المحاماة</h2>
          <FaqList items={OFFICE_FAQ} />
        </section>
        <p className="text-center">
          <Link href="/contact" className="inline-block rounded-xl border border-navy-700 px-6 py-2.5 font-semibold text-navy-700 hover:bg-navy-50">
            عندي سؤال آخر
          </Link>
        </p>
      </div>
      <SearchCta />
    </>
  );
}
