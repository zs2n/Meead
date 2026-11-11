import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق ميعاد: استفسار، اقتراح، بلاغ عن مكتب أو تقييم، أو طلب شراكة.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="تواصل معنا" title="يسعدنا سماعك" lead="استفسار، اقتراح، أو بلاغ عن مكتب أو تقييم. اكتب لنا وسنرد عليك." />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 lg:grid-cols-[1fr_320px]">
        <section aria-label="نموذج التواصل" className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-7">
          <ContactForm />
        </section>

        <aside className="space-y-4">
          {(site.contactEmail || site.whatsapp) && (
            <div className="rounded-2xl border border-line bg-card p-5">
              <h2 className="mb-3 font-bold">تواصل مباشر</h2>
              <ul className="space-y-3 text-sm">
                {site.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${site.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1f8f4e] px-4 py-3 font-semibold text-white hover:bg-[#187a41]"
                    >
                      راسلنا على واتساب
                    </a>
                  </li>
                )}
                {site.contactEmail && (
                  <li>
                    <span className="block text-muted">البريد الإلكتروني</span>
                    <a href={`mailto:${site.contactEmail}`} className="ltr-nums font-semibold text-navy-600 underline">
                      {site.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-gold-100/50 p-5 text-sm">
            <h2 className="mb-2 font-bold">قبل أن تكتب لنا</h2>
            <ul className="space-y-2 text-ink/85">
              <li>
                تبحث عن محامٍ؟{" "}
                <Link href="/search" className="font-semibold text-navy-600 underline">ابحث في الدليل</Link>.
              </li>
              <li>
                تريد تسجيل مكتبك؟{" "}
                <Link href="/join" className="font-semibold text-navy-600 underline">سجّل من هنا</Link>.
              </li>
              <li>
                عندك سؤال عام؟ ربما إجابته في{" "}
                <Link href="/faq" className="font-semibold text-navy-600 underline">الأسئلة الشائعة</Link>.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
