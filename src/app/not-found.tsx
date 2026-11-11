import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "الصفحة غير موجودة", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-5xl font-bold text-gold-500">٤٠٤</p>
      <h1 className="mt-3 text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="mt-2 text-muted">ربما أُزيلت الصفحة أو أن الرابط غير صحيح.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/search" className="rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-navy-900 hover:bg-gold-400">
          ابحث عن مكتب
        </Link>
        <Link href="/" className="rounded-xl border border-navy-700 px-5 py-2.5 font-semibold text-navy-700 hover:bg-navy-50">
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
