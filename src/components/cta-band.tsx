import Link from "next/link";

/** دعوة ختامية موحّدة في أسفل الصفحات العامة */
export function SearchCta({ title = "جاهز تختار محاميك؟", body = "ابحث حسب نوع قضيتك وقارن بين المكاتب الموثّقة في دقيقة." }: { title?: string; body?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-navy-800 p-6 text-center text-white sm:flex-row sm:p-8 sm:text-start">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          <p className="mt-1 text-white/80">{body}</p>
        </div>
        <Link href="/search" className="shrink-0 rounded-xl bg-gold-500 px-7 py-3 font-semibold text-navy-900 hover:bg-gold-400">
          ابحث عن مكتب
        </Link>
      </div>
    </section>
  );
}

export function OfficeCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-gold-400/50 bg-gold-100/50 p-6 text-center sm:flex-row sm:p-8 sm:text-start">
        <div>
          <h2 className="text-xl font-bold">هل تدير مكتب محاماة؟</h2>
          <p className="mt-1 text-ink/80">سجّل مكتبك مجاناً واستقبل طلبات عملاء يبحثون عن تخصصك في منطقتك.</p>
        </div>
        <Link href="/join" className="shrink-0 rounded-xl bg-navy-700 px-7 py-3 font-semibold text-white hover:bg-navy-800">
          سجّل مكتبك مجاناً
        </Link>
      </div>
    </section>
  );
}
