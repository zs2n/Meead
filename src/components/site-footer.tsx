import Link from "next/link";
import { getSpecialtyTree } from "@/lib/data";
import { site } from "@/lib/site";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const SOCIAL_LABEL: Record<keyof typeof site.social, string> = {
  x: "إكس",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  snapchat: "سناب شات",
  linkedin: "لينكدإن",
};

export async function SiteFooter() {
  const tree = await getSpecialtyTree().catch(() => []);
  const socials = (Object.keys(site.social) as (keyof typeof site.social)[]).filter((k) => site.social[k]);

  return (
    <footer className="mt-20 bg-navy-900 text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] [&>*]:min-w-0">
          <div className="space-y-3">
            <Logo className="text-white" />
            <p className="text-sm leading-7">
              دليل مكاتب المحاماة المرخّصة في {site.region}. نساعدك على اختيار المكتب المناسب لقضيتك والتواصل
              معه مباشرة.
            </p>
            {(site.contactEmail || site.whatsapp) && (
              <ul className="space-y-1 text-sm">
                {site.contactEmail && (
                  <li>
                    <a href={`mailto:${site.contactEmail}`} className="ltr-nums hover:text-white">
                      {site.contactEmail}
                    </a>
                  </li>
                )}
                {site.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${site.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white"
                    >
                      واتساب المنصة
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>

          <nav aria-label="للباحثين عن محامٍ">
            <h2 className="mb-3 text-sm font-bold text-white">للباحثين عن محامٍ</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white">ابحث عن مكتب</Link></li>
              {tree.map((s) => (
                <li key={s.slug}>
                  <Link href={`/search?specialty=${s.slug}`} className="hover:text-white">
                    محامو {s.name_ar}
                  </Link>
                </li>
              ))}
              <li><Link href="/faq" className="hover:text-white">الأسئلة الشائعة</Link></li>
            </ul>
          </nav>

          <nav aria-label="روابط ميعاد">
            <h2 className="mb-3 text-sm font-bold text-white">ميعاد</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-white">تواصل معنا</Link></li>
              <li><Link href="/join" className="hover:text-white">سجّل مكتبك</Link></li>
              <li><Link href="/login" className="hover:text-white">دخول المكاتب</Link></li>
              <li><Link href="/privacy" className="hover:text-white">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-white">الشروط والأحكام</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-1 text-sm font-bold text-white">مدن وتخصصات جديدة قريباً</h2>
            <p className="mb-3 text-sm">اترك بريدك ونخبرك عند توسّع ميعاد.</p>
            <NewsletterForm />
            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {socials.map((k) => (
                  <li key={k}>
                    <a
                      href={site.social[k]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/20 px-3 py-1.5 hover:border-gold-400 hover:text-white"
                    >
                      {SOCIAL_LABEL[k]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 space-y-2 border-t border-white/10 pt-6 text-xs leading-6 text-white/60">
          <p>
            ميعاد منصة للتعريف بمكاتب المحاماة والتواصل معها، ولا تقدّم استشارات قانونية ولا تُعدّ طرفاً في العلاقة
            بين العميل والمكتب. المكاتب المعروضة تم التحقق من تراخيصها قبل النشر، والتقييمات تُراجَع قبل ظهورها.
          </p>
          <p>© {new Date().getFullYear()} ميعاد. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
