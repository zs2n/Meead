import type { Metadata } from "next";
import Link from "next/link";
import { OfficeCta, SearchCta } from "@/components/cta-band";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "من نحن",
  description: `ميعاد دليل مستقل لمكاتب المحاماة المرخّصة في ${site.region}. تعرّف على طريقة تحققنا من المكاتب ومراجعة التقييمات.`,
  alternates: { canonical: "/about" },
};

const verification = [
  { title: "طلب موثّق", body: "يرسل المكتب بياناته كاملة مع رقم ترخيص المحاماة وصورة منه." },
  { title: "مراجعة يدوية", body: "يراجع فريق ميعاد الترخيص يدوياً. الطلب الناقص أو غير الواضح يُعاد لصاحبه مع السبب." },
  { title: "نشر بعد الاعتماد فقط", body: "لا يظهر المكتب للزوار إلا بعد اعتماده. وأي تغيير في بيانات الترخيص يعيده للمراجعة." },
];

const reviews = [
  { title: "التقييم لمن تواصل فقط", body: "نموذج التقييم لا يظهر إلا لمن تواصل مع المكتب عبر أزرار ميعاد." },
  { title: "تقييم واحد لكل تواصل", body: "كل تواصل يتيح تقييماً واحداً، فلا يمكن إغراق مكتب بالتقييمات." },
  { title: "مراجعة قبل النشر", body: "نراجع كل تقييم قبل ظهوره، ونرفض ما فيه إساءة أو بيانات شخصية أو تفاصيل قضايا." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="من نحن"
        title="نجعل اختيار المحامي أوضح وأسهل"
        lead={`اختيار محامٍ قرار مهم، وغالباً يُتخذ على عجل وبمعلومات قليلة. ميعاد يجمع مكاتب المحاماة المرخّصة في ${site.region} في مكان واحد، لتقارن وتختار وأنت مطمئن.`}
      />

      <div className="mx-auto max-w-6xl px-4">
        <section className="pt-12">
          <h2 className="text-2xl font-bold">ما هو ميعاد؟</h2>
          <div className="mt-3 max-w-3xl space-y-3 text-ink/85">
            <p>
              ميعاد دليل لمكاتب المحاماة. تبحث فيه حسب نوع قضيتك ومدينتك، فترى المكاتب التي تتولى هذا النوع،
              وتخصصاتها وساعات عملها وتقييمات عملائها، ثم تتواصل مع المكتب الذي تختاره مباشرة.
            </p>
            <p>
              لا نقدّم استشارات قانونية، ولسنا طرفاً في الاتفاق بينك وبين المكتب. دورنا أن تصل إلى المكتب
              المناسب بمعلومات موثوقة.
            </p>
          </div>
        </section>

        <section className="pt-12">
          <h2 className="text-2xl font-bold">كيف نتحقق من المكاتب؟</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {verification.map((v, i) => (
              <li key={v.title} className="rounded-2xl border border-line bg-card p-5">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 font-bold text-gold-400">
                  {new Intl.NumberFormat("ar-SA").format(i + 1)}
                </span>
                <h3 className="font-bold">{v.title}</h3>
                <p className="mt-1 text-ink/80">{v.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pt-12">
          <h2 className="text-2xl font-bold">كيف نحافظ على صدق التقييمات؟</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {reviews.map((v) => (
              <div key={v.title} className="rounded-2xl bg-gold-100/50 p-5">
                <h3 className="font-bold">{v.title}</h3>
                <p className="mt-1 text-ink/80">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <h2 className="text-2xl font-bold">كيف تُرتَّب المكاتب؟</h2>
          <p className="mt-3 max-w-3xl text-ink/85">
            ترتيب نتائج البحث يعتمد على تقييمات العملاء، ويمكنك تغييره إلى «الأكثر تقييمات» أو «الأحدث انضماماً».
            البحث والتواصل مجانيان للزوار، وتسجيل المكاتب مجاني في المرحلة الحالية.
          </p>
          <p className="mt-3 text-ink/85">
            عندك ملاحظة أو اقتراح؟{" "}
            <Link href="/contact" className="font-semibold text-navy-600 underline">
              تواصل معنا
            </Link>
            .
          </p>
        </section>
      </div>

      <SearchCta />
      <OfficeCta />
    </>
  );
}
