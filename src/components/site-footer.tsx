import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted sm:grid-cols-[auto_1fr] sm:items-start">
        <Logo className="text-ink" />
        <div className="space-y-2 sm:ps-8">
          <p>
            ميعاد دليل للتعريف بمكاتب المحاماة والتواصل معها، ولا يقدّم استشارات قانونية ولا يُعدّ طرفاً في
            العلاقة بين العميل والمكتب.
          </p>
          <p>جميع المكاتب المعروضة تم التحقق من تراخيصها قبل نشرها، ولا تُنشر التقييمات إلا بعد مراجعتها.</p>
          <p className="text-xs">© {new Date().getFullYear()} ميعاد</p>
        </div>
      </div>
    </footer>
  );
}
